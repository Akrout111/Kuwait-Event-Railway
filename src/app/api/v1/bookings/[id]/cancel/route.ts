import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-server";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { updateEventMinPrice } from "@/lib/update-event-prices";

/**
 * PATCH /api/v1/bookings/:id/cancel — إلغاء حجز
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit check
    const rateLimitResult = checkRateLimit(getClientIdentifier(req), { limit: 5, windowSeconds: 60 });
    if (!rateLimitResult.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429);
    }

    const dbUser = await getCurrentUser();
    if (!dbUser) return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);

    const { id } = await params;
    const booking = await db.booking.findUnique({
      where: { id, deletedAt: null },
      include: { tickets: true },
    });

    if (!booking) return errorResponse("BOOKING_NOT_FOUND", "الحجز غير موجود", undefined, 404);
    if (booking.userId !== dbUser.id && dbUser.role !== "ADMIN") {
      return errorResponse("FORBIDDEN", "ليس لديك صلاحية لإلغاء هذا الحجز", undefined, 403);
    }
    if (booking.status !== "PENDING") {
      return errorResponse("VALIDATION_ERROR", "يمكن إلغاء الحجوزات المعلقة فقط", undefined, 400);
    }

    // حرّر التذاكر + ألغِ الحجز في transaction
    await db.$transaction(async (tx) => {
      // حرّر quantitySold لكل فئة تذكرة
      const tierQuantities = new Map<string, number>();
      for (const ticket of booking.tickets) {
        tierQuantities.set(ticket.ticketTierId, (tierQuantities.get(ticket.ticketTierId) ?? 0) + 1);
      }

      for (const [tierId, qty] of tierQuantities) {
        await tx.ticketTier.update({
          where: { id: tierId },
          data: { quantitySold: { decrement: qty } },
        });
      }

      // احذف التذاكر
      await tx.ticket.deleteMany({ where: { bookingId: booking.id } });

      // ألغِ الحجز
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" },
      });
    });

    // حدّث الحد الأدنى للسعر بعد تغيير quantitySold
    await updateEventMinPrice(booking.eventId);

    return successResponse(
      { booking: { id: booking.id, status: "CANCELLED" } },
      "تم إلغاء الحجز وتحرير التذاكر"
    );
  } catch (error: unknown) {
    logger.error("booking-cancel", "Error cancelling booking", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في إلغاء الحجز", undefined, 500);
  }
}
