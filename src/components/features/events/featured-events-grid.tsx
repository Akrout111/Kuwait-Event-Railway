"use client";

import { EventCard } from "./event-card";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Section3DBg } from "@/components/ui/section-3d-bg";
import { ArrowLeft, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { EventItem } from "@/types/api";

interface FeaturedEventsGridProps {
  events: EventItem[];
}

export function FeaturedEventsGrid({ events }: FeaturedEventsGridProps) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");

  // Empty state with premium design
  if (events.length === 0) {
    return (
      <section className="relative container mx-auto px-4 py-16 overflow-hidden">
        {/* 3D shapes background */}
        <Section3DBg theme="events" />

        {/* Decorative gold line */}
        <div className="relative z-10 flex items-center gap-4 mb-10">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <Sparkles className="h-5 w-5 text-primary/60" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        <AnimatedSection direction="up">
          <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-transparent max-w-md mx-auto overflow-hidden">
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
                {t("noFeaturedTitle")}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t("noFeaturedSubtitle")}
              </p>
            </CardContent>
          </Card>
        </AnimatedSection>
      </section>
    );
  }

  return (
    <section className="relative container mx-auto px-4 py-16 overflow-hidden">
      {/* 3D shapes background */}
      <Section3DBg theme="events" />

      {/* Decorative gold line above section */}
      <div className="relative z-10 flex items-center gap-4 mb-10">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <Sparkles className="h-5 w-5 text-primary/60" />
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      {/* Section header */}
      <AnimatedSection direction="up" delay={0}>
        <div className="relative z-10 flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold gradient-text leading-tight">
              {tCommon("featuredEvents")}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              {t("featuredSubtitle")}
            </p>
          </div>
          <Link href="/events" className="hidden sm:block">
            <Button
              variant="ghost"
              className="group gap-2 text-primary hover:text-primary hover:bg-primary/10 transition-colors"
            >
              {t("viewAll")}
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Button>
          </Link>
        </div>
      </AnimatedSection>

      {/* Events grid */}
      <AnimatedSection direction="up" delay={0.15}>
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event: EventItem, index: number) => (
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
              <EventCard event={event} variant="featured" />
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* Mobile "View All" link */}
      <div className="relative z-10 mt-8 text-center sm:hidden">
        <Link href="/events">
          <Button
            variant="outline"
            className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
          >
            {t("viewAll")}
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
