import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { CategoryPageClient } from "@/components/features/events/category-page-client";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return { title: "تصنيف غير موجود" };
  return {
    title: `${category.nameAr} — منصة فعاليات الكويت`,
    description: `تصفح فعاليات ${category.nameAr} في الكويت`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const events = await db.event.findMany({
    where: { category: { slug }, status: "PUBLISHED", deletedAt: null },
    include: {
      venue: { select: { nameAr: true, nameEn: true, city: true } },
      category: { select: { nameAr: true, nameEn: true, slug: true } },
      ticketTiers: {
        select: { price: true, quantityTotal: true, quantitySold: true },
      },
    },
    orderBy: { startDate: "asc" },
  });

  return <CategoryPageClient category={category} events={events} />;
}
