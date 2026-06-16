"use client";

import { useTranslations } from "next-intl";
import { useSearch } from "@/hooks/use-search";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export function ActiveFilters() {
  const t = useTranslations("search");
  const { filters, removeFilter, activeFilterCount } = useSearch();

  if (activeFilterCount === 0) return null;

  const filterBadges: Array<{ key: string; label: string; value: string }> =
    [];

  if (filters.search) {
    filterBadges.push({
      key: "search",
      label: t("searchLabel"),
      value: filters.search,
    });
  }
  if (filters.category) {
    filterBadges.push({
      key: "category",
      label: t("categoryLabel"),
      value: filters.category,
    });
  }
  if (filters.city) {
    filterBadges.push({
      key: "city",
      label: t("cityLabel"),
      value: filters.city,
    });
  }
  if (filters.dateFrom || filters.dateTo) {
    const from = filters.dateFrom ?? "...";
    const to = filters.dateTo ?? "...";
    filterBadges.push({
      key: "dateFrom",
      label: t("dateLabel"),
      value: `${from} → ${to}`,
    });
  }
  if (filters.priceFrom || filters.priceTo) {
    const from = filters.priceFrom ?? "0";
    const to = filters.priceTo ?? "...";
    filterBadges.push({
      key: "priceFrom",
      label: t("priceLabel"),
      value: `${from} - ${to} KWD`,
    });
  }
  if (filters.venueId) {
    filterBadges.push({
      key: "venueId",
      label: t("venueLabel"),
      value: filters.venueId,
    });
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-muted-foreground">
        {t("activeFilters")}:
      </span>
      {filterBadges.map((badge) => (
        <Badge
          key={badge.key}
          variant="secondary"
          className="gap-1 ps-2 pe-1 py-1"
        >
          <span className="text-xs">
            {badge.label}: {badge.value}
          </span>
          <button
            type="button"
            onClick={() => {
              if (badge.key === "dateFrom") {
                removeFilter("dateFrom");
                removeFilter("dateTo");
              } else if (badge.key === "priceFrom") {
                removeFilter("priceFrom");
                removeFilter("priceTo");
              } else {
                removeFilter(badge.key);
              }
            }}
            className="ms-1 rounded-full hover:bg-muted p-0.5"
            aria-label={`${t("remove")} ${badge.label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
