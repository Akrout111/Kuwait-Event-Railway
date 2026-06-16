import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { changeEventStatusSchema } from "@/lib/validators/admin-schema";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

// PATCH /api/v1/admin/events/:id/status — Change event status (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit check
    const rateLimitResult = checkRateLimit(getClientIdentifier(req), { limit: 10, windowSeconds: 60 });
    if (!rateLimitResult.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429);
    }

    await requireRole(["ADMIN"]);
    const { id } = await params;

    const event = await db.event.findUnique({
      where: { id },
    });

    if (!event) {
      return errorResponse("EVENT_NOT_FOUND", "الفعالية غير موجودة", undefined, 404);
    }

    const body = await req.json();
    const parsed = changeEventStatusSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return errorResponse(
        "VALIDATION_ERROR",
        firstError?.message || "بيانات غير صالحة",
        undefined,
        400
      );
    }

    const { status } = parsed.data;

    const updatedEvent = await db.event.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        status: true,
      },
    });

    return successResponse(
      { event: updatedEvent },
      `تم تغيير حالة الفعالية إلى ${status}`
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNAUTHORIZED")) {
      return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);
    }
    if (error instanceof Error && error.message.includes("FORBIDDEN")) {
      return errorResponse("FORBIDDEN", "صلاحيات غير كافية", undefined, 403);
    }
    logger.error("event-status", "Change event status error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}
