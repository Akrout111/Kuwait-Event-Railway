import crypto from "crypto";
import { logger } from "@/lib/logger";

/**
 * KNet Payment Gateway Integration
 *
 * هذا wrapper يتعامل مع KNet hosted payment page.
 * في وضع MOCK (development)، يحاكي الاستجابة بدون اتصال حقيقي.
 * في وضع PRODUCTION، يتواصل مع KNet API.
 */

interface KNetPaymentRequest {
  paymentId: string;
  amount: string;
  currency: string;
  merchantId: string;
  callbackUrl: string;
  orderId: string;
}

interface KNetPaymentResponse {
  success: boolean;
  redirectUrl?: string;
  paymentId?: string;
  error?: string;
}

interface KNetCallbackData {
  paymentId: string;
  result: string; // CAPTURED, NOT_CAPTURED, etc.
  transactionId?: string;
  amount?: string;
  authCode?: string;
  postDate?: string;
  ref?: string;
  trackId?: string;
  ud1?: string; // custom field — booking ID
}

const isMockMode =
  process.env.KNET_BASE_URL === "https://test.knet.com/api" ||
  !process.env.KNET_BASE_URL ||
  process.env.KNET_BASE_URL.trim() === "";

/**
 * توليد HMAC SHA256 signature
 */
export function generateKNetSignature(data: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex");
}

/**
 * التحقق من HMAC signature من KNet callback
 */
export function verifyKNetSignature(
  receivedSignature: string,
  data: string,
  secret: string
): boolean {
  try {
    const expectedSignature = generateKNetSignature(data, secret);
    const received = Buffer.from(receivedSignature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");
    if (received.length !== expected.length) return false;
    return crypto.timingSafeEqual(received, expected);
  } catch {
    return false;
  }
}

/**
 * توليد payment ID فريد
 */
export function generateKNetPaymentId(): string {
  return `knet_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
}

/**
 * بدء عملية دفع عبر KNet
 */
export async function initiateKNetPayment(params: {
  bookingId: string;
  amount: string;
  currency?: string;
}): Promise<KNetPaymentResponse> {
  if (process.env.NODE_ENV === "production" && (!process.env.KNET_MERCHANT_ID || !process.env.KNET_RESOURCE_KEY || !process.env.KNET_SECRET_KEY)) {
    throw new Error("KNet credentials are required in production");
  }

  const merchantId = process.env.KNET_MERCHANT_ID ?? "";
  const resourceKey = process.env.KNET_RESOURCE_KEY ?? "";
  const secretKey = process.env.KNET_SECRET_KEY ?? "";
  const baseUrl = process.env.KNET_BASE_URL ?? "";
  const callbackUrl = process.env.KNET_CALLBACK_URL ?? "";

  const paymentId = generateKNetPaymentId();

  // === MOCK MODE ===
  if (isMockMode) {
    logger.info("knet", `MOCK Initiating payment: ${paymentId} for booking: ${params.bookingId}, amount: ${params.amount} ${params.currency ?? "KWD"}`);

    // محاكاة — نُرجع redirect URL وهمي يؤدي لصفحة النجاح
    const mockRedirectUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/v1/payments/mock-redirect?paymentId=${paymentId}&bookingId=${params.bookingId}&result=CAPTURED`;

    return {
      success: true,
      redirectUrl: mockRedirectUrl,
      paymentId,
    };
  }

  // === PRODUCTION MODE ===
  try {
    // 1. بناء طلب الدفع
    const paymentRequest: KNetPaymentRequest = {
      paymentId,
      amount: params.amount,
      currency: params.currency ?? "KWD",
      merchantId,
      callbackUrl,
      orderId: params.bookingId,
    };

    // 2. توليد signature
    const signatureData = `${paymentRequest.merchantId}|${paymentRequest.paymentId}|${paymentRequest.amount}|${paymentRequest.currency}|${paymentRequest.orderId}`;
    const signature = generateKNetSignature(signatureData, secretKey);

    // 3. إرسال طلب لـ KNet
    const response = await fetch(`${baseUrl}/payment/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resourceKey}`,
        "X-Signature": signature,
      },
      body: JSON.stringify({
        ...paymentRequest,
        signature,
        ud1: params.bookingId, // custom field للربط مع الحجز
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("knet", "Initiate payment failed", errorText);
      return { success: false, error: "KNet initiate failed" };
    }

    const result = await response.json();

    return {
      success: true,
      redirectUrl: result.redirectUrl ?? result.paymentUrl,
      paymentId: result.paymentId ?? paymentId,
    };
  } catch (error: unknown) {
    logger.error("knet", "Initiate payment error", error);
    return { success: false, error: "KNet connection failed" };
  }
}

/**
 * معالجة callback من KNet
 */
export function processKNetCallback(callbackData: KNetCallbackData): {
  success: boolean;
  paymentId: string;
  result: string;
  transactionId?: string;
  authCode?: string;
} {
  return {
    success: callbackData.result === "CAPTURED",
    paymentId: callbackData.paymentId,
    result: callbackData.result,
    transactionId: callbackData.transactionId,
    authCode: callbackData.authCode,
  };
}

/**
 * طلب استرداد من KNet
 */
export async function refundKNetPayment(params: {
  paymentId: string;
  transactionId: string;
  amount: string;
  reason: string;
}): Promise<{ success: boolean; error?: string }> {
  if (process.env.NODE_ENV === "production" && (!process.env.KNET_MERCHANT_ID || !process.env.KNET_RESOURCE_KEY || !process.env.KNET_SECRET_KEY)) {
    throw new Error("KNet credentials are required in production");
  }

  const merchantId = process.env.KNET_MERCHANT_ID ?? "";
  const resourceKey = process.env.KNET_RESOURCE_KEY ?? "";
  const secretKey = process.env.KNET_SECRET_KEY ?? "";
  const baseUrl = process.env.KNET_BASE_URL ?? "";

  // === MOCK MODE ===
  if (isMockMode) {
    logger.info("knet", `MOCK Refunding payment: ${params.paymentId}, amount: ${params.amount}, reason: ${params.reason}`);
    return { success: true };
  }

  // === PRODUCTION MODE ===
  try {
    const signatureData = `${merchantId}|${params.paymentId}|${params.amount}|${params.transactionId}`;
    const signature = generateKNetSignature(signatureData, secretKey);

    const response = await fetch(`${baseUrl}/payment/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resourceKey}`,
        "X-Signature": signature,
      },
      body: JSON.stringify({
        paymentId: params.paymentId,
        transactionId: params.transactionId,
        amount: params.amount,
        reason: params.reason,
        signature,
      }),
    });

    if (!response.ok) {
      return { success: false, error: "KNet refund failed" };
    }

    return { success: true };
  } catch (error: unknown) {
    logger.error("knet", "Refund error", error);
    return { success: false, error: "KNet refund connection failed" };
  }
}
