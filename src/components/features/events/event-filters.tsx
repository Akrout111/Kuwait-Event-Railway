"use client";

import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Search, X, SlidersHorizontal, Calendar } from "lucide-react";
import type { CategoryItem } from "@/types/api";

interface EventFiltersProps {
  categories: CategoryItem[];
  filters: {
    category: string;
    search: string;
    startDateFrom: string;
    startDateTo: string;
    sortBy: string;
    sortOrder: string;
  };
  onFilterChange: (filters: Record<string, unknown>) => void;
  onClear: () => void;
}

const PREMIUM_CUBIC = [0.22, 1, 0.36, 1] as const;

export function EventFilters({ categories, filters, onFilterChange, onClear }: EventFiltersProps) {
  const t = useTranslations("events");
  const locale = useLocale();

  const hasActiveFilters = filters.category || filters.search || filters.startDateFrom || filters.startDateTo;

  const currentSortValue = `${filters.sortBy}-${filters.sortOrder}`;

  return (
    <AnimatedSection direction="up" delay={0.1}>
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              {t("filterSort")}
            </span>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-primary transition-colors duration-300"
              style={{ transitionTimingFunction: `cubic-bezier(${PREMIUM_CUBIC.join(",")})` }}
            >
              <X className="h-3.5 w-3.5 me-1.5" />
              {t("clear")}
            </Button>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t("filterSearch")}
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className={`ps-9 bg-background/50 border-border/50 focus-visible:border-primary/50 focus-visible:ring-primary/20 transition-all duration-300 ${
                filters.search ? "border-primary/40 bg-primary/5" : ""
              }`}
              style={{ transitionTimingFunction: `cubic-bezier(${PREMIUM_CUBIC.join(",")})` }}
            />
            {filters.search && (
              <div className="absolute end-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </div>

          {/* Category Select */}
          <Select
            value={filters.category}
            onValueChange={(value) => onFilterChange({ category: value === "__all__" ? "" : value })}
          >
            <SelectTrigger
              className={`w-full sm:w-[180px] bg-background/50 border-border/50 transition-all duration-300 ${
                filters.category ? "border-primary/40 bg-primary/5" : ""
              }`}
              style={{ transitionTimingFunction: `cubic-bezier(${PREMIUM_CUBIC.join(",")})` }}
            >
              <SelectValue placeholder={t("allCategories")} />
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="__all__">{t("allCategories")}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {locale === "ar" ? cat.nameAr : (cat.nameEn || cat.nameAr)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date From */}
          <div className="relative">
            <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={filters.startDateFrom}
              onChange={(e) => onFilterChange({ startDateFrom: e.target.value })}
              placeholder={t("filterDate")}
              className={`ps-9 w-full sm:w-auto bg-background/50 border-border/50 focus-visible:border-primary/50 focus-visible:ring-primary/20 transition-all duration-300 ${
                filters.startDateFrom ? "border-primary/40 bg-primary/5" : ""
              }`}
              style={{ transitionTimingFunction: `cubic-bezier(${PREMIUM_CUBIC.join(",")})` }}
            />
          </div>

          {/* Sort Select */}
          <Select
            value={currentSortValue}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split("-");
              onFilterChange({ sortBy, sortOrder });
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50 transition-all duration-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="startDate-asc">{t("sortDateAsc")}</SelectItem>
              <SelectItem value="startDate-desc">{t("sortDateDesc")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active filter indicators */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/30">
            {filters.search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                <Search className="h-3 w-3" />
                {filters.search}
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {(() => {
                  const cat = categories.find((c) => c.slug === filters.category);
                  return cat ? (locale === "ar" ? cat.nameAr : (cat.nameEn || cat.nameAr)) : filters.category;
                })()}
              </span>
            )}
            {filters.startDateFrom && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {filters.startDateFrom}
              </span>
            )}
          </div>
        )}
      </div>
    </AnimatedSection>
  );
}
