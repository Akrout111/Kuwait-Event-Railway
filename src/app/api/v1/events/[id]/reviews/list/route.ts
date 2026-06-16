import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

// GET /api/v1/events/:id/reviews/list — Get reviews for an event (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "recent"; // recent | highest | lowest

    // Verify event exists
    const event = await db.event.findUnique({
      where: { id: eventId, deletedAt: null },
      select: { id: true },
    });

    if (!event) {
      return errorResponse(
        "EVENT_NOT_FOUND",
        "الفعالية غير موجودة",
        undefined,
        404
      );
    }

    // Build order by
    type OrderByType = { createdAt: "desc" } | { rating: "desc" } | { rating: "asc" };
    let orderBy: OrderByType = { createdAt: "desc" };
    if (sortBy === "highest") orderBy = { rating: "desc" };
    if (sortBy === "lowest") orderBy = { rating: "asc" };

    // Get reviews + stats in parallel
    const [reviews, total, stats] = await Promise.all([
      db.review.findMany({
        where: { eventId },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      }),
      db.review.count({ where: { eventId } }),

      // Rating distribution + average
      db.review.aggregate({
        where: { eventId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    // Get rating distribution (how many 1-star, 2-star, etc.)
    const distribution = await db.review.groupBy({
      by: ["rating"],
      where: { eventId },
      _count: { rating: true },
      orderBy: { rating: "desc" },
    });

    const distributionMap: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    distribution.forEach((d) => {
      distributionMap[d.rating] = d._count.rating;
    });

    return successResponse(
      {
        reviews: reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          organizerReply: r.organizerReply,
          organizerRepliedAt:
            r.organizerRepliedAt?.toISOString() ?? null,
          createdAt: r.createdAt.toISOString(),
          user: r.user,
        })),
        stats: {
          averageRating: stats._avg.rating
            ? parseFloat(stats._avg.rating.toFixed(1))
            : 0,
          totalReviews: stats._count.rating,
          distribution: distributionMap,
        },
      },
      "تم جلب التقييمات",
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error: unknown) {
    logger.error("reviews-list", "List reviews error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}
