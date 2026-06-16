import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

// GET /api/v1/dashboard/events — Organizer's Events
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["ORGANIZER", "ADMIN"]);

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    // ADMIN sees all events, ORGANIZER only sees their own
    if (user.role !== "ADMIN") {
      where.organizerId = user.id;
    };

    if (status) where.status = status;
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
          createdAt: true,
          category: { select: { nameAr: true, nameEn: true } },
          venue: { select: { nameAr: true, city: true } },
          ticketTiers: {
            select: {
              price: true,
              quantityTotal: true,
              quantitySold: true,
            },
          },
          _count: {
            select: {
              bookings: { where: { status: "CONFIRMED" } },
            },
          },
        },
      }),
      db.event.count({ where }),
    ]);

    return successResponse(
      {
        events: events.map((e) => ({
          ...e,
          startDate: e.startDate.toISOString(),
          createdAt: e.createdAt.toISOString(),
          ticketTiers: e.ticketTiers.map((t) => ({
            ...t,
            price: t.price.toString(),
            quantityAvailable: t.quantityTotal - t.quantitySold,
          })),
          bookingsCount: e._count.bookings,
        })),
      },
      "تم جلب فعاليات المنظم",
      { page, limit, total, totalPages: Math.ceil(total / limit) }
    );
  } catch (error: unknown) {
    if (error instanceof Error && (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED")) {
      return errorResponse(
        error.message === "UNAUTHORIZED" ? "UNAUTHORIZED" : "FORBIDDEN",
        error.message === "UNAUTHORIZED" ? "غير مصرح" : "صلاحيات غير كافية",
        undefined,
        error.message === "UNAUTHORIZED" ? 401 : 403
      );
    }
    logger.error("dashboard-events", "Dashboard events error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}
