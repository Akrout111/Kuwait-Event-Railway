import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const venue = await db.venue.findUnique({
      where: { slug },
      include: {
        events: {
          where: { status: "PUBLISHED", deletedAt: null, startDate: { gte: new Date() } },
          include: {
            category: { select: { nameAr: true, nameEn: true, slug: true } },
            ticketTiers: {
              select: { price: true },
              take: 1,
              orderBy: { price: "asc" },
            },
          },
          orderBy: { startDate: "asc" },
          take: 10,
        },
      },
    });

    if (!venue) {
      return errorResponse("VENUE_NOT_FOUND", "المكان غير موجود", undefined, 404);
    }

    const venueWithEvents = {
      ...venue,
      events: venue.events.map((e) => ({
        id: e.id,
        titleAr: e.titleAr,
        titleEn: e.titleEn,
        slug: e.slug,
        coverImageUrl: e.coverImageUrl,
        startDate: e.startDate,
        startTime: e.startTime,
        category: e.category,
        lowestPrice: e.ticketTiers[0]?.price ?? "0.000",
      })),
    };

    return successResponse({ venue: venueWithEvents }, "تم جلب المكان");
  } catch (error: unknown) {
    logger.error("venue-slug", "Error fetching venue", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ", undefined, 500);
  }
}
