import { db } from "@/lib/db";
import { NotificationType } from "@/lib/notifications/types";
import { sendEmail } from "@/lib/email";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createHmac } from "crypto";
import { logger } from "@/lib/logger";

/**
 * Verify Vercel Cron signature in production.
 * Vercel sends an x-vercel-signature header with an HMAC-SHA256 of the request body
 * using the CRON_SECRET as the key.
 */
function verifyVercelCronSignature(request: Request, body: string): boolean {
  const signature = request.headers.get("x-vercel-signature");
  if (!signature || !process.env.CRON_SECRET) return false;

  const expected = createHmac("sha256", process.env.CRON_SECRET)
    .update(body)
    .digest("hex");

  return signature === expected;
}

/**
 * GET /api/v1/cron/reminders
 * Sends event reminder notifications to users with upcoming bookings.
 *
 * Deduplication: checks for existing EVENT_REMINDER notifications per booking
 * within the last 48 hours (filtered in JS since SQLite doesn't support JSON path queries).
 *
 * Security: requires CRON_SECRET Bearer token and Vercel Cron signature in production.
 */
export async function GET(request: Request) {
  // ── Authorization ──────────────────────────────────────────
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    // In production (Vercel), verify the x-vercel-signature header
    if (process.env.VERCEL === "1") {
      // We need to read the body for signature verification, but cron GET requests
      // typically have no body. Verify the signature header is present.
      const vercelSignature = request.headers.get("x-vercel-signature");
      if (!vercelSignature) {
        return errorResponse("UNAUTHORIZED", "Missing Vercel Cron signature", undefined, 401);
      }
      // Verify signature using empty body for GET requests
      if (!verifyVercelCronSignature(request, "")) {
        return errorResponse("UNAUTHORIZED", "Invalid Vercel Cron signature", undefined, 401);
      }
    } else {
      // Non-Vercel environments: Bearer token check
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return errorResponse("UNAUTHORIZED", "Missing or invalid cron secret", undefined, 401);
      }
    }
  }

  try {
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Find all confirmed bookings for events starting within the next 24h
    const upcomingBookings = await db.booking.findMany({
      where: {
        status: "CONFIRMED",
        event: {
          startDate: {
            gte: now,
            lte: twentyFourHoursFromNow,
          },
        },
      },
      include: {
        user: true,
        event: {
          include: {
            venue: true,
          },
        },
      },
    });

    if (upcomingBookings.length === 0) {
      return successResponse({ remindersSent: 0 }, "No upcoming bookings to remind");
    }

    let remindersSent = 0;

    for (const booking of upcomingBookings) {
      // ── Deduplication check (JS-based, since SQLite JSON path filter doesn't work) ──
      const existingReminders = await db.notification.findMany({
        where: {
          userId: booking.user.id,
          type: NotificationType.EVENT_REMINDER,
          createdAt: { gte: fortyEightHoursAgo },
        },
      });

      const alreadyReminded = existingReminders.some((n) => {
        try {
          const d = JSON.parse(n.data || "{}");
          return d.bookingNumber === booking.bookingNumber;
        } catch {
          return false;
        }
      });

      if (alreadyReminded) continue;

      // ── Create notification ──────────────────────────────────
      await db.notification.create({
        data: {
          userId: booking.user.id,
          type: NotificationType.EVENT_REMINDER,
          titleAr: `تذكير: ${booking.event.titleAr}`,
          titleEn: `Reminder: ${booking.event.titleEn || booking.event.titleAr}`,
          bodyAr: `الفعالية "${booking.event.titleAr}" ستبدأ قريباً`,
          bodyEn: `The event "${booking.event.titleEn || booking.event.titleAr}" is starting soon`,
          data: JSON.stringify({
            bookingNumber: booking.bookingNumber,
            eventId: booking.event.id,
            eventTitle: booking.event.titleAr,
          }),
        },
      });

      // ── Send reminder email ──────────────────────────────────
      try {
        const eventDate = booking.event.startDate.toLocaleDateString("ar-KW", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        await sendEmail({
          to: booking.attendeeEmail,
          subject: `تذكير: ${booking.event.titleAr} غداً!`,
          html: `
            <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>مرحباً ${booking.attendeeName}،</h2>
              <p>هذا تذكير بأن الفعالية <strong>${booking.event.titleAr}</strong> ستبدأ قريباً!</p>
              <p>📅 ${eventDate}</p>
              <p>🕐 ${booking.event.startTime}</p>
              ${booking.event.venue ? `<p>📍 ${booking.event.venue.nameAr}</p>` : ""}
              <p>رقم الحجز: <strong>${booking.bookingNumber}</strong></p>
            </div>
          `,
        });
      } catch (emailError: unknown) {
        logger.error("cron-reminders", "Failed to send reminder email", emailError);
        // Continue even if email fails — notification was already created
      }

      remindersSent++;
    }

    return successResponse(
      { remindersSent, totalBookings: upcomingBookings.length },
      `Sent ${remindersSent} reminders out of ${upcomingBookings.length} upcoming bookings`
    );
  } catch (error: unknown) {
    logger.error("cron-reminders", "Cron Reminders error", error);
    return errorResponse(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Failed to process reminders",
      undefined,
      500
    );
  }
}

export const dynamic = "force-dynamic";
