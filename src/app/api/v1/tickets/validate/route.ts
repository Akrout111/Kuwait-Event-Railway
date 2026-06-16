import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { validateTicketSchema } from "@/lib/validators/ticket-schema";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

// POST /api/v1/tickets/validate — Validate a ticket at event entrance
export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const rateLimitResult = checkRateLimit(getClientIdentifier(req), { limit: 30, windowSeconds: 60 });
    if (!rateLimitResult.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429);
    }

    const user = await requireRole(["ORGANIZER", "ADMIN"]);

    const body = await req.json();
    const parsed = validateTicketSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return errorResponse(
        "VALIDATION_ERROR",
        firstError?.message || "بيانات غير صالحة",
        firstError?.path[0]?.toString(),
        400
      );
    }

    const { ticketNumber, eventId } = parsed.data;

    // ── Step 1: Verify organizer owns this event & fetch event details ──
    const event = await db.event.findUnique({
      where: { id: eventId, deletedAt: null },
      select: {
        id: true,
        organizerId: true,
        titleAr: true,
        titleEn: true,
        startDate: true,
        startTime: true,
      },
    });

    if (!event) {
      return errorResponse(
        "EVENT_NOT_FOUND",
        "الفعالية غير موجودة",
        undefined,
        404
      );
    }

    // Only the event organizer or an admin can validate tickets for this event
    if (user.role !== "ADMIN" && event.organizerId !== user.id) {
      return errorResponse(
        "FORBIDDEN",
        "غير مسموح بالتحقق من تذاكر فعالية لا تملكها",
        undefined,
        403
      );
    }

    // Build event info object for reuse in responses
    const eventInfo = {
      ...event,
      startDate: event.startDate.toISOString(),
    };

    // ── Step 2: Find the ticket ──
    const ticket = await db.ticket.findUnique({
      where: { ticketNumber },
      include: {
        ticketTier: {
          select: {
            nameAr: true,
            nameEn: true,
            type: true,
            price: true,
            eventId: true,
          },
        },
        booking: {
          select: {
            id: true,
            attendeeName: true,
            attendeeEmail: true,
            attendeePhone: true,
            status: true,
            bookingNumber: true,
            quantity: true,
            eventId: true,
          },
        },
      },
    });

    if (!ticket) {
      return successResponse(
        {
          valid: false,
          ticket: null,
          reason: "TICKET_NOT_FOUND",
        },
        "التذكرة غير موجودة"
      );
    }

    // ── Step 3: Verify ticket belongs to this event ──
    if (ticket.ticketTier.eventId !== eventId) {
      return successResponse(
        {
          valid: false,
          ticket: null,
          reason: "WRONG_EVENT",
        },
        "التذكرة لا تنتمي لهذه الفعالية"
      );
    }

    // ── Step 4: Verify booking is confirmed ──
    if (ticket.booking.status !== "CONFIRMED") {
      return successResponse(
        {
          valid: false,
          ticket: {
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            isUsed: ticket.isUsed,
            usedAt: ticket.usedAt?.toISOString() ?? null,
            ticketTier: {
              ...ticket.ticketTier,
              price: ticket.ticketTier.price.toString(),
            },
            booking: ticket.booking,
            event: null,
          },
          reason: "BOOKING_NOT_CONFIRMED",
        },
        "حجز هذه التذكرة غير مؤكد"
      );
    }

    // ── Step 5: Check if already used ──
    if (ticket.isUsed) {
      return successResponse(
        {
          valid: false,
          ticket: {
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            isUsed: true,
            usedAt: ticket.usedAt?.toISOString() ?? null,
            ticketTier: {
              ...ticket.ticketTier,
              price: ticket.ticketTier.price.toString(),
            },
            booking: ticket.booking,
            event: eventInfo,
          },
          reason: "ALREADY_USED",
        },
        "التذكرة مُستخدمة بالفعل"
      );
    }

    // ── Step 6: Mark ticket as used (atomic update with race condition protection) ──
    const updateResult = await db.ticket.updateMany({
      where: { id: ticket.id, isUsed: false },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    if (updateResult.count === 0) {
      return successResponse(
        {
          valid: false,
          ticket: null,
          reason: "ALREADY_USED",
        },
        "التذكرة مُستخدمة بالفعل"
      );
    }

    // ── Step 7: Return success (reuse ticket data + event from step 1) ──
    return successResponse(
      {
        valid: true,
        ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          isUsed: true,
          usedAt: new Date().toISOString(),
          ticketTier: {
            ...ticket.ticketTier,
            price: ticket.ticketTier.price.toString(),
          },
          booking: ticket.booking,
          event: eventInfo,
        },
        reason: null,
      },
      "تم التحقق من التذكرة بنجاح"
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
    logger.error("ticket-validation", "Ticket validation error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}
