import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-server";
import { logger } from "@/lib/logger";
import { serializeDecimal } from "@/lib/decimal-serialize";

/**
 * GET /api/v1/bookings/:id — تفاصيل حجز
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);

    const { id } = await params;
    const booking = await db.booking.findUnique({
      where: { id, deletedAt: null },
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
            endTime: true,
            venue: { select: { nameAr: true, address: true, city: true } },
          },
        },
        tickets: {
          include: {
            ticketTier: { select: { nameAr: true, nameEn: true, type: true, price: true } },
          },
        },
        payment: true,
      },
    });

    if (!booking) return errorResponse("BOOKING_NOT_FOUND", "الحجز غير موجود", undefined, 404);
    if (booking.userId !== dbUser.id && dbUser.role !== "ADMIN") {
      return errorResponse("FORBIDDEN", "ليس لديك صلاحية لعرض هذا الحجز", undefined, 403);
    }

    // Convert Prisma Decimal fields (totalAmount, ticketTier.price, payment.amount) to strings
    const serialized = serializeDecimal({
      ...booking,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      event: {
        ...booking.event,
        startDate: booking.event.startDate.toISOString(),
      },
      tickets: booking.tickets.map((t) => ({
        ...t,
        ticketTier: { ...t.ticketTier },
      })),
      payment: booking.payment
        ? {
            ...booking.payment,
            createdAt: booking.payment.createdAt.toISOString(),
            updatedAt: booking.payment.updatedAt.toISOString(),
            refundedAt: booking.payment.refundedAt?.toISOString() ?? null,
          }
        : null,
    });

    return successResponse(
      {
        booking: serialized,
      },
      "تم جلب تفاصيل الحجز"
    );
  } catch (error: unknown) {
    logger.error("booking-detail", "Error fetching booking", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ", undefined, 500);
  }
}
