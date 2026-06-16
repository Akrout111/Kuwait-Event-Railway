/**
 * Localized number and date formatting utilities
 * Supports Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) for Arabic locale
 */

/**
 * Format a number using locale-appropriate numerals
 * Arabic locale: ٠١٢٣٤٥٦٧٨٩
 * English locale: 0123456789
 */
export function formatLocalizedNumber(value: number, locale: string): string {
  if (locale === "ar") {
    return new Intl.NumberFormat("ar-KW", {
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(value);
}

/**
 * Format a price value with currency
 * Uses KWD currency for both locales
 */
export function formatPrice(value: number | string, locale: string): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) return locale === "ar" ? "٠ د.ك" : "0 KWD";

  if (locale === "ar") {
    return new Intl.NumberFormat("ar-KW", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(numValue) + " د.ك";
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
    style: "currency",
    currency: "KWD",
  }).format(numValue);
}

/**
 * Format a date in the appropriate locale
 * Arabic: ١٥ مارس ٢٠٢٥
 * English: March 15, 2025
 */
export function formatLocalizedDate(
  date: Date | string,
  locale: string
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "";

  if (locale === "ar") {
    return new Intl.DateTimeFormat("ar-KW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  }
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Format a short date (day + month only)
 * Arabic: ١٥ مارس
 * English: Mar 15
 */
export function formatShortDate(
  date: Date | string,
  locale: string
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "";

  if (locale === "ar") {
    return new Intl.DateTimeFormat("ar-KW", {
      month: "short",
      day: "numeric",
    }).format(d);
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(d);
}
