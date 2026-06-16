import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { changeUserRoleSchema } from "@/lib/validators/admin-schema";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

// PATCH /api/v1/admin/users/:id/role — Change user role (admin only)
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

    // Find user
    const user = await db.user.findUnique({
      where: { id, deletedAt: null },
    });

    if (!user) {
      return errorResponse("USER_NOT_FOUND", "المستخدم غير موجود", undefined, 404);
    }

    // Prevent admin from demoting themselves
    if (user.id === admin.id) {
      return errorResponse(
        "CANNOT_MODIFY_SELF",
        "لا يمكنك تغيير دورك الخاص",
        undefined,
        400
      );
    }

    // Validate input
    const body = await req.json();
    const parsed = changeUserRoleSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return errorResponse(
        "VALIDATION_ERROR",
        firstError?.message || "بيانات غير صالحة",
        undefined,
        400
      );
    }

    const { role } = parsed.data;

    // Update user role
    const updatedUser = await db.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    // Also update Clerk publicMetadata so frontend can see the new role immediately
    try {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const client = await clerkClient();
      await client.users.updateUser(user.clerkId, {
        publicMetadata: { role },
      });
    } catch (clerkError: unknown) {
      logger.error("change-user-role", "Failed to update Clerk metadata", clerkError);
      // Don't fail the whole request — DB update succeeded
    }

    return successResponse(
      { user: updatedUser },
      `تم تغيير دور المستخدم إلى ${role}`
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNAUTHORIZED")) {
      return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);
    }
    if (error instanceof Error && error.message.includes("FORBIDDEN")) {
      return errorResponse("FORBIDDEN", "صلاحيات غير كافية", undefined, 403);
    }
    logger.error("change-user-role", "Change user role error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}
