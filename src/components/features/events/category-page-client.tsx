"use client";

import { EventCard } from "./event-card";
import { useTranslations, useLocale } from "next-intl";
import { Calendar, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Section3DBg } from "@/components/ui/section-3d-bg";
import { AnimatedSection } from "@/components/ui/animated-section";
import { motion } from "framer-motion";
import type { CategoryItem, EventItem } from "@/types/api";

interface CategoryPageClientProps {
  category: CategoryItem;
  events: EventItem[];
}

export function CategoryPageClient({ category, events }: CategoryPageClientProps) {
  const t = useTranslations("category");
  const locale = useLocale();

  return (
    <section className="relative py-8 overflow-hidden min-h-screen">
      {/* ── Interactive 3D Background ── */}
      <Section3DBg theme="categories" />

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

        {/* Header */}
        <AnimatedSection direction="up" delay={0}>
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text leading-tight">
              {t("eventsIn")} {locale === "ar" ? category.nameAr : (category.nameEn || category.nameAr)}
            </h1>
            {(locale === "ar" ? category.nameEn : category.nameAr) && (
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                {locale === "ar" ? category.nameEn : category.nameAr}
              </p>
            )}
          </div>
        </AnimatedSection>

        {events.length === 0 ? (
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
                  {t("noEventsInCategory")}
                </h3>
              </CardContent>
            </Card>
          </AnimatedSection>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index: number) => (
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
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
