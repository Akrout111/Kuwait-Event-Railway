import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { toggleUserActiveSchema } from "@/lib/validators/admin-schema";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

// PATCH /api/v1/admin/users/:id/active — Activate/deactivate user (admin only)
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

    const admin = await requireRole(["ADMIN"]);
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return errorResponse("USER_NOT_FOUND", "المستخدم غير موجود", undefined, 404);
    }

    // Prevent admin from deactivating themselves
    if (user.id === admin.id) {
      return errorResponse(
        "CANNOT_MODIFY_SELF",
        "لا يمكنك تعطيل حسابك الخاص",
        undefined,
        400
      );
    }

    const body = await req.json();
    const parsed = toggleUserActiveSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return errorResponse(
        "VALIDATION_ERROR",
        firstError?.message || "بيانات غير صالحة",
        undefined,
        400
      );
    }

    const { isActive } = parsed.data;

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        isActive,
        // If deactivating, also soft-delete
        ...(isActive === false ? { deletedAt: new Date() } : {}),
        // If reactivating, remove soft-delete
        ...(isActive === true ? { deletedAt: null } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    // Also block/unblock in Clerk
    try {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const client = await clerkClient();
      if (isActive) {
        await client.users.unbanUser(user.clerkId);
      } else {
        await client.users.banUser(user.clerkId);
      }
    } catch (clerkError: unknown) {
      logger.error("toggle-user-active", "Failed to update Clerk ban status", clerkError);
    }

    return successResponse(
      { user: updatedUser },
      isActive ? "تم تفعيل المستخدم" : "تم تعطيل المستخدم"
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNAUTHORIZED")) {
      return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);
    }
    if (error instanceof Error && error.message.includes("FORBIDDEN")) {
      return errorResponse("FORBIDDEN", "صلاحيات غير كافية", undefined, 403);
    }
    logger.error("toggle-user-active", "Toggle user active error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}
