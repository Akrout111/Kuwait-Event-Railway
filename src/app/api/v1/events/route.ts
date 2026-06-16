import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { logger } from "@/lib/logger";
import { getCurrentUser } from "@/lib/auth-server";
import { createEventSchema } from "@/lib/validators/event-schema";
import { generateUniqueSlug } from "@/lib/slug";
import { updateEventMinPrice } from "@/lib/update-event-prices";
import { serializeDecimal } from "@/lib/decimal-serialize";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20") || 20));
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const startDateFrom = searchParams.get("startDateFrom");
    const startDateTo = searchParams.get("startDateTo");
    const venueId = searchParams.get("venueId");
    const isFeatured = searchParams.get("isFeatured") === "true";
    const allowedSortBy = ["startDate", "createdAt", "titleAr", "titleEn", "minPrice"];
    const allowedSortOrder = ["asc", "desc"];
    const sortByParam = searchParams.get("sortBy") ?? "startDate";
    const sortOrderParam = searchParams.get("sortOrder") ?? "asc";
    const sortBy = allowedSortBy.includes(sortByParam) ? sortByParam : "startDate";
    const sortOrder = allowedSortOrder.includes(sortOrderParam) ? (sortOrderParam as "asc" | "desc") : "asc";

    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {
      deletedAt: null,
      status: "PUBLISHED",
    };

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      // SQLite doesn't support mode: "insensitive", use contains
      where.OR = [
        { titleAr: { contains: search } },
        { titleEn: { contains: search } },
        { descriptionAr: { contains: search } },
      ];
    }

    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) where.startDate.gte = new Date(startDateFrom);
      if (startDateTo) where.startDate.lte = new Date(startDateTo);
    }

    if (venueId) {
      where.venueId = venueId;
    }

    if (searchParams.get("isFeatured") !== null) {
      where.isFeatured = isFeatured;
    }

    const [events, total] = await Promise.all([
      db.event.findMany({
        where,
        include: {
          venue: { select: { id: true, nameAr: true, nameEn: true, city: true } },
          category: { select: { id: true, nameAr: true, nameEn: true, slug: true } },
          ticketTiers: {
            select: { id: true, type: true, price: true, quantityTotal: true, quantitySold: true },
          },
          organizer: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.event.count({ where }),
    ]);

    const eventsWithAvailability = serializeDecimal(events.map((event) => ({
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString() ?? null,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      ticketTiers: event.ticketTiers.map((tier) => ({
        ...tier,
        quantityAvailable: tier.quantityTotal - tier.quantitySold,
      })),
    })));

    return successResponse(
      { events: eventsWithAvailability },
      "تم جلب الفعاليات بنجاح",
      { page, limit, total, totalPages: Math.ceil(total / limit) }
    );
  } catch (error: unknown) {
    logger.error("events", "Error fetching events", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في جلب الفعاليات", undefined, 500);
  }
}

// POST /api/v1/events — Create a new event (organizer or admin)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("UNAUTHORIZED", "غير مصرح", undefined, 401);
    if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
      return errorResponse("FORBIDDEN", "صلاحيات غير كافية لإنشاء فعالية", undefined, 403);
    }

    const body = await req.json();
    const parsed = createEventSchema.safeParse(body);
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
    const slug = await generateUniqueSlug(data.titleAr, data.titleEn);

    const event = await db.event.create({
      data: {
        titleAr: data.titleAr,
        titleEn: data.titleEn || null,
        slug,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn || null,
        coverImageUrl: data.coverImageUrl,
        galleryUrls: typeof data.galleryUrls === "string" ? data.galleryUrls : JSON.stringify(data.galleryUrls),
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        startTime: data.startTime,
        endTime: data.endTime || null,
        status: data.status,
        categoryId: data.categoryId,
        venueId: data.venueId || null,
        metadata: JSON.stringify(data.metadata ?? {}),
        organizerId: user.id,
        ticketTiers: {
          create: data.ticketTiers.map((tier) => ({
            nameAr: tier.nameAr,
            nameEn: tier.nameEn || null,
            type: tier.type,
            price: tier.price,
            quantityTotal: tier.quantityTotal,
            maxPerBooking: tier.maxPerBooking,
            description: tier.description || null,
          })),
        },
      },
      include: {
        category: { select: { id: true, nameAr: true, nameEn: true, slug: true } },
        venue: { select: { id: true, nameAr: true, city: true } },
        ticketTiers: true,
        organizer: { select: { id: true, name: true } },
      },
    });

    // Recalculate cached minPrice after creating ticket tiers
    await updateEventMinPrice(event.id);

    return successResponse(
      { event: serializeEvent(event) },
      "تم إنشاء الفعالية بنجاح"
    );
  } catch (error: unknown) {
    logger.error("event-create", "Create event error", error);
    return errorResponse("INTERNAL_ERROR", "خطأ داخلي", undefined, 500);
  }
}

function serializeEvent(event: Record<string, unknown>) {
  return {
    ...event,
    startDate: (event.startDate as Date)?.toISOString?.() ?? event.startDate,
    endDate: (event.endDate as Date)?.toISOString?.() ?? event.endDate,
    minPrice: event.minPrice != null ? String(event.minPrice) : event.minPrice,
    ticketTiers: Array.isArray(event.ticketTiers)
      ? event.ticketTiers.map((t: Record<string, unknown>) => ({
          ...t,
          price: String(t.price),
        }))
      : event.ticketTiers,
  };
}
