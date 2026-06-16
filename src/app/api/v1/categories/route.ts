import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: { select: { events: { where: { status: "PUBLISHED", deletedAt: null } } } },
      },
      orderBy: { nameAr: "asc" },
    });

    const categoriesWithCount = categories.map((cat) => ({
      id: cat.id,
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
      slug: cat.slug,
      iconUrl: cat.iconUrl,
      eventCount: cat._count.events,
    }));

    return successResponse({ categories: categoriesWithCount }, "تم جلب التصنيفات");
  } catch (error: unknown) {
    logger.error("categories", "Error fetching categories", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في جلب التصنيفات", undefined, 500);
  }
}
