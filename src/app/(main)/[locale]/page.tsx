import { db } from "@/lib/db";
import type { Metadata } from "next";
import { HeroSection3D } from "@/components/ui/hero-section-3d";
import { FeaturedEventsGrid } from "@/components/features/events/featured-events-grid";
import { StatsBentoGrid } from "@/components/features/home/stats-bento-grid";
import { TestimonialsSection } from "@/components/features/home/testimonials-section";
import { CTATrustSection } from "@/components/features/events/cta-trust-section";
import { CategoryCarousel } from "@/components/features/events/category-carousel";

export const metadata: Metadata = {
  title: "فعاليات الكويت — Kuwait Events Platform",
  description: "اكتشف أفضل الفعاليات في الكويت — حفلات، رياضة، ثقافة، تقنية والمزيد",
};

export default async function HomePage() {
  const [featuredEvents, categories, upcomingCount, venuesCount, featuredCount] = await Promise.all([
    db.event.findMany({
      where: { isFeatured: true, status: "PUBLISHED", deletedAt: null },
      include: {
        venue: { select: { nameAr: true, nameEn: true, city: true } },
        category: { select: { nameAr: true, nameEn: true, slug: true } },
        ticketTiers: {
          select: { price: true, quantityTotal: true, quantitySold: true },
        },
      },
      take: 6,
      orderBy: { startDate: "asc" },
    }),
    db.category.findMany({
      include: {
        _count: { select: { events: { where: { status: "PUBLISHED", deletedAt: null } } } },
      },
    }),
    db.event.count({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        startDate: { gte: new Date() },
      },
    }),
    db.venue.count(),
    db.event.count({ where: { isFeatured: true, status: "PUBLISHED", deletedAt: null } }),
  ]);

  const categoriesCount = categories.length;

  // Compute total ticket count across all tiers
  const ticketAgg = await db.ticketTier.aggregate({ _sum: { quantityTotal: true } });
  const ticketCount = ticketAgg._sum.quantityTotal ?? 0;

  return (
    <>
      <HeroSection3D
        upcomingCount={upcomingCount}
      />
      <FeaturedEventsGrid events={featuredEvents} />
      <StatsBentoGrid
        eventCount={upcomingCount}
        categoryCount={categoriesCount}
        venueCount={venuesCount}
        ticketCount={ticketCount}
        featuredCount={featuredCount}
      />
      <TestimonialsSection />
      <CTATrustSection
        upcomingCount={upcomingCount}
        categoriesCount={categoriesCount}
        venuesCount={venuesCount}
      />
      <CategoryCarousel categories={categories} />
    </>
  );
}
