import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { refundPaymentSchema } from "@/lib/validators/payment-schema";
import { refundKNetPayment } from "@/lib/knet";
import { getCurrentUser } from "@/lib/auth-server";
import { logger } from "@/lib/logger";
import { updateEventMinPrice } from "@/lib/update-event-prices";

/**
 * POST /api/v1/payments/:id/refund
 * استرداد المبلغ — المنظم أو الأدمن فقط
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);

    // فقط ORGANIZER أو ADMIN يمكنهم الاسترداد
    if (dbUser.role !== "ORGANIZER" && dbUser.role !== "ADMIN") {
      return errorResponse("FORBIDDEN", "ليس لديك صلاحية الاسترداد", undefined, 403);
    }

    const { id } = await params;

    // تحقق من البيانات
    const body = await req.json();
    const parsed = refundPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", parsed.error.issues[0].message, undefined, 400);
    }

    const { reason } = parsed.data;

    // ابحث عن الدفع
    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            event: { select: { organizerId: true } },
            tickets: true,
          },
        },
      },
    });

    if (!payment) return errorResponse("PAYMENT_NOT_FOUND", "الدفع غير موجود", undefined, 404);
    if (payment.status !== "SUCCESS") {
      return errorResponse("VALIDATION_ERROR", "يمكن استرداد المدفوعات الناجحة فقط", undefined, 400);
    }

    // تحقق من الملكية (organizer يملك الفعالية) أو admin
    if (dbUser.role !== "ADMIN" && payment.booking.event.organizerId !== dbUser.id) {
      return errorResponse("FORBIDDEN", "ليس لديك صلاحية استرداد هذا الدفع", undefined, 403);
    }

    // اطلب الاسترداد من KNet
    const knetResult = await refundKNetPayment({
      paymentId: payment.knetPaymentId ?? "",
      transactionId: payment.transactionId ?? "",
      amount: payment.amount,
      reason,
    });

    if (!knetResult.success) {
      return errorResponse("PAYMENT_FAILED", "فشل طلب الاسترداد من KNet", undefined, 422);
    }

    // حدّث DB
    await db.$transaction(async (tx) => {
      // حدّث Payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "REFUNDED",
          refundedAt: new Date(),
          refundReason: reason,
        },
      });

      // حدّث Booking
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: "REFUNDED" },
      });

      // حرّر التذاكر (decrement quantitySold)
      const tierQuantities = new Map<string, number>();
      for (const ticket of payment.booking.tickets) {
        tierQuantities.set(ticket.ticketTierId, (tierQuantities.get(ticket.ticketTierId) ?? 0) + 1);
      }
      for (const [tierId, qty] of tierQuantities) {
        await tx.ticketTier.update({
          where: { id: tierId },
          data: { quantitySold: { decrement: qty } },
        });
      }

      // احذف التذاكر
      await tx.ticket.deleteMany({ where: { bookingId: payment.bookingId } });
    });

    // حدّث الحد الأدنى للسعر بعد تحرير التذاكر
    await updateEventMinPrice(payment.booking.eventId);

    return successResponse(
      {
        payment: {
          id: payment.id,
          status: "REFUNDED",
          refundedAt: new Date().toISOString(),
        },
      },
      "تم الاسترداد بنجاح"
    );
  } catch (error: unknown) {
    logger.error("payment-refund", "Error refunding payment", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في الاسترداد", undefined, 500);
  }
}
