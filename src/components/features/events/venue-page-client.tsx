"use client";

import { EventCard } from "./event-card";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, Users, Sparkles, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Card, CardContent } from "@/components/ui/card";
import { Section3DBg } from "@/components/ui/section-3d-bg";
import { AnimatedSection } from "@/components/ui/animated-section";
import { motion } from "framer-motion";
import type { VenueDetail, EventItem, TicketTierItem } from "@/types/api";

interface VenuePageClientProps {
  venue: VenueDetail;
}

export function VenuePageClient({ venue }: VenuePageClientProps) {
  const t = useTranslations("venue");
  const locale = useLocale();

  return (
    <section className="relative py-8 overflow-hidden min-h-screen">
      {/* ── Interactive 3D Background ── */}
      <Section3DBg theme="stats" />

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

        {/* Venue Header */}
        <AnimatedSection direction="up" delay={0}>
          <div className="mb-8">
            {venue.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden group aspect-[21/9] mb-4">
                <ImageWithFallback
                  src={venue.imageUrl}
                  alt={locale === "ar" ? venue.nameAr : (venue.nameEn || venue.nameAr)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text leading-tight mb-2">
              {locale === "ar" ? venue.nameAr : (venue.nameEn || venue.nameAr)}
            </h1>
            {(locale === "ar" ? venue.nameEn : venue.nameAr) && <p className="text-muted-foreground mb-3">{locale === "ar" ? venue.nameEn : venue.nameAr}</p>}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 border border-primary/20">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{venue.address}{locale === "ar" ? "، " : ", "}{venue.city}</span>
              </div>
              {venue.capacity && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 border border-primary/20">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{t("capacity")}: {venue.capacity.toLocaleString(locale === "ar" ? "ar-KW" : "en-US")}</span>
                </div>
              )}
            </div>
            {venue.description && (
              <p className="mt-3 text-muted-foreground">{venue.description}</p>
            )}
          </div>
        </AnimatedSection>

        {/* Upcoming Events */}
        <AnimatedSection direction="up" delay={0.15}>
          <h2 className="text-2xl font-bold gradient-text mb-4">{t("upcomingEvents")}</h2>
        </AnimatedSection>

        {venue.events.length === 0 ? (
          <AnimatedSection direction="up">
            <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-transparent max-w-md mx-auto">
              <CardContent className="p-10 text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
                >
                  <Calendar className="h-10 w-10 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 gradient-text">
                  {t("noUpcomingEvents")}
                </h3>
              </CardContent>
            </Card>
          </AnimatedSection>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venue.events.map((event: EventItem, index: number) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <EventCard
                  event={{
                    ...event,
                    coverImageUrl: event.coverImageUrl ?? "",
                    startTime: event.startTime ?? "",
                    ticketTiers: event.ticketTiers.map((tier: TicketTierItem) => ({
                      ...tier,
                      quantityAvailable: Math.max(0, tier.quantityTotal - tier.quantitySold),
                    })),
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
