import { Resend } from "resend";
import { logger } from "@/lib/logger";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * يرسل بريد إلكتروني عبر Resend
 */
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  // في وضع التطوير بدون Resend API key، سجّل فقط
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_xxxxxxxx") {
    logger.info("email", "MOCK email", { to, subject });
    return true;
  }

  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "noreply@kuwaitevents.com",
      to,
      subject,
      html,
    });

    if (error) {
      logger.error("email", "Send failed", error);
      return false;
    }

    return true;
  } catch (error: unknown) {
    logger.error("email", "Send error", error);
    return false;
  }
}

/**
 * يرسل بريد تأكيد الحجز
 */
export async function sendBookingConfirmationEmail(params: {
  to: string;
  attendeeName: string;
  bookingNumber: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  ticketCount: number;
  totalAmount: string;
  bookingId: string;
  appUrl: string;
  locale?: string;
}): Promise<boolean> {
  const {
    to,
    attendeeName,
    bookingNumber,
    eventTitle,
    eventDate,
    eventTime,
    venueName,
    ticketCount,
    totalAmount,
    bookingId,
    appUrl,
    locale = "ar",
  } = params;

  const isAr = locale === "ar";

  const html = isAr
    ? `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1a56db, #3b82f6); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .info-label { color: #666; font-size: 14px; }
        .info-value { font-weight: 600; font-size: 14px; }
        .amount { font-size: 28px; font-weight: bold; color: #1a56db; text-align: center; margin: 20px 0; }
        .cta { display: block; width: fit-content; margin: 20px auto; padding: 12px 30px; background: #1a56db; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ تم تأكيد حجزك!</h1>
        </div>
        <div class="content">
          <p>مرحباً ${attendeeName}،</p>
          <p>تم تأكيد حجزك بنجاح. إليك تفاصيل الحجز:</p>

          <div class="info-row">
            <span class="info-label">رقم الحجز</span>
            <span class="info-value">${bookingNumber}</span>
          </div>
          <div class="info-row">
            <span class="info-label">الفعالية</span>
            <span class="info-value">${eventTitle}</span>
          </div>
          <div class="info-row">
            <span class="info-label">التاريخ</span>
            <span class="info-value">${eventDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">الوقت</span>
            <span class="info-value">${eventTime}</span>
          </div>
          <div class="info-row">
            <span class="info-label">المكان</span>
            <span class="info-value">${venueName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">عدد التذاكر</span>
            <span class="info-value">${ticketCount}</span>
          </div>

          <div class="amount">${totalAmount} د.ك</div>

          <a href="${appUrl}/ar/bookings/${bookingId}" class="cta">عرض التذاكر و QR Codes</a>
        </div>
        <div class="footer">
          منصة فعاليات الكويت — noreply@kuwaitevents.com
        </div>
      </div>
    </body>
    </html>
  `
    : `
    <!DOCTYPE html>
    <html dir="ltr" lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; direction: ltr; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1a56db, #3b82f6); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .info-label { color: #666; font-size: 14px; }
        .info-value { font-weight: 600; font-size: 14px; }
        .amount { font-size: 28px; font-weight: bold; color: #1a56db; text-align: center; margin: 20px 0; }
        .cta { display: block; width: fit-content; margin: 20px auto; padding: 12px 30px; background: #1a56db; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hello ${attendeeName},</p>
          <p>Your booking has been confirmed successfully. Here are your booking details:</p>

          <div class="info-row">
            <span class="info-label">Booking No.</span>
            <span class="info-value">${bookingNumber}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Event</span>
            <span class="info-value">${eventTitle}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date</span>
            <span class="info-value">${eventDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Time</span>
            <span class="info-value">${eventTime}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Venue</span>
            <span class="info-value">${venueName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tickets</span>
            <span class="info-value">${ticketCount}</span>
          </div>

          <div class="amount">${totalAmount} KWD</div>

          <a href="${appUrl}/en/bookings/${bookingId}" class="cta">View Tickets & QR Codes</a>
        </div>
        <div class="footer">
          Kuwait Events Platform — noreply@kuwaitevents.com
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: isAr
      ? `تأكيد الحجز ${bookingNumber} — ${eventTitle}`
      : `Booking Confirmed ${bookingNumber} — ${eventTitle}`,
    html,
  });
}

/**
 * يرسل بريد فشل الدفع
 */
export async function sendPaymentFailureEmail(params: {
  to: string;
  attendeeName: string;
  bookingNumber: string;
  eventTitle: string;
  locale?: string;
}): Promise<boolean> {
  const { locale = "ar" } = params;
  const isAr = locale === "ar";

  const html = isAr
    ? `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; text-align: center; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ فشل عملية الدفع</h1>
        </div>
        <div class="content">
          <p>مرحباً ${params.attendeeName}،</p>
          <p>لم تتم عملية الدفع للحجز <strong>${params.bookingNumber}</strong> للفعالية <strong>${params.eventTitle}</strong>.</p>
          <p>يمكنك إعادة المحاولة من صفحة الحجوزات.</p>
        </div>
        <div class="footer">منصة فعاليات الكويت</div>
      </div>
    </body>
    </html>
  `
    : `
    <!DOCTYPE html>
    <html dir="ltr" lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; direction: ltr; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; text-align: center; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Payment Failed</h1>
        </div>
        <div class="content">
          <p>Hello ${params.attendeeName},</p>
          <p>The payment for booking <strong>${params.bookingNumber}</strong> for the event <strong>${params.eventTitle}</strong> was not completed.</p>
          <p>You can retry from your bookings page.</p>
        </div>
        <div class="footer">Kuwait Events Platform</div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.to,
    subject: isAr
      ? `فشل الدفع للحجز ${params.bookingNumber}`
      : `Payment Failed for Booking ${params.bookingNumber}`,
    html,
  });
}
