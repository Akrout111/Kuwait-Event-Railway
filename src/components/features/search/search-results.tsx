"use client";

import { useTranslations } from "next-intl";
import { useSearch } from "@/hooks/use-search";
import { EventCard } from "@/components/features/events/event-card";
import { HighlightText } from "./highlight-text";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EventData {
  id: string;
  titleAr: string;
  titleEn?: string | null;
  slug: string;
  coverImageUrl: string;
  startDate: string;
  startTime?: string | null;
  venue?: { nameAr: string; nameEn?: string | null; city: string } | null;
  category?: { id: string; nameAr: string; nameEn?: string | null; slug: string } | null;
  ticketTiers: Array<{
    id: string;
    type: string;
    price: string;
    quantityTotal: number;
    quantitySold: number;
    quantityAvailable: number;
  }>;
  isFeatured?: boolean;
  averageRating?: number;
  totalReviews?: number;
  headline?: string | null;
}

export function SearchResults() {
  const t = useTranslations("search");
  const tc = useTranslations("common");
  const { searchResult, isLoading, isError, filters, updateFilters } =
    useSearch();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive text-lg">{t("errorLoading")}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          {tc("retry")}
        </Button>
      </div>
    );
  }

  const events = (searchResult?.data?.events ?? []) as EventData[];
  const meta = searchResult?.meta as
    | { page: number; limit: number; total: number; totalPages: number }
    | undefined;

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">{t("noResults")}</h3>
        <p className="text-muted-foreground mb-4">{t("noResultsHint")}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        {t("resultsCount", { count: meta?.total ?? 0 })}
      </div>

      {/* Event grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id}>
            <EventCard event={event} />
            {/* Show headline if available (from full-text search) */}
            {event.headline && (
              <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                <HighlightText text={event.headline} query="" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateFilters({ page: (meta.page || 1) - 1 })
            }
            disabled={meta.page <= 1}
          >
            <ChevronRight className="h-4 w-4 me-1" />
            {t("previous")}
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            {meta.page} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateFilters({ page: (meta.page || 1) + 1 })
            }
            disabled={meta.page >= meta.totalPages}
          >
            {t("next")}
            <ChevronLeft className="h-4 w-4 ms-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
