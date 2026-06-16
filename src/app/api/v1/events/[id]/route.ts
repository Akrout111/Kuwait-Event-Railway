import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { updateEventSchema } from "@/lib/validators/event-schema";
import { generateUniqueSlug } from "@/lib/slug";
import { logger } from "@/lib/logger";
import { updateEventMinPrice } from "@/lib/update-event-prices";

// GET /api/v1/events/:id — Get single event (supports both id and slug)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idOrSlug } = await params;

    // Lookup by id OR slug in a single query
    const event = await db.event.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        deletedAt: null,
        status: "PUBLISHED",
      },
      include: {
        venue: true,
        category: { select: { id: true, nameAr: true, nameEn: true, slug: true } },
        organizer: { select: { id: true, name: true, avatarUrl: true } },
        ticketTiers: {},
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, avatarUrl: true } } },
        },
      },
    });

    if (!event) {
      return errorResponse("EVENT_NOT_FOUND", "الفعالية غير موجودة", undefined, 404);
    }

    // Calculate review stats
    const reviewStats = await db.review.aggregate({
      where: { eventId: event.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const eventWithStats = {
      ...event,
      ticketTiers: event.ticketTiers.map((tier) => ({
        ...tier,
        quantityAvailable: tier.quantityTotal - tier.quantitySold,
      })),
      reviews: {
        averageRating: reviewStats._avg.rating
          ? parseFloat(reviewStats._avg.rating.toFixed(1))
          : 0,
        totalReviews: reviewStats._count.rating,
        recent: event.reviews.map((r) => ({
          ...r,
          organizerReply: r.organizerReply,
          organizerRepliedAt: r.organizerRepliedAt?.toISOString() ?? null,
          createdAt: r.createdAt.toISOString(),
        })),
      },
    };

    return successResponse({ event: eventWithStats }, "تم جلب الفعالية بنجاح");
  } catch (error: unknown) {
    logger.error("event-detail", "Error fetching event", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ", undefined, 500);
  }
}

// PATCH /api/v1/events/:id — Update Event (owner or admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return errorResponse("UNAUTHORIZED", "غير مصرح", undefined, 401);

    // Find existing event
    const existing = await db.event.findUnique({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return errorResponse("EVENT_NOT_FOUND", "الفعالية غير موجودة", undefined, 404);
    }

    // Ownership check: organizer must own it, admin can edit any
    if (user.role !== "ADMIN" && existing.organizerId !== user.id) {
      return errorResponse("FORBIDDEN", "غير مسموح بتعديل هذه الفعالية", undefined, 403);
    }

    const body = await req.json();
    const parsed = updateEventSchema.safeParse(body);
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

    // If title changed, regenerate slug
    let slug = existing.slug;
    if (data.titleAr && data.titleAr !== existing.titleAr) {
      slug = await generateUniqueSlug(data.titleAr, data.titleEn);
    }

    const updateData: Record<string, unknown> = {
      ...(data.titleAr !== undefined && { titleAr: data.titleAr }),
      ...(data.titleEn !== undefined && { titleEn: data.titleEn || null }),
      ...(data.descriptionAr !== undefined && { descriptionAr: data.descriptionAr }),
      ...(data.descriptionEn !== undefined && { descriptionEn: data.descriptionEn || null }),
      ...(data.coverImageUrl !== undefined && { coverImageUrl: data.coverImageUrl }),
      ...(data.galleryUrls !== undefined && { galleryUrls: typeof data.galleryUrls === "string" ? data.galleryUrls : JSON.stringify(data.galleryUrls) }),
      ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
      ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
      ...(data.startTime !== undefined && { startTime: data.startTime }),
      ...(data.endTime !== undefined && { endTime: data.endTime || null }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.venueId !== undefined && { venueId: data.venueId || null }),
      ...(data.metadata !== undefined && { metadata: JSON.stringify(data.metadata) }),
      ...(data.status !== undefined && { status: data.status }),
      slug,
    };

    // If ticketTiers provided, replace them
    if (data.ticketTiers && data.ticketTiers.length > 0) {
      // Delete existing tiers and create new ones
      await db.ticketTier.deleteMany({ where: { eventId: id } });
      updateData.ticketTiers = {
        create: data.ticketTiers.map((tier) => ({
          nameAr: tier.nameAr,
          nameEn: tier.nameEn || null,
          type: tier.type,
          price: tier.price,
          quantityTotal: tier.quantityTotal,
          maxPerBooking: tier.maxPerBooking,
          description: tier.description || null,
        })),
      };
    }

    const event = await db.event.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, nameAr: true, nameEn: true, slug: true } },
        venue: { select: { id: true, nameAr: true, city: true } },
        ticketTiers: true,
        organizer: { select: { id: true, name: true } },
      },
    });

    // Recalculate cached minPrice after ticket tier changes
    if (data.ticketTiers && data.ticketTiers.length > 0) {
      await updateEventMinPrice(id);
    }

    return successResponse(
      { event: serializeEvent(event) },
      "تم تحديث الفعالية بنجاح"
    );
  } catch (error: unknown) {
    logger.error("event-update", "Update event error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}

// DELETE /api/v1/events/:id — Soft Delete (owner or admin)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return errorResponse("UNAUTHORIZED", "غير مصرح", undefined, 401);

    const existing = await db.event.findUnique({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return errorResponse("EVENT_NOT_FOUND", "الفعالية غير موجودة", undefined, 404);
    }

    // Ownership check
    if (user.role !== "ADMIN" && existing.organizerId !== user.id) {
      return errorResponse("FORBIDDEN", "غير مسموح بحذف هذه الفعالية", undefined, 403);
    }

    // Cannot delete event with confirmed bookings
    const confirmedBookings = await db.booking.count({
      where: { eventId: id, status: "CONFIRMED" },
    });
    if (confirmedBookings > 0) {
      return errorResponse(
        "EVENT_HAS_BOOKINGS",
        "لا يمكن حذف فعالية بها حجوزات مؤكدة. يمكنك إلغاؤها بدلاً من ذلك.",
        undefined,
        409
      );
    }

    // Soft delete
    await db.event.update({
      where: { id },
      data: { deletedAt: new Date(), status: "CANCELLED" },
    });

    return successResponse(null, "تم حذف الفعالية");
  } catch (error: unknown) {
    logger.error("event-delete", "Delete event error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}

function serializeEvent(event: Record<string, unknown>) {
  return {
    ...event,
    startDate: (event.startDate as Date)?.toISOString?.() ?? event.startDate,
    endDate: (event.endDate as Date)?.toISOString?.() ?? event.endDate,
    ticketTiers: Array.isArray(event.ticketTiers)
      ? event.ticketTiers.map((t: Record<string, unknown>) => ({
          ...t,
          price: String(t.price),
        }))
      : event.ticketTiers,
  };
}
