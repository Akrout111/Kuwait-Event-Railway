import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import type { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

// GET /api/v1/admin/users — List all users (admin only)
export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || undefined;
    const role = searchParams.get("role") || undefined;
    const isActive = searchParams.get("isActive");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const where: Prisma.UserWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (role) where.role = role;
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      where.isActive = isActive === "true";
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          clerkId: true,
          email: true,
          name: true,
          phone: true,
          avatarUrl: true,
          role: true,
          isActive: true,
          deletedAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              events: { where: { deletedAt: null } },
              bookings: { where: { deletedAt: null } },
              reviews: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    // Role distribution stats
    const roleStats = await db.user.groupBy({
      by: ["role"],
      where: { deletedAt: null },
      _count: { role: true },
    });

    return successResponse(
      {
        users: users.map((u) => ({
          ...u,
          eventsCount: u._count.events,
          bookingsCount: u._count.bookings,
          reviewsCount: u._count.reviews,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
          deletedAt: u.deletedAt?.toISOString() ?? null,
        })),
        roleStats: roleStats.reduce(
          (acc, s) => ({ ...acc, [s.role]: s._count.role }),
          {} as Record<string, number>
        ),
      },
      "تم جلب المستخدمين",
      { page, limit, total, totalPages: Math.ceil(total / limit) }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNAUTHORIZED")) {
      return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);
    }
    if (error instanceof Error && error.message.includes("FORBIDDEN")) {
      return errorResponse("FORBIDDEN", "صلاحيات غير كافية", undefined, 403);
    }
    logger.error("admin-users", "Admin users list error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}
