import crypto from "crypto";
import { BOOKING_EXPIRY_MINUTES } from "./constants";

/**
 * Generates a unique booking number in the format: EVT-2026-000001
 */
export function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const random = crypto.randomInt(0, 999999).toString().padStart(6, "0");
  return `EVT-${year}-${random}`;
}

/**
 * Generates a unique ticket number in the format: TCK-XXXX-XXXX
 * Excludes I, O, 0, 1 to avoid confusion
 */
export function generateTicketNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "TCK-";
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 4; i++) {
    result += chars[bytes[i]! % chars.length];
  }
  result += "-";
  for (let i = 4; i < 8; i++) {
    result += chars[bytes[i]! % chars.length];
  }
  return result;
}

/**
 * Calculates the booking expiry time
 */
export function getBookingExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + BOOKING_EXPIRY_MINUTES);
  return expiry;
}
