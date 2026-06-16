import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createCategorySchema } from "@/lib/validators/admin-schema";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

// GET /api/v1/admin/categories — List categories with event counts (admin only)
export async function GET() {
  try {
    await requireRole(["ADMIN"]);

    const categories = await db.category.findMany({
      orderBy: { nameAr: "asc" },
      include: {
        _count: {
          select: {
            events: { where: { deletedAt: null } },
          },
        },
      },
    });

    return successResponse(
      {
        categories: categories.map((c) => ({
          ...c,
          eventsCount: c._count.events,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        })),
      },
      "تم جلب التصنيفات"
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNAUTHORIZED")) {
      return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);
    }
    if (error instanceof Error && error.message.includes("FORBIDDEN")) {
      return errorResponse("FORBIDDEN", "صلاحيات غير كافية", undefined, 403);
    }
    logger.error("admin-categories", "Admin categories list error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}

// POST /api/v1/admin/categories — Create category (admin only)
export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const rateLimitResult = checkRateLimit(getClientIdentifier(req), { limit: 10, windowSeconds: 60 });
    if (!rateLimitResult.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429);
    }

    await requireRole(["ADMIN"]);

    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);
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

    // Check slug uniqueness
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

    const category = await db.category.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn ?? "",
        slug: data.slug,
        iconUrl: data.iconUrl && data.iconUrl !== "" ? data.iconUrl : null,
        description: data.description || null,
      },
    });

    return successResponse({ category }, "تم إنشاء التصنيف بنجاح");
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNAUTHORIZED")) {
      return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);
    }
    if (error instanceof Error && error.message.includes("FORBIDDEN")) {
      return errorResponse("FORBIDDEN", "صلاحيات غير كافية", undefined, 403);
    }
    logger.error("create-category", "Create category error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}
