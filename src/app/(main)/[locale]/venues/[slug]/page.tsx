import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { VenuePageClient } from "@/components/features/events/venue-page-client";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const venue = await db.venue.findUnique({ where: { slug } });
  if (!venue) return { title: "مكان غير موجود" };
  return {
    title: `${venue.nameAr} — منصة فعاليات الكويت`,
    description: `فعاليات في ${venue.nameAr} — ${venue.address}`,
  };
}

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venue = await db.venue.findUnique({
    where: { slug },
    include: {
      events: {
        where: { status: "PUBLISHED", deletedAt: null, startDate: { gte: new Date() } },
        include: {
          category: { select: { nameAr: true, nameEn: true, slug: true } },
          ticketTiers: {
            select: { price: true, quantityTotal: true, quantitySold: true },
            take: 1,
            orderBy: { price: "asc" },
          },
        },
        orderBy: { startDate: "asc" },
        take: 10,
      },
    },
  });
  if (!venue) notFound();

  return <VenuePageClient venue={venue} />;
}
