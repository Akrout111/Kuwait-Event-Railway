import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as KWD currency
 * KWD has 3 decimal places (e.g., 12.500 KWD)
 */
export function formatKWD(
  amount: number | string,
  locale: string = "en"
) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  const formatter = new Intl.NumberFormat(
    locale === "ar" ? "ar-KW" : "en-KW",
    {
      style: "currency",
      currency: "KWD",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }
  );
  return formatter.format(value);
}
