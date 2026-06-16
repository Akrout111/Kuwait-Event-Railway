import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import type { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";

// GET /api/v1/admin/events — List ALL events including drafts (admin only)
export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const isFeatured = searchParams.get("isFeatured");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const where: Prisma.EventWhereInput = {};

    if (!includeDeleted) where.deletedAt = null;
    if (status) where.status = status;
    if (isFeatured !== null && isFeatured !== undefined && isFeatured !== "") {
      where.isFeatured = isFeatured === "true";
    }
    if (search) {
      where.OR = [
        { titleAr: { contains: search } },
        { titleEn: { contains: search } },
      ];
    }

    const [events, total] = await Promise.all([
      db.event.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          titleAr: true,
          titleEn: true,
          slug: true,
          status: true,
          isFeatured: true,
          startDate: true,
          startTime: true,
          coverImageUrl: true,
          minPrice: true,
          deletedAt: true,
          createdAt: true,
          organizer: {
            select: { id: true, name: true, email: true, role: true },
          },
          category: {
            select: { id: true, nameAr: true, nameEn: true, slug: true },
          },
          venue: {
            select: { id: true, nameAr: true, city: true },
          },
          ticketTiers: {
            select: {
              price: true,
              quantityTotal: true,
              quantitySold: true,
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
      }),
      db.event.count({ where }),
    ]);

    // Status stats
    const statusStats = await db.event.groupBy({
      by: ["status"],
      where: includeDeleted ? {} : { deletedAt: null },
      _count: { status: true },
    });

    return successResponse(
      {
        events: events.map((e) => ({
          ...e,
          startDate: e.startDate.toISOString(),
          createdAt: e.createdAt.toISOString(),
          deletedAt: e.deletedAt?.toISOString() ?? null,
          ticketTiers: e.ticketTiers.map((t) => ({
            ...t,
            price: t.price.toString(),
            quantityAvailable: t.quantityTotal - t.quantitySold,
          })),
          bookingsCount: e._count.bookings,
          reviewsCount: e._count.reviews,
          totalCapacity: e.ticketTiers.reduce((sum, t) => sum + t.quantityTotal, 0),
          totalSold: e.ticketTiers.reduce((sum, t) => sum + t.quantitySold, 0),
        })),
        statusStats: statusStats.reduce(
          (acc, s) => ({ ...acc, [s.status]: s._count.status }),
          {} as Record<string, number>
        ),
      },
      "تم جلب الفعاليات",
      { page, limit, total, totalPages: Math.ceil(total / limit) }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNAUTHORIZED")) {
      return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);
    }
    if (error instanceof Error && error.message.includes("FORBIDDEN")) {
      return errorResponse("FORBIDDEN", "صلاحيات غير كافية", undefined, 403);
    }
    logger.error("admin-events", "Admin events list error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}
