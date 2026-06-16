import crypto from "crypto";
import { db } from "./db";

/**
 * يولد QR code data لتذكرة
 * البيانات المشفرة: ticket number + booking ID + HMAC signature
 */
export function generateTicketQRData(ticketNumber: string, bookingId: string): string {
  const tn = ticketNumber;
  const bid = bookingId;
  const v = 1; // version

  const sig = crypto
    .createHmac("sha256", process.env.JWT_SECRET!)
    .update(JSON.stringify({ tn, bid, v }))
    .digest("hex");

  return JSON.stringify({ tn, bid, v, sig });
}

/**
 * يتحقق من صحة HMAC signature في بيانات QR
 */
export function verifyTicketQRData(qrData: string): { valid: boolean; tn?: string; bid?: string; v?: number } {
  try {
    const parsed = JSON.parse(qrData);
    const { tn, bid, v, sig } = parsed;

    if (!tn || !bid || !v || !sig) {
      return { valid: false };
    }

    const expectedSig = crypto
      .createHmac("sha256", process.env.JWT_SECRET!)
      .update(JSON.stringify({ tn, bid, v }))
      .digest("hex");

    const sigBuffer = Buffer.from(sig, "hex");
    const expectedBuffer = Buffer.from(expectedSig, "hex");

    if (sigBuffer.length !== expectedBuffer.length) {
      return { valid: false };
    }

    const valid = crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    return valid ? { valid: true, tn, bid, v } : { valid: false };
  } catch {
    return { valid: false };
  }
}

/**
 * يولد QR code data لكل تذاكر الحجز ويحدّث DB
 */
export async function generateQRCodesForBooking(bookingId: string): Promise<void> {
  const tickets = await db.ticket.findMany({
    where: { bookingId },
  });

  for (const ticket of tickets) {
    const qrData = generateTicketQRData(ticket.ticketNumber, bookingId);
    // في Production، نرفع QR image لـ R2. الآن نحفظ البيانات فقط.
    // QR code يُولّد client-side باستخدام qrcode.react
    await db.ticket.update({
      where: { id: ticket.id },
      data: { qrCodeUrl: qrData },
    });
  }
}
