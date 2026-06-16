// App constants for Kuwait Events Platform

export const ROLES = {
  ATTENDEE: "ATTENDEE",
  ORGANIZER: "ORGANIZER",
  ADMIN: "ADMIN",
} as const;

export const EVENT_STATUSES = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  CANCELLED: "CANCELLED",
  SOLD_OUT: "SOLD_OUT",
  COMPLETED: "COMPLETED",
} as const;

export const BOOKING_STATUSES = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

export const PAYMENT_STATUSES = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export const TICKET_TYPES = {
  STANDARD: "STANDARD",
  VIP: "VIP",
  EARLY_BIRD: "EARLY_BIRD",
  GROUP: "GROUP",
} as const;

export const CURRENCY = {
  code: "KWD",
  nameAr: "دينار كويتي",
  nameEn: "Kuwaiti Dinar",
  symbolAr: "د.ك",
  decimals: 3,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const BOOKING_EXPIRY_MINUTES = 15;

/** Development-only JWT secret — NEVER use in production */
export const DEV_JWT_SECRET = "dev-jwt-secret-do-not-use-in-production-32ch";
