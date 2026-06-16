/**
 * Prisma Decimal serialization helpers
 * ──────────────────────────────────────────────────────────────
 * Prisma returns `Decimal` (Prisma.Decimal) for `@db.Decimal` columns in PostgreSQL.
 * `Decimal` is NOT JSON-serializable and cannot be passed directly from a Server
 * Component to a Client Component — TypeScript will reject it because the client
 * side expects `string`.
 *
 * Use `decimalToString` when building props for client components, and use
 * `serializeDecimal` for deep conversion of nested objects returned from Prisma.
 */

import { Prisma } from "@prisma/client";

/**
 * Convert a single Prisma Decimal (or null/undefined) to a string.
 * Falls back to "0" if the value is null/undefined and `fallback` is not provided.
 */
export function decimalToString(
  value: Prisma.Decimal | string | number | null | undefined,
  fallback = "0"
): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  // Prisma.Decimal has a toString() method
  return value.toString();
}

/**
 * Recursively walk a value and convert any Prisma.Decimal to string.
 * Useful for API responses that include nested Decimal fields.
 *
 * Note: This performs a deep clone via JSON parse/stringify AFTER conversion,
 * so non-JSON values (functions, undefined, etc.) are stripped — which is fine
 * for data being sent to the client or as an API response.
 */
export function serializeDecimal<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (value instanceof Prisma.Decimal) {
    return value.toString() as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map(serializeDecimal) as unknown as T;
  }
  if (value instanceof Date) {
    return value as unknown as T;
  }
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      // @ts-expect-error — we are constructing a new object
      result[key] = serializeDecimal((value as Record<string, unknown>)[key]);
    }
    return result as unknown as T;
  }
  return value;
}
