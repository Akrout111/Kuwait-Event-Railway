import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

// GET /api/v1/events/:id/reviews/eligibility — Check if current user can review
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return successResponse(
        {
          canReview: false,
          reason: "NOT_AUTHENTICATED",
          hasReviewed: false,
          hasConfirmedBooking: false,
        },
        "غير مسجل الدخول"
      );
    }

    const { id: eventId } = await params;

    // Check if user has confirmed booking
    const confirmedBooking = await db.booking.findFirst({
      where: {
        userId: user.id,
        eventId,
        status: "CONFIRMED",
        deletedAt: null,
      },
      select: { id: true },
    });

    // Check if user already reviewed
    const existingReview = await db.review.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId,
        },
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    });

    let canReview = false;
    let reason: string | null = null;

    if (existingReview) {
      canReview = false;
      reason = "ALREADY_REVIEWED";
    } else if (!confirmedBooking) {
      canReview = false;
      reason = "NO_CONFIRMED_BOOKING";
    } else {
      canReview = true;
      reason = null;
    }

    return successResponse(
      {
        canReview,
        reason,
        hasReviewed: !!existingReview,
        hasConfirmedBooking: !!confirmedBooking,
        existingReview: existingReview
          ? {
              id: existingReview.id,
              rating: existingReview.rating,
              comment: existingReview.comment,
              createdAt: existingReview.createdAt.toISOString(),
            }
          : null,
      },
      canReview
        ? "يمكنك إضافة تقييم"
        : reason || "لا يمكنك إضافة تقييم"
    );
  } catch (error: unknown) {
    logger.error("review-eligibility", "Eligibility check error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}
