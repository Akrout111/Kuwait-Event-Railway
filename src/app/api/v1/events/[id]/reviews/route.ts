import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createReviewSchema } from "@/lib/validators/review-schema";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { notificationService } from "@/lib/notifications/notification-service";
import { logger } from "@/lib/logger";

// POST /api/v1/events/:id/reviews — Create a review for an event
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit check
    const rateLimitResult = checkRateLimit(getClientIdentifier(req), { limit: 3, windowSeconds: 60 });
    if (!rateLimitResult.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429);
    }

    const user = await getCurrentUser();
    if (!user)
      return errorResponse("UNAUTHORIZED", "غير مصرح", undefined, 401);

    const { id: eventId } = await params;

    // ── Step 1: Verify event exists ──
    const event = await db.event.findUnique({
      where: { id: eventId, deletedAt: null },
      select: { id: true, status: true, startDate: true, titleAr: true, titleEn: true, organizerId: true, organizer: { select: { id: true, email: true } } },
    });

    if (!event) {
      return errorResponse(
        "EVENT_NOT_FOUND",
        "الفعالية غير موجودة",
        undefined,
        404
      );
    }

    // ── Step 2: Verify user has a confirmed booking for this event ──
    const confirmedBooking = await db.booking.findFirst({
      where: {
        userId: user.id,
        eventId,
        status: "CONFIRMED",
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!confirmedBooking) {
      return errorResponse(
        "NO_CONFIRMED_BOOKING",
        "يجب أن يكون لديك حجز مؤكد لهذه الفعالية لتتمكن من التقييم",
        undefined,
        403
      );
    }

    // ── Step 3: Verify user hasn't already reviewed this event ──
    const existingReview = await db.review.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId,
        },
      },
      select: { id: true },
    });

    if (existingReview) {
      return errorResponse(
        "ALREADY_REVIEWED",
        "لقد قمت بتقييم هذه الفعالية مسبقاً",
        undefined,
        409
      );
    }

    // ── Step 4: Validate input ──
    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return errorResponse(
        "VALIDATION_ERROR",
        firstError?.message || "بيانات غير صالحة",
        firstError?.path[0]?.toString(),
        400
      );
    }

    const { rating, comment } = parsed.data;

    // ── Step 5: Create review ──
    const review = await db.review.create({
      data: {
        rating,
        comment:
          comment && comment.trim() !== "" ? comment.trim() : null,
        userId: user.id,
        eventId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // ── Step 6: Notify organizer (fire-and-forget) ──
    if (event.organizerId !== user.id) {
      notificationService.notifyNewReview({
        organizerId: event.organizerId,
        eventTitleAr: event.titleAr,
        eventTitleEn: event.titleEn ?? event.titleAr,
        reviewerName: user.name,
        rating,
        email: event.organizer.email,
      }).catch((err: unknown) => logger.error("notification", "New review notification error", err));
    }

    return successResponse(
      {
        review: {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          organizerReply: review.organizerReply,
          organizerRepliedAt:
            review.organizerRepliedAt?.toISOString() ?? null,
          createdAt: review.createdAt.toISOString(),
          user: review.user,
        },
      },
      "تم إضافة التقييم بنجاح"
    );
  } catch (error: unknown) {
    logger.error("reviews", "Create review error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}
