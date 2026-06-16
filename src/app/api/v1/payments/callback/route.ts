import { z } from "zod";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { processKNetCallback, verifyKNetSignature } from "@/lib/knet";
import { generateQRCodesForBooking } from "@/lib/qr-utils";
import { sendBookingConfirmationEmail, sendPaymentFailureEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { updateEventMinPrice } from "@/lib/update-event-prices";

const knetCallbackSchema = z.object({
  paymentId: z.string().min(1),
  result: z.string().min(1),
  transactionId: z.string().optional(),
  amount: z.string().optional(),
  authCode: z.string().optional(),
  signature: z.string().optional(),
});

/**
 * POST /api/v1/payments/callback
 * KNet server-to-server callback بعد الدفع
 * Auth: public (KNet server) — نتحقق من signature بدلاً من auth
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    logger.info("knet-callback", "Received callback", { body });

    const parsed = knetCallbackSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid callback data", undefined, 400);
    }
    const callbackData = parsed.data;

    // 1. تحقق من signature (إلزامي في production)
    if (process.env.NODE_ENV === "production") {
      if (!callbackData.signature) {
        logger.error("knet-callback", "Missing signature in production");
        return errorResponse("UNAUTHORIZED", "Missing signature", undefined, 401);
      }
      const secretKey = process.env.KNET_SECRET_KEY!;
      const dataToVerify = `${callbackData.paymentId}|${callbackData.result}|${callbackData.transactionId ?? ""}|${callbackData.amount ?? ""}`;
      const isValid = verifyKNetSignature(callbackData.signature, dataToVerify, secretKey);
      if (!isValid) {
        logger.error("knet-callback", "Invalid signature");
        return errorResponse("UNAUTHORIZED", "Invalid signature", undefined, 401);
      }
    }

    // 2. معالجة بيانات Callback
    const result = processKNetCallback(callbackData);

    // 3. ابحث عن Payment بواسطة knetPaymentId
    const payment = await db.payment.findFirst({
      where: { knetPaymentId: result.paymentId },
      include: {
        booking: {
          include: {
            event: {
              select: {
                titleAr: true,
                startDate: true,
                startTime: true,
                venue: { select: { nameAr: true } },
              },
            },
            tickets: {
              include: {
                ticketTier: { select: { nameAr: true, price: true } },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      logger.error("knet-callback", "Payment not found", { paymentId: result.paymentId });
      return errorResponse("PAYMENT_NOT_FOUND", "Payment not found", undefined, 404);
    }

    // Check if payment already processed (idempotency)
    if (payment.status === "SUCCESS" && result.success) {
      logger.info("knet-callback", "Payment already processed", { paymentId: payment.id });
      return successResponse(
        { payment: { id: payment.id, status: "SUCCESS", transactionId: payment.transactionId } },
        "Payment already processed"
      );
    }

    // 4. تحديث بناءً على النتيجة
    if (result.success) {
      // === الدفع ناجح ===
      await db.$transaction(async (tx) => {
        // حدّث Payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            transactionId: result.transactionId ?? `txn_${Date.now()}`,
            knetResult: JSON.stringify(body),
          },
        });

        // حدّث Booking
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: "CONFIRMED" },
        });
      });

      // ولّد QR codes (خارج transaction لأنه لا يحتاج atomicity)
      await generateQRCodesForBooking(payment.bookingId);

      // أرسل بريد تأكيد
      const booking = payment.booking;
      sendBookingConfirmationEmail({
        to: booking.attendeeEmail,
        attendeeName: booking.attendeeName,
        bookingNumber: booking.bookingNumber,
        eventTitle: booking.event.titleAr,
        eventDate: new Date(booking.event.startDate).toLocaleDateString("ar-KW", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        eventTime: booking.event.startTime,
        venueName: booking.event.venue?.nameAr ?? "غير محدد",
        ticketCount: booking.quantity,
        totalAmount: booking.totalAmount.toString(),
        bookingId: booking.id,
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      }).catch((err: unknown) => logger.error("knet-callback", "Confirmation email failed", err));

      logger.info("knet-callback", "Payment SUCCESS", { bookingId: payment.bookingId });

      // حدّث الحد الأدنى للسعر بعد تأكيد الحجز (قد يتغير إذا أصبحت الفعالية مباعة بالكامل)
      await updateEventMinPrice(payment.booking.eventId);
    } else {
      // === الدفع فشل ===
      const booking = payment.booking;

      await db.$transaction(async (tx) => {
        // حدّث Payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            transactionId: result.transactionId,
            knetResult: JSON.stringify(body),
          },
        });

        // حرّر التذاكر (decrement quantitySold)
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
          where: { id: payment.bookingId },
          data: { status: "CANCELLED" },
        });
      });

      // أرسل بريد فشل
      sendPaymentFailureEmail({
        to: booking.attendeeEmail,
        attendeeName: booking.attendeeName,
        bookingNumber: booking.bookingNumber,
        eventTitle: booking.event.titleAr,
      }).catch((err: unknown) => logger.error("knet-callback", "Failure email failed", err));

      logger.info("knet-callback", "Payment FAILED", { bookingId: payment.bookingId });

      // حدّث الحد الأدنى للسعر بعد تحرير التذاكر
      await updateEventMinPrice(payment.booking.eventId);
    }

    return successResponse(
      {
        payment: {
          id: payment.id,
          status: result.success ? "SUCCESS" : "FAILED",
          transactionId: result.transactionId,
        },
      },
      result.success ? "تم الدفع بنجاح" : "فشل الدفع"
    );
  } catch (error: unknown) {
    logger.error("knet-callback", "Callback error", error);
    return errorResponse("INTERNAL_ERROR", "Callback processing error", undefined, 500);
  }
}
