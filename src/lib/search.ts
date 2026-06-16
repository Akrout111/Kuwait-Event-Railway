import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export interface SearchEventsParams {
  query?: string;
  category?: string;
  city?: string;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: "startDate" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * Search and filter events with sorting support.
 *
 * Price sorting uses the cached `minPrice` field on the Event model,
 * which is kept in sync by `updateEventMinPrice()` whenever ticket tiers change.
 */
export async function searchEvents({
  query,
  category,
  city,
  startDateFrom,
  startDateTo,
  sortBy = "startDate",
  sortOrder = "asc",
  page = 1,
  limit = 20,
}: SearchEventsParams) {
  const startDateFilter: Prisma.DateTimeFilter = {};
  if (startDateFrom) startDateFilter.gte = new Date(startDateFrom);
  if (startDateTo) startDateFilter.lte = new Date(startDateTo);

  const where: Prisma.EventWhereInput = {
    deletedAt: null,
    status: "PUBLISHED",
    ...(Object.keys(startDateFilter).length > 0 ? { startDate: startDateFilter } : {}),
  };

  if (query) {
    where.OR = [
      { titleAr: { contains: query } },
      { titleEn: { contains: query } },
      { descriptionAr: { contains: query } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (city) {
    where.venue = { city };
  }

  // Build orderBy — when sortBy is "price", use the cached minPrice field
  const prismaOrderBy: Prisma.EventOrderByWithRelationInput =
    sortBy === "price"
      ? { minPrice: sortOrder }
      : { [sortBy]: sortOrder };

  const skip = (page - 1) * limit;

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
      orderBy: prismaOrderBy,
      skip,
      take: limit,
    }),
    db.event.count({ where }),
  ]);

  const eventsWithAvailability = events.map((event) => ({
    ...event,
    ticketTiers: event.ticketTiers.map((tier) => ({
      ...tier,
      quantityAvailable: tier.quantityTotal - tier.quantitySold,
    })),
  }));

  return {
    events: eventsWithAvailability,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
