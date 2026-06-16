import { db } from "@/lib/db";
import { BrowseEventsClient } from "@/components/features/events/browse-events-client";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "الفعاليات — منصة فعاليات الكويت" : "Events — Kuwait Events Platform",
    description: locale === "ar" ? "تصفح جميع الفعاليات في الكويت — فلتر بالتصنيف والتاريخ والبحث" : "Browse all events in Kuwait — filter by category, date, and search",
  };
}

export default async function EventsPage() {
  const categories = await db.category.findMany({
    include: {
      _count: { select: { events: { where: { status: "PUBLISHED", deletedAt: null } } } },
    },
    orderBy: { nameAr: "asc" },
  });

  return <BrowseEventsClient categories={categories} />;
}
