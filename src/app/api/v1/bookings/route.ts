import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createBookingSchema } from "@/lib/validators/booking-schema";
import { getCurrentUser } from "@/lib/auth-server";
import { generateBookingNumber, generateTicketNumber, getBookingExpiry } from "@/lib/booking-utils";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import type { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";
import { updateEventMinPrice } from "@/lib/update-event-prices";

/**
 * POST /api/v1/bookings — إنشاء حجز مبدئي
 */
export async function POST(req: Request) {
  try {
    // Rate limit check
    const rateLimitResult = checkRateLimit(getClientIdentifier(req), { limit: 10, windowSeconds: 60 });
    if (!rateLimitResult.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429);
    }

    // 1. تحقق من المصادقة
    const dbUser = await getCurrentUser();
    if (!dbUser) return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);

    // 2. تحقق من البيانات
    const body = await req.json();
    const parsed = createBookingSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return errorResponse("VALIDATION_ERROR", firstError.message, firstError.path[0]?.toString(), 400);
    }

    const { eventId, attendeeName, attendeePhone, attendeeEmail, tickets } = parsed.data;

    // 4. تحقق من وجود الفعالية
    const event = await db.event.findUnique({
      where: { id: eventId, status: "PUBLISHED", deletedAt: null },
      include: { ticketTiers: {} },
    });
    if (!event) return errorResponse("EVENT_NOT_FOUND", "الفعالية غير موجودة", undefined, 404);

    // 5. تحقق من توفر التذاكر واحسب الكميات
    let totalAmount = 0;
    let totalQuantity = 0;
    const ticketRecords: { ticketTierId: string; quantity: number; price: string; maxPerBooking: number }[] = [];

    for (const item of tickets) {
      const tier = event.ticketTiers.find((t) => t.id === item.ticketTierId);
      if (!tier) {
        return errorResponse("VALIDATION_ERROR", `فئة التذكرة ${item.ticketTierId} غير موجودة`, "ticketTierId", 400);
      }

      const available = tier.quantityTotal - tier.quantitySold;
      if (item.quantity > available) {
        return errorResponse("TICKETS_UNAVAILABLE", `التذاكر المتوفرة لفئة "${tier.nameAr}" هي ${available} فقط`, undefined, 409);
      }

      if (item.quantity > tier.maxPerBooking) {
        return errorResponse("VALIDATION_ERROR", `الحد الأقصى للحجز لفئة "${tier.nameAr}" هو ${tier.maxPerBooking}`, undefined, 400);
      }

      const tierTotal = parseFloat(tier.price) * item.quantity;
      totalAmount += tierTotal;
      totalQuantity += item.quantity;
      ticketRecords.push({
        ticketTierId: tier.id,
        quantity: item.quantity,
        price: tier.price,
        maxPerBooking: tier.maxPerBooking,
      });
    }

    // Format total as KWD string with 3 decimals
    const totalAmountStr = totalAmount.toFixed(3);

    // 6. أنشئ الحجز والتذاكر في transaction واحد
    const booking = await db.$transaction(async (tx) => {
      // أنشئ الحجز
      const newBooking = await tx.booking.create({
        data: {
          bookingNumber: generateBookingNumber(),
          status: "PENDING",
          totalAmount: totalAmountStr,
          quantity: totalQuantity,
          attendeeName,
          attendeePhone,
          attendeeEmail,
          userId: dbUser.id,
          eventId,
        },
      });

      // أنشئ التذاكر + حدّث quantitySold مع التحقق من التوفر
      const createdTickets: Array<{ id: string; ticketNumber: string }> = [];
      for (const record of ticketRecords) {
        // تحقق من التوفر داخل transaction بشكل صحيح
        const tier = await tx.ticketTier.findUnique({
          where: { id: record.ticketTierId },
          select: { quantitySold: true, quantityTotal: true },
        });

        if (!tier || tier.quantitySold + record.quantity > tier.quantityTotal) {
          throw new Error(`فئة التذكرة غير متوفرة بعد الآن`);
        }

        // حدّث quantitySold بشكل ذري
        await tx.ticketTier.update({
          where: { id: record.ticketTierId },
          data: { quantitySold: { increment: record.quantity } },
        });

        // أنشئ التذاكر الفردية
        for (let i = 0; i < record.quantity; i++) {
          const ticket = await tx.ticket.create({
            data: {
              ticketNumber: generateTicketNumber(),
              ticketTierId: record.ticketTierId,
              bookingId: newBooking.id,
            },
          });
          createdTickets.push(ticket);
        }
      }

      return { ...newBooking, tickets: createdTickets };
    });

    // 7. حدّث الحد الأدنى للسعر بعد تغيير quantitySold
    await updateEventMinPrice(eventId);

    // 8. أرجع النتيجة مع معلومات انتهاء الصلاحية
    const expiresAt = getBookingExpiry();

    return successResponse(
      {
        booking: {
          id: booking.id,
          bookingNumber: booking.bookingNumber,
          status: booking.status,
          totalAmount: booking.totalAmount,
          quantity: booking.quantity,
          event: {
            id: event.id,
            titleAr: event.titleAr,
          },
          tickets: booking.tickets.map((t: { id: string; ticketNumber: string }) => ({
            id: t.id,
            ticketNumber: t.ticketNumber,
          })),
          expiresAt: expiresAt.toISOString(),
        },
      },
      "تم حجز التذاكر مبدئياً، يرجى إتمام الدفع خلال 15 دقيقة"
    );
  } catch (error: unknown) {
    logger.error("booking", "Error creating booking", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في إنشاء الحجز", undefined, 500);
  }
}

/**
 * GET /api/v1/bookings — قائمة حجوزات المستخدم
 */
export async function GET(req: Request) {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const status = searchParams.get("status");

    const where: Prisma.BookingWhereInput = {
      userId: dbUser.id,
      deletedAt: null,
    };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where,
        include: {
          event: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              slug: true,
              coverImageUrl: true,
              startDate: true,
              startTime: true,
              venue: { select: { nameAr: true } },
            },
          },
          tickets: {
            include: {
              ticketTier: { select: { nameAr: true, nameEn: true, price: true } },
            },
          },
          payment: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.booking.count({ where }),
    ]);

    // Prices are already strings in SQLite, no conversion needed
    const bookingsWithStringAmounts = bookings.map((b) => ({
      ...b,
      tickets: b.tickets.map((t) => ({
        ...t,
        ticketTier: {
          ...t.ticketTier,
        },
      })),
    }));

    return successResponse(
      { bookings: bookingsWithStringAmounts },
      "تم جلب الحجوزات",
      { page, limit, total, totalPages: Math.ceil(total / limit) }
    );
  } catch (error: unknown) {
    logger.error("booking", "Error fetching bookings", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في جلب الحجوزات", undefined, 500);
  }
}
