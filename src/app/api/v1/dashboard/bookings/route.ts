import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

// GET /api/v1/dashboard/bookings — Bookings for Organizer's Events
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["ORGANIZER", "ADMIN"]);

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const eventId = searchParams.get("eventId") || undefined;
    const status = searchParams.get("status") || undefined;

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    // ADMIN sees bookings for all events; ORGANIZER only sees their own
    if (user.role !== "ADMIN") {
      const orgEvents = await db.event.findMany({
        where: { organizerId: user.id, deletedAt: null },
        select: { id: true },
      });
      const orgEventIds = orgEvents.map((e) => e.id);
      where.eventId = { in: orgEventIds };
      if (eventId) where.eventId = eventId;
    } else if (eventId) {
      where.eventId = eventId;
    }

    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          bookingNumber: true,
          status: true,
          totalAmount: true,
          quantity: true,
          attendeeName: true,
          attendeeEmail: true,
          attendeePhone: true,
          createdAt: true,
          event: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              startDate: true,
            },
          },
          payment: {
            select: {
              id: true,
              status: true,
              method: true,
              transactionId: true,
            },
          },
          tickets: {
            select: {
              id: true,
              ticketNumber: true,
              isUsed: true,
              ticketTier: { select: { nameAr: true, type: true } },
            },
          },
        },
      }),
      db.booking.count({ where }),
    ]);

    return successResponse(
      {
        bookings: bookings.map((b) => ({
          ...b,
          totalAmount: b.totalAmount.toString(),
          event: {
            ...b.event,
            startDate: b.event.startDate.toISOString(),
          },
        })),
      },
      "تم جلب الحجوزات",
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
    logger.error("dashboard-bookings", "Dashboard bookings error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}
