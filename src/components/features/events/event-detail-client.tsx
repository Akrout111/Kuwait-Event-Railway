"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown,
} from "lucide-react";

import { BookingForm } from "./booking-form";
import { EventCard } from "./event-card";
import { Section3DBg } from "@/components/ui/section-3d-bg";
import { AnimatedSection } from "@/components/ui/animated-section";
import { formatKWD } from "@/lib/utils";

/* ──────────────────────────────────────────────
   Props
   ────────────────────────────────────────────── */
interface EventDetailClientProps {
  event: {
    id: string;
    titleAr: string;
    titleEn?: string | null;
    descriptionAr: string;
    descriptionEn?: string | null;
    coverImageUrl: string;
    startDate: string;
    startTime: string;
    endTime?: string | null;
    isFeatured: boolean;
    category: { id: string; nameAr: string; nameEn?: string | null; slug: string };
    venue: {
      id: string;
      nameAr: string;
      nameEn?: string | null;
      address: string;
      city: string;
      capacity?: number | null;
    } | null;
    organizer: { id: string; name: string; avatarUrl?: string | null } | null;
    ticketTiers: {
      id: string;
      nameAr: string;
      type: string;
      price: string;
      quantityTotal: number;
      quantitySold: number;
      quantityAvailable: number;
      maxPerBooking: number;
    }[];
    reviews: {
      averageRating: number;
      totalReviews: number;
      recent: {
        id: string;
        rating: number;
        comment?: string | null;
        user: { name: string };
      }[];
    };
    relatedEvents: {
      id: string;
      titleAr: string;
      slug: string;
      coverImageUrl: string;
      startDate: string;
      startTime: string;
      venue: { nameAr: string; nameEn?: string; city: string };
      category: { nameAr: string; slug: string };
      lowestPrice: string;
      isFeatured?: boolean;
      ticketTiers: { price: string; quantityAvailable?: number; quantityTotal?: number; quantitySold?: number }[];
    }[];
  };
}

/* ──────────────────────────────────────────────
   Gold accent divider
   ────────────────────────────────────────────── */
