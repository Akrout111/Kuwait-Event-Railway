"use client";

import { useTranslations } from "next-intl";
import { useSearch, type SearchFiltersState } from "@/hooks/use-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal, X } from "lucide-react";

interface CategoryItem {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  slug: string;
}

interface VenueItem {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  city: string;
}

interface FilterPanelProps {
  categories: CategoryItem[];
  venues: VenueItem[];
}

export function FilterPanel({ categories, venues }: FilterPanelProps) {
  const t = useTranslations("search");
  const { filters, updateFilters, clearFilters, activeFilterCount } = useSearch();

  // Unique cities from venues
  const cities = Array.from(
    new Set(venues.map((v) => v.city).filter(Boolean))
  ).sort();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <SlidersHorizontal className="h-4 w-4" />
          {t("filters")}
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -end-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="end" className="w-full sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            {t("filterPanel")}
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 me-1" />
                {t("clearAll")}
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label>{t("category")}</Label>
            <Select
              value={filters.category ?? ""}
              onValueChange={(value) =>
                updateFilters({
                  category: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories")}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>{t("dateRange")}</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-xs text-muted-foreground">{t("from")}</span>
                <Input
                  type="date"
                  value={filters.dateFrom ?? ""}
                  onChange={(e) =>
                    updateFilters({ dateFrom: e.target.value || undefined })
                  }
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">{t("to")}</span>
                <Input
                  type="date"
                  value={filters.dateTo ?? ""}
                  onChange={(e) =>
                    updateFilters({ dateTo: e.target.value || undefined })
                  }
                />
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label>{t("priceRange")}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                step="0.001"
                min="0"
                value={filters.priceFrom ?? ""}
                onChange={(e) =>
                  updateFilters({ priceFrom: e.target.value || undefined })
                }
                placeholder={t("minPrice")}
              />
              <Input
                type="number"
                step="0.001"
                min="0"
                value={filters.priceTo ?? ""}
                onChange={(e) =>
                  updateFilters({ priceTo: e.target.value || undefined })
                }
                placeholder={t("maxPrice")}
              />
            </div>
            <p className="text-xs text-muted-foreground">{t("priceInKWD")}</p>
          </div>

          {/* City Filter */}
          {cities.length > 0 && (
            <div className="space-y-2">
              <Label>{t("city")}</Label>
              <Select
                value={filters.city ?? ""}
                onValueChange={(value) =>
                  updateFilters({ city: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("allCities")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allCities")}</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Venue Filter */}
          {venues.length > 0 && (
            <div className="space-y-2">
              <Label>{t("venue")}</Label>
              <Select
                value={filters.venueId ?? ""}
                onValueChange={(value) =>
                  updateFilters({
                    venueId: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("allVenues")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allVenues")}</SelectItem>
                  {venues.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Sort By */}
          <div className="space-y-2">
            <Label>{t("sortBy")}</Label>
            <Select
              value={filters.sortBy ?? "startDate"}
              onValueChange={(value) =>
                updateFilters({ sortBy: value } as Partial<SearchFiltersState>)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startDate">{t("sortDate")}</SelectItem>
                <SelectItem value="price">{t("sortPrice")}</SelectItem>
                <SelectItem value="createdAt">{t("sortNewest")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <Label>{t("sortOrder")}</Label>
            <Select
              value={filters.sortOrder ?? "asc"}
              onValueChange={(value) =>
                updateFilters({ sortOrder: value as "asc" | "desc" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">{t("ascending")}</SelectItem>
                <SelectItem value="desc">{t("descending")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
