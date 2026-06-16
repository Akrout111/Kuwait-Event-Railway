"use client";

import { useState } from "react";
import { useEvents } from "@/hooks/use-events";
import { EventCard } from "./event-card";
import { EventFilters } from "./event-filters";
import { useTranslations, useLocale } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Section3DBg } from "@/components/ui/section-3d-bg";
import { motion } from "framer-motion";
import type { CategoryItem, EventItem } from "@/types/api";
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  AlertTriangle,
  X,
  SearchX,
} from "lucide-react";

interface BrowseEventsClientProps {
  categories: CategoryItem[];
}

export function BrowseEventsClient({ categories }: BrowseEventsClientProps) {
  const t = useTranslations("events");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    category: "",
    search: "",
    startDateFrom: "",
    startDateTo: "",
    sortBy: "startDate",
    sortOrder: "asc" as "asc" | "desc",
  });

  const { data, isLoading, error } = useEvents(filters);

  const handleFilterChange = (newFilters: Record<string, unknown>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      category: "",
      search: "",
      startDateFrom: "",
      startDateTo: "",
      sortBy: "startDate",
      sortOrder: "asc",
    });
  };

  const hasActiveFilters =
    filters.category || filters.search || filters.startDateFrom || filters.startDateTo;

  return (
    <section className="relative py-8 overflow-hidden min-h-screen">
      {/* ── Interactive 3D Background ── */}
      <Section3DBg theme="events" />

      {/* Theme-aware gradient overlay for readability */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] bg-background/70"
      />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Gold decorative line divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <Sparkles className="h-5 w-5 text-primary/60" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>

        {/* Section header */}
        <AnimatedSection direction="up" delay={0}>
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text leading-tight">
              {t("pageTitle")}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              {t("subtitle")}
            </p>
          </div>
        </AnimatedSection>

        {/* Filters */}
        <EventFilters
          categories={categories}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={clearFilters}
        />

        {/* Loading state with shimmer */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border overflow-hidden glass-card"
              >
                <Skeleton className="aspect-[16/10] w-full shimmer" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4 shimmer" />
                  <Skeleton className="h-4 w-1/2 shimmer" />
                  <Skeleton className="h-4 w-1/3 shimmer" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state with premium styling */}
        {error && (
          <AnimatedSection direction="up">
            <Card className="border-destructive/20 bg-gradient-to-b from-destructive/5 to-transparent max-w-lg mx-auto mt-8">
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
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10"
                >
                  <AlertTriangle className="h-10 w-10 text-destructive" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  {tc("error")}
                </h3>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                >
                  {tc("retry")}
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>
        )}

        {/* Empty state with premium styling */}
        {data?.data?.events && data.data.events.length === 0 && (
          <AnimatedSection direction="up">
            <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-transparent max-w-md mx-auto mt-8">
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
                  <SearchX className="h-10 w-10 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 gradient-text">
                  {t("noEvents")}
                </h3>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-4 gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                  >
                    <X className="h-4 w-4" />
                    {tc("clearFilters")}
                  </Button>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        )}

        {/* Events grid with stagger animation */}
        {data?.data?.events && data.data.events.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {data.data.events.map((event: EventItem, index: number) => (
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

            {/* Premium Pagination */}
            {data.meta && data.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 disabled:opacity-40 disabled:hover:bg-transparent"
                  size="sm"
                >
                  {locale === "ar" ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  {t("prev")}
                </Button>

                <span className="text-sm text-muted-foreground px-3 font-medium">
                  {t("pageOf", {
                    page: data.meta.page,
                    total: data.meta.totalPages,
                  })}
                </span>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= data.meta.totalPages}
                  className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 disabled:opacity-40 disabled:hover:bg-transparent"
                  size="sm"
                >
                  {t("next")}
                  {locale === "ar" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
