import { Noto_Sans_Arabic } from "next/font/google";

/**
 * Shared font configuration for the Kuwait Events Platform.
 * Used by both main and dashboard locale layouts.
 */
export const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});
