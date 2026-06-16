import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-server";
import { logger } from "@/lib/logger";

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

    // Prices are already strings in SQLite
    return successResponse(
      {
        booking: {
          ...booking,
          tickets: booking.tickets.map((t) => ({
            ...t,
            ticketTier: { ...t.ticketTier },
          })),
          payment: booking.payment
            ? { ...booking.payment }
            : null,
        },
      },
      "تم جلب تفاصيل الحجز"
    );
  } catch (error: unknown) {
    logger.error("booking-detail", "Error fetching booking", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ", undefined, 500);
  }
}
