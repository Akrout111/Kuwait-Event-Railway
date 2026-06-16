"use client";

import { useState } from "react";
import { useBookings, useCancelBooking } from "@/hooks/use-booking";
import { formatKWD } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Sparkles } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Section3DBg } from "@/components/ui/section-3d-bg";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import type { BookingItem } from "@/types/api";

export function MyBookingsClient() {
  const locale = useLocale();
  const t = useTranslations("bookings");
  const tCommon = useTranslations("common");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const cancelBooking = useCancelBooking();

  const statusMap = {
    upcoming: "CONFIRMED",
    past: "CONFIRMED",
    cancelled: "CANCELLED",
  };

  const { data, isLoading } = useBookings({
    status: statusMap[activeTab],
  });

  const bookings = data?.data?.bookings ?? [];

  const tabLabels: Record<string, string> = {
    upcoming: t("tabs.upcoming"),
    past: t("tabs.past"),
    cancelled: t("tabs.cancelled"),
  };

  const statusLabels: Record<string, string> = {
    CONFIRMED: t("status.confirmed"),
    PENDING: t("status.pending"),
    CANCELLED: t("status.cancelled"),
    REFUNDED: t("status.refunded"),
  };

  const statusColors: Record<string, string> = {
    CONFIRMED: "text-success",
    PENDING: "text-warning",
    CANCELLED: "text-destructive",
    REFUNDED: "text-info",
  };

  const emptyMessages: Record<string, string> = {
    upcoming: t("noUpcoming"),
    past: t("noPast"),
    cancelled: t("noCancelled"),
  };

  return (
    <section className="relative py-8 overflow-hidden min-h-screen">
      {/* ── Interactive 3D Background ── */}
      <Section3DBg theme="testimonials" />

      {/* Theme-aware gradient overlay for readability */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] bg-background/70"
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Gold decorative line */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <Sparkles className="h-5 w-5 text-primary/60" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        <h1 className="text-3xl font-bold gradient-text mb-6">{t("title")}</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b pb-2">
          {(["upcoming", "past", "cancelled"] as const).map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tabLabels[tab]}
            </Button>
          ))}
        </div>

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-4 flex gap-4">
                <Skeleton className="h-20 w-32 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && bookings.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              {emptyMessages[activeTab]}
            </p>
            <Button asChild>
              <Link href="/events">{t("browseEvents")}</Link>
            </Button>
          </div>
        )}

        {!isLoading && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking: BookingItem) => {
              const date = new Date(booking.event.startDate);
              const eventTitle = locale === "ar" ? booking.event.titleAr : (booking.event.titleEn ?? booking.event.titleAr);
              const venueName = booking.event.venue
                ? (locale === "ar" ? booking.event.venue.nameAr : (booking.event.venue.nameEn ?? booking.event.venue.nameAr))
                : null;

              return (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className="block rounded-xl border p-4 hover:shadow-md transition-shadow bg-card/80 backdrop-blur-sm"
                >
                  <div className="flex gap-4">
                    <ImageWithFallback
                      src={booking.event.coverImageUrl}
                      alt={eventTitle}
                      className="h-20 w-32 rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium truncate">{eventTitle}</h3>
                        <span className={`text-xs font-medium whitespace-nowrap ${statusColors[booking.status] ?? "text-muted-foreground"}`}>
                          {statusLabels[booking.status] ?? booking.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-0.5 mt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          <span>{date.toLocaleDateString(locale === "ar" ? "ar-KW" : "en-US")}</span>
                        </div>
                        {venueName && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" />
                            <span>{venueName}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {t("ticketCount", { count: booking.quantity })} • {t("bookingNumber")}: {booking.bookingNumber}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatKWD(booking.totalAmount, locale)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
