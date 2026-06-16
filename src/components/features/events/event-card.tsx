"use client";

import { Link } from "@/i18n/routing";
import { TiltCard } from "@/components/ui/tilt-card";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Badge } from "@/components/ui/badge";
import { formatKWD } from "@/lib/utils";
import { formatLocalizedNumber, formatLocalizedDate } from "@/lib/format-number";
import { useLocale, useTranslations } from "next-intl";
import { Calendar, MapPin, Clock, Users, Crown } from "lucide-react";

/* ──────────────────────────────────────────────
   Props
   ────────────────────────────────────────────── */
interface EventCardProps {
  event: {
    id: string;
    titleAr: string;
    titleEn?: string | null;
    slug: string;
    coverImageUrl: string;
    startDate: string | Date;
    startTime?: string;
    venue?: { nameAr: string; nameEn?: string | null; city?: string } | null;
    category?: { nameAr: string; nameEn?: string | null; slug: string } | null;
    ticketTiers: {
      price: string;
      quantityAvailable?: number;
      quantityTotal?: number;
      quantitySold?: number;
    }[];
    isFeatured?: boolean;
  };
  variant?: "default" | "compact" | "featured";
}

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */
export function EventCard({ event, variant = "default" }: EventCardProps) {
  const locale = useLocale();
  const tCommon = useTranslations("common");

  /* ── Derived data ── */
  const lowestPrice =
    event.ticketTiers.length > 0
      ? Math.min(...event.ticketTiers.map((t) => parseFloat(t.price)))
      : 0;
  const isFree = lowestPrice === 0;
  const date = new Date(event.startDate);

  const availableTickets = event.ticketTiers.reduce((sum, t) => {
    if (t.quantityAvailable !== undefined) return sum + t.quantityAvailable;
    if (t.quantityTotal !== undefined && t.quantitySold !== undefined)
      return sum + (t.quantityTotal - t.quantitySold);
    return sum;
  }, 0);

  /* ────────────────────────────────────────────
     Featured variant — cinematic overlay card
     ──────────────────────────────────────────── */
  if (variant === "featured") {
    return (
      <Link
        href={`/events/${event.slug}`}
        className="group block outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
      >
        <TiltCard className="rounded-xl" tiltAmount={8}>
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
            {/* Image */}
            <ImageWithFallback
              src={event.coverImageUrl}
              alt={locale === "ar" ? event.titleAr : (event.titleEn || event.titleAr)}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Cinematic gradient overlay — darker at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5 transition-all duration-500 group-hover:from-black/70 group-hover:via-black/20 group-hover:to-transparent" />

            {/* Gold border on hover */}
            <div className="absolute inset-0 rounded-xl border border-transparent transition-colors duration-300 group-hover:border-primary/40" />

            {/* Category badge — top-start, gold background */}
            {event.category && (
              <Badge className="absolute top-4 start-4 bg-primary text-primary-foreground border-0 shadow-lg text-xs font-semibold px-3 py-1">
                {locale === "ar" ? event.category.nameAr : (event.category.nameEn || event.category.nameAr)}
              </Badge>
            )}

            {/* Featured crown badge — top-end */}
            {event.isFeatured && (
              <div className="absolute top-4 end-4 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-yellow-300 border border-yellow-500/20">
                <Crown className="h-3 w-3" />
                <span>{tCommon("featured")}</span>
              </div>
            )}

            {/* Bottom content area */}
            <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white leading-tight mb-2 line-clamp-2">
                {locale === "ar" ? event.titleAr : (event.titleEn || event.titleAr)}
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  {formatLocalizedDate(date, locale)}
                </span>
                {event.venue && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {locale === "ar" ? event.venue.nameAr : (event.venue.nameEn || event.venue.nameAr)}
                  </span>
                )}
              </div>

              {/* Price — gold gradient at bottom-end */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-white/60">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{event.startTime ?? ""}</span>
                </div>
                <span className="price-gold text-base sm:text-lg font-bold">
                  {isFree ? tCommon("free") : `${tCommon("from")} ${formatKWD(lowestPrice, locale)}`}
                </span>
              </div>
            </div>
          </div>
        </TiltCard>
      </Link>
    );
  }

  /* ────────────────────────────────────────────
     Default / Compact variant — elegant card + hover video
     ──────────────────────────────────────────── */
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
    >
      <TiltCard
        className="rounded-xl"
        tiltAmount={variant === "compact" ? 5 : 8}
      >
        <div className="overflow-hidden rounded-xl bg-card border border-border/60 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:border-primary/40">
          {/* ── Image section ── */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <ImageWithFallback
              src={event.coverImageUrl}
              alt={locale === "ar" ? event.titleAr : (event.titleEn || event.titleAr)}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Gold shimmer hover overlay — pure CSS, no video needed */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-primary/5 to-transparent" />
              <div className="absolute inset-0 shimmer" />
            </div>

            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

            {/* Subtle gradient at bottom of image for smooth transition */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card/40 to-transparent" />

            {/* Featured badge */}
            {event.isFeatured && (
              <div className="absolute top-3 start-3 z-10 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-lg border-0">
                <Crown className="h-3 w-3" />
                <span>{tCommon("featured")}</span>
              </div>
            )}
          </div>

          {/* ── Content section ── */}
          <div className={variant === "compact" ? "p-3" : "p-4"}>
            {/* Category badge */}
            {event.category && (
              <Badge
                variant="secondary"
                className="mb-2 text-[0.68rem] font-medium"
              >
                {locale === "ar" ? event.category.nameAr : (event.category.nameEn || event.category.nameAr)}
              </Badge>
            )}

            {/* Title */}
            <h3
              className={`font-semibold leading-tight line-clamp-2 mb-2 ${
                variant === "compact" ? "text-sm" : "text-base"
              }`}
            >
              {locale === "ar" ? event.titleAr : (event.titleEn || event.titleAr)}
            </h3>

            {/* Date / Time / Venue */}
            <div
              className={`space-y-1.5 text-muted-foreground ${
                variant === "compact" ? "text-xs" : "text-sm"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span>{formatLocalizedDate(date, locale)}</span>
                <span className="mx-1 text-border">|</span>
                <Clock className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span>{event.startTime ?? ""}</span>
              </div>
              {event.venue && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                  <span className="truncate">{locale === "ar" ? event.venue.nameAr : (event.venue.nameEn || event.venue.nameAr)}</span>
                </div>
              )}
            </div>

            {/* Bottom section — price & tickets */}
            <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
              <span
                className={`font-bold price-gold ${
                  variant === "compact" ? "text-sm" : "text-base"
                }`}
              >
                {isFree ? tCommon("free") : `${tCommon("from")} ${formatKWD(lowestPrice, locale)}`}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {formatLocalizedNumber(availableTickets, locale)} {tCommon("remaining")}
              </span>
            </div>
          </div>
        </div>
      </TiltCard>
    </Link>
  );
}
