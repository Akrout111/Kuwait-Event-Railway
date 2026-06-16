import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * GET /api/v1/payments/mock-redirect
 *
 * هذا endpoint يحاكي إعادة توجيه KNet بعد الدفع.
 * في وضع MOCK، KNet redirect URL يشير هنا.
 * هذا endpoint يحوّل المستخدم لصفحة النجاح/الفشل
 * ويُرسل callback داخلياً.
 */
export async function GET(req: NextRequest) {
  // Only available in development/mock mode
  if (process.env.PAYMENT_MODE !== "mock" && process.env.NODE_ENV !== "development") {
    return NextResponse.redirect(new URL("/ar", req.url));
  }

  const { searchParams } = req.nextUrl;
  const paymentId = searchParams.get("paymentId");
  const bookingId = searchParams.get("bookingId");
  const result = searchParams.get("result") ?? "CAPTURED";

  if (!paymentId || !bookingId) {
    return NextResponse.redirect(
      new URL("/ar/bookings?error=invalid_payment", req.url)
    );
  }

  // أرسل callback داخلياً لمحاكاة server-to-server callback من KNet
  const callbackUrl = new URL("/api/v1/payments/callback", req.url);
  try {
    await fetch(callbackUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentId,
        result,
        transactionId: `txn_mock_${Date.now()}`,
        amount: "0", // سيُقرأ من DB
        authCode: `AUTH_${Date.now()}`,
        ud1: bookingId,
      }),
    });
  } catch (error: unknown) {
    logger.error("mock-redirect", "Callback failed", error);
  }

  // وجّه المستخدم لصفحة النتيجة
  if (result === "CAPTURED") {
    return NextResponse.redirect(
      new URL(`/ar/bookings/${bookingId}?payment=success`, req.url)
    );
  } else {
    return NextResponse.redirect(
      new URL(`/ar/bookings/${bookingId}?payment=failed`, req.url)
    );
  }
}
