import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const venues = await db.venue.findMany({
      include: {
        _count: {
          select: { events: { where: { status: "PUBLISHED", deletedAt: null, startDate: { gte: new Date() } } } },
        },
      },
      orderBy: { nameAr: "asc" },
    });

    const venuesWithCount = venues.map((v) => ({
      ...v,
      upcomingEventCount: v._count.events,
    }));

    return successResponse({ venues: venuesWithCount }, "تم جلب الأماكن");
  } catch (error: unknown) {
    logger.error("venues", "Error fetching venues", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في جلب الأماكن", undefined, 500);
  }
}
