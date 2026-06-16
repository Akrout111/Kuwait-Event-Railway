import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { updateCategorySchema } from "@/lib/validators/admin-schema";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

// PATCH /api/v1/admin/categories/:id — Update category (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit check
    const rateLimitResult = checkRateLimit(getClientIdentifier(req), { limit: 30, windowSeconds: 60 });
    if (!rateLimitResult.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429);
    }

    await requireRole(["ADMIN"]);
    const { id } = await params;

    const category = await db.category.findUnique({ where: { id } });
    if (!category) {
      return errorResponse("CATEGORY_NOT_FOUND", "التصنيف غير موجود", undefined, 404);
    }

    const body = await req.json();
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return errorResponse(
        "VALIDATION_ERROR",
        firstError?.message || "بيانات غير صالحة",
        firstError?.path[0]?.toString(),
        400
      );
    }

    const data = parsed.data;

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== category.slug) {
      const existing = await db.category.findUnique({
        where: { slug: data.slug },
      });
      if (existing) {
        return errorResponse(
          "SLUG_ALREADY_EXISTS",
          "الرابط المختصر مستخدم بالفعل",
          "slug",
          409
        );
      }
    }

    const updatedCategory = await db.category.update({
      where: { id },
      data: {
        ...(data.nameAr !== undefined && { nameAr: data.nameAr }),
        ...(data.nameEn !== undefined && { nameEn: data.nameEn ?? undefined }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.iconUrl !== undefined && {
          iconUrl: data.iconUrl && data.iconUrl !== "" ? data.iconUrl : null,
        }),
        ...(data.description !== undefined && {
          description: data.description || null,
        }),
      },
    });

    return successResponse(
      { category: updatedCategory },
      "تم تحديث التصنيف بنجاح"
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNAUTHORIZED")) {
      return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);
    }
    if (error instanceof Error && error.message.includes("FORBIDDEN")) {
      return errorResponse("FORBIDDEN", "صلاحيات غير كافية", undefined, 403);
    }
    logger.error("update-category", "Update category error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}

// DELETE /api/v1/admin/categories/:id — Delete category (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit check
    const rateLimitResult = checkRateLimit(getClientIdentifier(req), { limit: 30, windowSeconds: 60 });
    if (!rateLimitResult.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429);
    }

    await requireRole(["ADMIN"]);
    const { id } = await params;

    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    if (!category) {
      return errorResponse("CATEGORY_NOT_FOUND", "التصنيف غير موجود", undefined, 404);
    }

    // Prevent deletion if category has events
    if (category._count.events > 0) {
      return errorResponse(
        "CATEGORY_HAS_EVENTS",
        `لا يمكن حذف التصنيف لأنه يحتوي على ${category._count.events} فعالية. قم بنقل الفعاليات أولاً.`,
        undefined,
        409
      );
    }

    await db.category.delete({ where: { id } });

    return successResponse(null, "تم حذف التصنيف بنجاح");
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNAUTHORIZED")) {
      return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);
    }
    if (error instanceof Error && error.message.includes("FORBIDDEN")) {
      return errorResponse("FORBIDDEN", "صلاحيات غير كافية", undefined, 403);
    }
    logger.error("delete-category", "Delete category error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}
