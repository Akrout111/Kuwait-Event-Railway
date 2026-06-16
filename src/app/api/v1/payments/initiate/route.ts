import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { initiatePaymentSchema } from "@/lib/validators/payment-schema";
import { initiateKNetPayment } from "@/lib/knet";
import { getCurrentUser } from "@/lib/auth-server";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

/**
 * POST /api/v1/payments/initiate
 * بدء عملية الدفع — يُنشئ Payment record ويُرجع redirect URL
 */
export async function POST(req: Request) {
  try {
    // Rate limit check
    const rateLimitResult = checkRateLimit(getClientIdentifier(req), { limit: 5, windowSeconds: 60 });
    if (!rateLimitResult.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429);
    }

    // 1. تحقق من المصادقة
    const dbUser = await getCurrentUser();
    if (!dbUser) return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);

    // 2. تحقق من البيانات
    const body = await req.json();
    const parsed = initiatePaymentSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", parsed.error.issues[0].message, undefined, 400);
    }

    const { bookingId, method } = parsed.data;

    // 3. تحقق من الحجز
    const booking = await db.booking.findUnique({
      where: { id: bookingId, deletedAt: null },
      include: { event: true },
    });

    if (!booking) return errorResponse("BOOKING_NOT_FOUND", "الحجز غير موجود", undefined, 404);
    if (booking.userId !== dbUser.id) return errorResponse("FORBIDDEN", "ليس حجزك", undefined, 403);
    if (booking.status !== "PENDING") return errorResponse("VALIDATION_ERROR", "الحجز ليس معلقاً", undefined, 400);

    // تحقق من عدم انتهاء الصلاحية
    const createdAt = new Date(booking.createdAt).getTime();
    const expiryTime = createdAt + 15 * 60 * 1000;
    if (Date.now() > expiryTime) {
      return errorResponse("BOOKING_EXPIRED", "انتهت مهلة الحجز", undefined, 410);
    }

    // 4. تحقق من عدم وجود دفع سابق ناجح
    const existingPayment = await db.payment.findUnique({
      where: { bookingId },
    });
    if (existingPayment && existingPayment.status === "SUCCESS") {
      return errorResponse("VALIDATION_ERROR", "تم الدفع مسبقاً", undefined, 400);
    }

    // 5. بدء الدفع عبر KNet
    const amount = booking.totalAmount;
    const knetResult = await initiateKNetPayment({
      bookingId,
      amount,
      currency: "KWD",
    });

    if (!knetResult.success || !knetResult.redirectUrl) {
      return errorResponse("PAYMENT_FAILED", "فشل بدء عملية الدفع", undefined, 422);
    }

    // أنشئ أو حدّث Payment في DB
    const payment = await db.payment.upsert({
      where: { bookingId },
      update: {
        status: "PENDING",
        method: method ?? "KNET",
        knetPaymentId: knetResult.paymentId,
      },
      create: {
        amount: booking.totalAmount,
        currency: "KWD",
        status: "PENDING",
        method: method ?? "KNET",
        knetPaymentId: knetResult.paymentId,
        bookingId,
      },
    });

    return successResponse(
      {
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
        },
        redirectUrl: knetResult.redirectUrl,
        paymentId: knetResult.paymentId,
      },
      "تم بدء عملية الدفع — سيتم تحويلك لصفحة الدفع"
    );
  } catch (error: unknown) {
    logger.error("payment-initiate", "Error initiating payment", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في بدء الدفع", undefined, 500);
  }
}
