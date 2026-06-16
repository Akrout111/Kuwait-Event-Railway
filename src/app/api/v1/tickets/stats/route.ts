import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

// GET /api/v1/tickets/stats?eventId=xxx — Ticket validation stats for an event
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["ORGANIZER", "ADMIN"]);

    const eventId = req.nextUrl.searchParams.get("eventId");
    if (!eventId) {
      return errorResponse("VALIDATION_ERROR", "eventId مطلوب", "eventId", 400);
    }

    // Verify organizer owns this event
    const event = await db.event.findUnique({
      where: { id: eventId, deletedAt: null },
      select: { id: true, organizerId: true, titleAr: true, titleEn: true },
    });

    if (!event) {
      return errorResponse(
        "EVENT_NOT_FOUND",
        "الفعالية غير موجودة",
        undefined,
        404
      );
    }

    if (user.role !== "ADMIN" && event.organizerId !== user.id) {
      return errorResponse("FORBIDDEN", "غير مسموح", undefined, 403);
    }

    // Get ticket stats
    const [totalTickets, usedTickets, unusedTickets, totalBookings, checkedInBookings] =
      await Promise.all([
        // Total tickets for confirmed bookings
        db.ticket.count({
          where: {
            ticketTier: { eventId },
            booking: { status: "CONFIRMED" },
          },
        }),
        // Used tickets
        db.ticket.count({
          where: {
            ticketTier: { eventId },
            booking: { status: "CONFIRMED" },
            isUsed: true,
          },
        }),
        // Unused tickets
        db.ticket.count({
          where: {
            ticketTier: { eventId },
            booking: { status: "CONFIRMED" },
            isUsed: false,
          },
        }),
        // Total confirmed bookings
        db.booking.count({
          where: { eventId, status: "CONFIRMED" },
        }),
        // Bookings with at least one checked-in ticket
        db.booking.count({
          where: {
            eventId,
            status: "CONFIRMED",
            tickets: { some: { isUsed: true } },
          },
        }),
      ]);

    return successResponse(
      {
        event: {
          id: event.id,
          titleAr: event.titleAr,
          titleEn: event.titleEn,
        },
        stats: {
          totalTickets,
          usedTickets,
          unusedTickets,
          checkInRate:
            totalTickets > 0
              ? ((usedTickets / totalTickets) * 100).toFixed(1)
              : "0.0",
          totalBookings,
          checkedInBookings,
        },
      },
      "تم جلب إحصائيات التذاكر"
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
    logger.error("ticket-stats", "Ticket stats error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}
