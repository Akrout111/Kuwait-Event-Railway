"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { TiltCard } from "@/components/ui/tilt-card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Section3DBg } from "@/components/ui/section-3d-bg";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import type { CategoryItem } from "@/types/api";

// Fallback emoji map for categories without icons
const CATEGORY_EMOJIS: Record<string, string> = {
  music: "🎵",
  sport: "⚽",
  tech: "💻",
  food: "🍽️",
  culture: "🎭",
  business: "💼",
  art: "🎨",
};

function getCategoryEmoji(category: CategoryItem): string {
  if (category.iconUrl) return "";
  const slug = category.slug?.toLowerCase() ?? "";
  const nameEn = category.nameEn?.toLowerCase() ?? "";
  return (
    CATEGORY_EMOJIS[slug] ??
    CATEGORY_EMOJIS[nameEn] ??
    "📅"
  );
}

interface CategoryCarouselProps {
  categories: CategoryItem[];
}

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  // Embla carousel setup — RTL-aware
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: true,
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    direction: locale === "ar" ? "rtl" : "ltr",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    /* eslint-disable react-hooks/set-state-in-effect -- initial sync required after embla carousel mounts */
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollSnaps(emblaApi.scrollSnapList());
    /* eslint-enable react-hooks/set-state-in-effect */
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="relative py-16 sm:py-20 bg-background overflow-hidden">
      {/* ── Interactive 3D shapes background ── */}
      <Section3DBg theme="categories" />

      {/* Subtle decorative blobs — theme-aware */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-1/4 -start-1/4 w-[50vw] h-[50vw] rounded-full animate-morph-blob opacity-20 dark:opacity-30"
          style={{
            background:
              "radial-gradient(circle, oklch(0.76 0.13 85 / 8%) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-1/4 -end-1/4 w-[40vw] h-[40vw] rounded-full animate-morph-blob opacity-15 dark:opacity-20"
          style={{
            background:
              "radial-gradient(circle, oklch(0.76 0.13 85 / 6%) 0%, transparent 70%)",
            animationDelay: "-4s",
            animationDuration: "14s",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <AnimatedSection direction="up" delay={0}>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                <span className="gradient-text">{tCommon("categories")}</span>
              </h2>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                {t("categoriesSubtitle")}
              </p>
            </div>

            {/* Desktop navigation arrows */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="h-10 w-10 rounded-full border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 hover:text-primary disabled:opacity-30 transition-all"
                aria-label={t("prevCategory")}
              >
                {locale === "ar" ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="h-10 w-10 rounded-full border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 hover:text-primary disabled:opacity-30 transition-all"
                aria-label={t("nextCategory")}
              >
                {locale === "ar" ? (
                  <ChevronLeft className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </AnimatedSection>

        {/* Embla Carousel */}
        <AnimatedSection direction="up" delay={0.15}>
          <div className="relative">
            {/* Carousel viewport */}
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex gap-5" style={{ direction: locale === "ar" ? "rtl" : "ltr" }}>
                {categories.map((cat, index: number) => {
                  const emoji = getCategoryEmoji(cat);
                  const eventCount =
                    cat._count?.events ?? cat.eventCount ?? 0;
                  const displayName = locale === "ar" ? cat.nameAr : (cat.nameEn || cat.nameAr);

                  return (
                    <div
                      key={cat.id}
                      className="flex-none w-[160px] sm:w-[180px] lg:w-[200px]"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.05,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <Link href={`/categories/${cat.slug}`}>
                          <TiltCard tiltAmount={6} className="h-full">
                            <Card className="h-full border-primary/10 bg-card hover:border-primary/40 transition-colors duration-300 cursor-pointer overflow-hidden group shadow-sm hover:shadow-md">
                              <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                                {/* Category icon / emoji */}
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                                  {cat.iconUrl ? (
                                    <Image
                                      src={cat.iconUrl}
                                      alt={displayName}
                                      width={32}
                                      height={32}
                                      className="h-8 w-8 object-contain"
                                    />
                                  ) : (
                                    <span className="text-2xl">{emoji}</span>
                                  )}
                                </div>

                                {/* Category name */}
                                <h3 className="font-bold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                  {displayName}
                                </h3>

                                {/* Event count */}
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {eventCount}{" "}
                                    {eventCount === 1
                                      ? t("eventSingular")
                                      : t("eventPlural")}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </TiltCard>
                        </Link>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Edge fade gradients — RTL-safe using CSS variables */}
            <div className="pointer-events-none absolute inset-y-0 start-0 w-12 [background:linear-gradient(to_right,var(--color-background),transparent)]" />
            <div className="pointer-events-none absolute inset-y-0 end-0 w-12 [background:linear-gradient(to_left,var(--color-background),transparent)]" />
          </div>
        </AnimatedSection>

        {/* Mobile dots indicator */}
        <div className="flex sm:hidden items-center justify-center gap-2 mt-6">
          {scrollSnaps.map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              onClick={() => scrollTo(index)}
              className={`h-4 w-4 p-0 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? "w-6 bg-primary hover:bg-primary"
                  : "bg-primary/25 hover:bg-primary/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
