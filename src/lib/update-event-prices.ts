import { db } from "./db";

/**
 * Compute and update the minPrice field for an event
 * based on its ticket tiers.
 */
export async function updateEventMinPrice(eventId: string): Promise<void> {
  const tiers = await db.ticketTier.findMany({
    where: { eventId },
    select: { price: true },
  });

  if (tiers.length === 0) return;

  const prices = tiers.map((t) => parseFloat(t.price));
  const minPrice = Math.min(...prices);

  await db.event.update({
    where: { id: eventId },
    data: { minPrice: minPrice.toFixed(3) },
  });
}
