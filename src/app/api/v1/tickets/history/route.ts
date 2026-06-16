import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

// GET /api/v1/tickets/history?eventId=xxx — Recent validation history
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["ORGANIZER", "ADMIN"]);

    const eventId = req.nextUrl.searchParams.get("eventId");
    if (!eventId) {
      return errorResponse(
        "VALIDATION_ERROR",
        "eventId مطلوب",
        "eventId",
        400
      );
    }

    // Verify organizer owns this event
    const event = await db.event.findUnique({
      where: { id: eventId, deletedAt: null },
      select: { id: true, organizerId: true },
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

    // Get recently validated tickets (last 50)
    const recentTickets = await db.ticket.findMany({
      where: {
        ticketTier: { eventId },
        isUsed: true,
        usedAt: { not: null },
      },
      orderBy: { usedAt: "desc" },
      take: 50,
      select: {
        id: true,
        ticketNumber: true,
        usedAt: true,
        ticketTier: {
          select: {
            nameAr: true,
            type: true,
            price: true,
          },
        },
        booking: {
          select: {
            attendeeName: true,
            attendeeEmail: true,
            bookingNumber: true,
          },
        },
      },
    });

    return successResponse(
      {
        tickets: recentTickets.map((t) => ({
          ...t,
          usedAt: t.usedAt?.toISOString(),
          ticketTier: {
            ...t.ticketTier,
            price: t.ticketTier.price.toString(),
          },
        })),
      },
      "تم جلب سجل التحقق"
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
    logger.error("ticket-history", "Validation history error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}