function GoldDivider() {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <Sparkles className="h-4 w-4 text-primary/40" />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
}

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */
export function EventDetailClient({ event }: EventDetailClientProps) {
  const t = useTranslations("eventDetail");
  const tc = useTranslations("common");
  const locale = useLocale();

  const date = new Date(event.startDate);
  const isFree = event.ticketTiers.every((tier) => tier.price === "0.000");

  const localeCode = locale === "ar" ? "ar-KW" : "en-US";

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* ── Interactive 3D Background ── */}
      <Section3DBg theme="cta" />

      {/* Theme-aware gradient overlay for readability */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] bg-background/70"
      />

      <div className="relative z-10 py-8 sm:py-12">
        <div className="container mx-auto px-4">
          {/* ── Breadcrumb ── */}
          <AnimatedSection direction="down" delay={0}>
            <nav
              className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground"
              aria-label="Breadcrumb"
            >
              <Link
                href="/"
                className="transition-colors hover:text-primary"
              >
                {tc("home")}
              </Link>
              {locale === "ar" ? <ChevronLeft className="h-3.5 w-3.5 text-primary/50" /> : <ChevronRight className="h-3.5 w-3.5 text-primary/50" />}
              <Link
                href="/events"
                className="transition-colors hover:text-primary"
              >
                {tc("events")}
              </Link>
              {event.category && (
                <>
                  {locale === "ar" ? <ChevronLeft className="h-3.5 w-3.5 text-primary/50" /> : <ChevronRight className="h-3.5 w-3.5 text-primary/50" />}
                  <Link
                    href={`/categories/${event.category.slug}`}
                    className="transition-colors hover:text-primary"
                  >
                    {locale === "ar" ? event.category.nameAr : (event.category.nameEn || event.category.nameAr)}
                  </Link>
                </>
              )}
              {locale === "ar" ? <ChevronLeft className="h-3.5 w-3.5 text-primary/50" /> : <ChevronRight className="h-3.5 w-3.5 text-primary/50" />}
              <span className="text-foreground font-medium truncate max-w-[200px]">
                {locale === "ar" ? event.titleAr : (event.titleEn || event.titleAr)}
              </span>
            </nav>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Main Content ── */}
            <div className="lg:col-span-2 space-y-8">
              {/* Cover Image */}
              <AnimatedSection direction="up" delay={0.1}>
                <div className="relative rounded-2xl overflow-hidden group aspect-[21/9]">
                  <ImageWithFallback
                    src={event.coverImageUrl}
                    alt={event.titleAr}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                  {/* Gold border on hover */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-500 group-hover:border-primary/40" />
                  {/* Bottom gradient for depth */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/40 to-transparent" />
                </div>
              </AnimatedSection>

              {/* Title + Quick Info */}
              <AnimatedSection direction="up" delay={0.2}>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary border border-primary/20">
                      {locale === "ar" ? event.category?.nameAr : (event.category?.nameEn || event.category?.nameAr)}
                    </span>
                    {event.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                        <Crown className="h-3 w-3" />
                        {t("featured")}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 leading-tight">
                    {locale === "ar" ? event.titleAr : (event.titleEn || event.titleAr)}
                  </h1>
                  {(locale === "ar" ? event.titleEn : event.titleAr) && (
                    <p className="text-muted-foreground text-lg mb-4">
                      {locale === "ar" ? event.titleEn : event.titleAr}
                    </p>
                  )}

                  {/* Quick info pills */}
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 backdrop-blur-sm px-3 py-1.5 text-foreground/80 border border-border">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>
                        {date.toLocaleDateString(localeCode, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 backdrop-blur-sm px-3 py-1.5 text-foreground/80 border border-border">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>
                        {event.startTime}
                        {event.endTime ? ` — ${event.endTime}` : ""}
                      </span>
                    </div>
                    {event.venue && (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 backdrop-blur-sm px-3 py-1.5 text-foreground/80 border border-border">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>
                          {locale === "ar" ? event.venue.nameAr : (event.venue.nameEn || event.venue.nameAr)}{locale === "ar" ? "، " : ", "}{event.venue.city}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedSection>

              <GoldDivider />

              {/* About Section */}
              <AnimatedSection direction="up" delay={0.25}>
                <div>
                  <h2 className="gradient-text text-xl font-semibold mb-4">
                    {t("about")}
                  </h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">
                    {locale === "ar" ? event.descriptionAr : (event.descriptionEn || event.descriptionAr)}
                  </div>
                </div>
              </AnimatedSection>

              <GoldDivider />

              {/* Venue Section */}
              {event.venue && (
                <AnimatedSection direction="up" delay={0.3}>
                  <div>
                    <h2 className="gradient-text text-xl font-semibold mb-4">
                      {t("venue")}
                    </h2>
                    <motion.div
                      className="glass-card rounded-2xl p-6"
                      whileHover={{
                        borderColor: "oklch(0.76 0.13 85 / 0.4)",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-lg">
                            {locale === "ar" ? event.venue.nameAr : (event.venue.nameEn || event.venue.nameAr)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.venue.address}{locale === "ar" ? "، " : ", "}{event.venue.city}
                          </p>
                          {event.venue.capacity && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {t("capacity")}:{" "}
                              {event.venue.capacity.toLocaleString(localeCode)}{" "}
                              {t("person")}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </AnimatedSection>
              )}

              {/* Organizer Section */}
              {event.organizer && (
                <AnimatedSection direction="up" delay={0.35}>
                  <div>
                    <h2 className="gradient-text text-xl font-semibold mb-4">
                      {t("organizer")}
                    </h2>
                    <motion.div
                      className="glass-card rounded-2xl p-6"
                      whileHover={{
                        borderColor: "oklch(0.76 0.13 85 / 0.4)",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/20">
                          {event.organizer.avatarUrl ? (
                            <Image
                              src={event.organizer.avatarUrl}
                              alt={event.organizer.name}
                              width={48}
                              height={48}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-lg">
                            {event.organizer.name}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </AnimatedSection>
              )}

              {/* Reviews Section */}
              {event.reviews.totalReviews > 0 && (
                <>
                  <GoldDivider />
                  <AnimatedSection direction="up" delay={0.4}>
                    <div>
                      <h2 className="gradient-text text-xl font-semibold mb-4">
                        {t("reviews")}
                      </h2>

                      {/* Rating summary */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.round(event.reviews.averageRating)
                                  ? "text-primary fill-primary"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {event.reviews.averageRating.toFixed(1)} (
                          {event.reviews.totalReviews} {t("review")})
                        </span>
                      </div>

                      {/* Recent reviews */}
                      <div className="space-y-4">
                        {event.reviews.recent.map((review) => (
                          <motion.div
                            key={review.id}
                            className="glass-card rounded-xl p-4"
                            whileHover={{
                              borderColor: "oklch(0.76 0.13 85 / 0.3)",
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-sm text-foreground">
                                {review.user.name}
                              </span>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: review.rating }).map(
                                  (_, i) => (
                                    <Star
                                      key={i}
                                      className="h-3 w-3 text-primary fill-primary"
                                    />
                                  )
                                )}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-muted-foreground">
                                {review.comment}
                              </p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </AnimatedSection>
                </>
              )}
            </div>

            {/* ── Sidebar — Booking Form ── */}
            <div className="lg:col-span-1">
              <AnimatedSection direction="left" delay={0.3}>
                <div className="sticky top-20">
                  <div className="rounded-2xl border border-primary/20 p-1.5 bg-card/80 backdrop-blur-sm shadow-xl shadow-primary/5">
                    <BookingForm
                      eventId={event.id}
                      ticketTiers={event.ticketTiers}
                    />
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>

          {/* ── Similar Events ── */}
          {event.relatedEvents && event.relatedEvents.length > 0 && (
            <>
              <div className="mt-16">
                <GoldDivider />
              </div>

              <AnimatedSection direction="up" delay={0.2} className="mt-8">
                <h2 className="gradient-text text-2xl font-bold mb-8">
                  {t("similarEvents")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {event.relatedEvents.map((related, idx) => (
                    <AnimatedSection
                      key={related.id}
                      direction="up"
                      delay={0.1 + idx * 0.08}
                    >
                      <EventCard
                        event={{
                          id: related.id,
                          titleAr: related.titleAr,
                          slug: related.slug,
                          coverImageUrl: related.coverImageUrl,
                          startDate: related.startDate,
                          startTime: related.startTime,
                          venue: related.venue,
                          category: related.category,
                          ticketTiers: related.ticketTiers,
                          isFeatured: related.isFeatured,
                        }}
                        variant="compact"
                      />
                    </AnimatedSection>
                  ))}
                </div>
              </AnimatedSection>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
