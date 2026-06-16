import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { EventDetailClient } from "@/components/features/events/event-detail-client";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await db.event.findUnique({
    where: { slug, deletedAt: null },
    include: { category: true, venue: true },
  });
  if (!event) return { title: "فعالية غير موجودة" };

  return {
    title: `${event.titleAr} — منصة فعاليات الكويت`,
    description: event.descriptionAr?.slice(0, 160) ?? "تفاصيل الفعالية",
    openGraph: {
      title: event.titleAr,
      description: event.descriptionAr?.slice(0, 160),
      images: [{ url: event.coverImageUrl }],
      type: "article",
    },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await db.event.findUnique({
    where: { slug, deletedAt: null, status: "PUBLISHED" },
    include: {
      venue: true,
      category: { select: { id: true, nameAr: true, nameEn: true, slug: true } },
      organizer: { select: { id: true, name: true, avatarUrl: true } },
      ticketTiers: {
        orderBy: { price: "asc" },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!event) notFound();

  // إحصائيات التقييمات
  const reviewStats = await db.review.aggregate({
    where: { eventId: event.id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  // فعاليات مشابهة
  const relatedEvents = await db.event.findMany({
    where: {
      categoryId: event.categoryId,
      status: "PUBLISHED",
      deletedAt: null,
      id: { not: event.id },
    },
    include: {
      venue: { select: { nameAr: true, nameEn: true, city: true } },
      category: { select: { nameAr: true, nameEn: true, slug: true } },
      ticketTiers: {
        select: { price: true },
        take: 1,
        orderBy: { price: "asc" },
      },
    },
    take: 3,
    orderBy: { startDate: "asc" },
  });

  // Serialize Date objects to ISO strings for client component
  const eventData = {
    id: event.id,
    titleAr: event.titleAr,
    titleEn: event.titleEn,
    descriptionAr: event.descriptionAr,
    descriptionEn: event.descriptionEn,
    coverImageUrl: event.coverImageUrl,
    startDate: event.startDate.toISOString(),
    startTime: event.startTime,
    endTime: event.endTime,
    isFeatured: event.isFeatured,
    category: event.category,
    venue: event.venue,
    organizer: event.organizer,
    ticketTiers: event.ticketTiers.map((tier) => ({
      id: tier.id,
      nameAr: tier.nameAr,
      type: tier.type,
      price: tier.price,
      quantityTotal: tier.quantityTotal,
      quantitySold: tier.quantitySold,
      quantityAvailable: tier.quantityTotal - tier.quantitySold,
      maxPerBooking: tier.maxPerBooking,
    })),
    reviews: {
      averageRating: reviewStats._avg.rating ?? 0,
      totalReviews: reviewStats._count.rating,
      recent: event.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        user: r.user,
      })),
    },
    relatedEvents: relatedEvents.map((e) => ({
      id: e.id,
      titleAr: e.titleAr,
      slug: e.slug,
      coverImageUrl: e.coverImageUrl,
      startDate: e.startDate.toISOString(),
      startTime: e.startTime,
      venue: e.venue
        ? { nameAr: e.venue.nameAr, nameEn: e.venue.nameEn ?? undefined, city: e.venue.city }
        : { nameAr: "", nameEn: undefined, city: "" },
      category: e.category,
      lowestPrice: e.ticketTiers[0]?.price ?? "0.000",
      isFeatured: false,
      ticketTiers: e.ticketTiers.map((t) => ({
        price: t.price,
      })),
    })),
  };

  return <EventDetailClient event={eventData} />;
}
