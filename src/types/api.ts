// API response types for Kuwait Events Platform

// Re-export the discriminated union ApiResponse from index.ts
export type { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from "./index";

// ───────────────────────────────────────────────
// Domain types used in client components
// (derived from Prisma schema + API include shapes)
// ───────────────────────────────────────────────

/** Category as returned by API (with optional _count for events) */
export interface CategoryItem {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  slug: string;
  iconUrl?: string | null;
  description?: string | null;
  _count?: { events: number };
  eventCount?: number;
}

/** Ticket tier as returned in event listings */
export interface TicketTierItem {
  id?: string;
  nameAr?: string;
  nameEn?: string | null;
  type?: string;
  price: string;
  quantityTotal: number;
  quantitySold: number;
  quantityAvailable?: number;
  maxPerBooking?: number;
  description?: string | null;
}

/** Venue as returned in event listings */
export interface VenueItem {
  id?: string;
  nameAr: string;
  nameEn?: string | null;
  address?: string;
  city?: string;
  capacity?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  slug?: string;
  coordinates?: string | null;
}

/** Event as returned by list/search API (used in grids & cards) */
export interface EventItem {
  id: string;
  titleAr: string;
  titleEn?: string | null;
  slug: string;
  coverImageUrl: string;
  startDate: string | Date;
  startTime: string;
  endTime?: string | null;
  status?: string;
  isFeatured?: boolean;
  descriptionAr?: string;
  descriptionEn?: string | null;
  category?: { id: string; nameAr: string; nameEn?: string | null; slug: string } | null;
  venue?: VenueItem | null;
  organizer?: { id: string; name: string } | null;
  ticketTiers: TicketTierItem[];
}

/** Venue detail as returned by venue page API (includes events) */
export interface VenueDetail {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  slug: string;
  address: string;
  city: string;
  capacity?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  coordinates?: string | null;
  events: EventItem[];
}

/** Booking as returned by user bookings API */
export interface BookingItem {
  id: string;
  bookingNumber: string;
  status: string;
  totalAmount: string;
  quantity: number;
  attendeeName: string;
  attendeePhone: string;
  attendeeEmail: string;
  createdAt: string;
  event: {
    id: string;
    titleAr: string;
    titleEn?: string | null;
    slug?: string;
    coverImageUrl: string;
    startDate: string;
    startTime: string;
    venue?: { nameAr: string } | null;
  };
  tickets?: Array<{
    id: string;
    ticketNumber: string;
    ticketTier?: { nameAr: string; nameEn?: string | null; price: string };
  }>;
  payment?: { id: string; status: string } | null;
}
