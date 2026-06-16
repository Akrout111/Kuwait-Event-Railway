import { db } from "@/lib/db";
import { BOOKING_EXPIRY_MINUTES } from "@/lib/constants";
import { updateEventMinPrice } from "@/lib/update-event-prices";

/**
 * Releases tickets for bookings that have expired.
 * Called from API route or cron job.
 * Wrapped in a transaction to ensure data consistency.
 */
export async function releaseExpiredBookings() {
  const now = new Date();
  const expiryThreshold = new Date(now.getTime() - BOOKING_EXPIRY_MINUTES * 60 * 1000);

  const expiredBookings = await db.booking.findMany({
    where: {
      status: "PENDING",
      createdAt: { lt: expiryThreshold },
    },
    include: {
      tickets: { include: { ticketTier: true } },
    },
  });

  if (expiredBookings.length === 0) return { released: 0 };

  // Process each expired booking in a transaction
  for (const booking of expiredBookings) {
    await db.$transaction(async (tx) => {
      // Release tickets (decrement quantitySold)
      for (const ticket of booking.tickets) {
        await tx.ticketTier.update({
          where: { id: ticket.ticketTierId },
          data: { quantitySold: { decrement: 1 } },
        });
      }

      // Cancel the booking
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" },
      });

      // Delete the tickets
      await tx.ticket.deleteMany({
        where: { bookingId: booking.id },
      });
    });

    // حدّث الحد الأدنى للسعر بعد تحرير التذاكر (خارج transaction)
    await updateEventMinPrice(booking.eventId);
  }

  return { released: expiredBookings.length };
}
