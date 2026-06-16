import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { z } from "zod";
import { logger } from "@/lib/logger";

const replySchema = z.object({
  reply: z
    .string()
    .min(1, { message: "الرد لا يمكن أن يكون فارغاً" })
    .max(500, { message: "الرد يجب أن يكون أقل من 500 حرف" }),
});

// POST /api/v1/reviews/:id/reply — Organizer replies to a review
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit check
    const rateLimitResult = checkRateLimit(getClientIdentifier(req), { limit: 5, windowSeconds: 60 });
    if (!rateLimitResult.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429);
    }

    const user = await requireRole(["ORGANIZER", "ADMIN"]);

    const { id: reviewId } = await params;

    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        event: {
          select: { id: true, organizerId: true },
        },
      },
    });

    if (!review) {
      return errorResponse(
        "REVIEW_NOT_FOUND",
        "التقييم غير موجود",
        undefined,
        404
      );
    }

    if (user.role !== "ADMIN" && review.event.organizerId !== user.id) {
      return errorResponse(
        "FORBIDDEN",
        "غير مسموح بالرد على تقييم فعالية لا تملكها",
        undefined,
        403
      );
    }

    const body = await req.json();
    const parsed = replySchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return errorResponse(
        "VALIDATION_ERROR",
        firstError?.message || "بيانات غير صالحة",
        undefined,
        400
      );
    }

    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data: {
        organizerReply: parsed.data.reply.trim(),
        organizerRepliedAt: new Date(),
      },
    });

    return successResponse(
      {
        review: {
          id: updatedReview.id,
          organizerReply: updatedReview.organizerReply,
          organizerRepliedAt:
            updatedReview.organizerRepliedAt?.toISOString() ?? null,
        },
      },
      "تم إضافة الرد بنجاح"
    );
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.message.includes("UNAUTHORIZED") ||
        error.message.includes("FORBIDDEN"))
    ) {
      return errorResponse(
        "FORBIDDEN",
        "صلاحيات غير كافية",
        undefined,
        403
      );
    }
    logger.error("review-reply", "Reply to review error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}
