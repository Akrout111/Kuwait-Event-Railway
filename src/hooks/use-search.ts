"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface SearchFiltersState {
  search?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  priceFrom?: string;
  priceTo?: string;
  venueId?: string;
  organizerId?: string;
  city?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export function useSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read filters from URL
  const filters: SearchFiltersState = useMemo(() => {
    const params: SearchFiltersState = {};
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const priceFrom = searchParams.get("priceFrom");
    const priceTo = searchParams.get("priceTo");
    const venueId = searchParams.get("venueId");
    const organizerId = searchParams.get("organizerId");
    const city = searchParams.get("city");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" | null;
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    if (search) params.search = search;
    if (category) params.category = category;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (priceFrom) params.priceFrom = priceFrom;
    if (priceTo) params.priceTo = priceTo;
    if (venueId) params.venueId = venueId;
    if (organizerId) params.organizerId = organizerId;
    if (city) params.city = city;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;
    if (page) params.page = parseInt(page, 10);
    if (limit) params.limit = parseInt(limit, 10);

    return params;
  }, [searchParams]);

  // Update URL with new filters (shallow routing)
  const updateFilters = useCallback(
    (newFilters: Partial<SearchFiltersState>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset page to 1 when filters change (unless changing page itself)
      if (!("page" in newFilters)) {
        params.set("page", "1");
      }

      for (const [key, value] of Object.entries(newFilters)) {
        if (value === undefined || value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  // Remove a single filter
  const removeFilter = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Build query string for API
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    }
    return params.toString();
  }, [filters]);

  // React Query for search results
  const {
    data: searchResult,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["events-search", queryString],
    queryFn: async () => {
      const res = await fetch(`/api/v1/events?${queryString}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          (err as Record<string, unknown>)?.error
            ? String((err as Record<string, { message: string }>).error.message)
            : "Failed to search events"
        );
      }
      return res.json();
    },
    staleTime: 30 * 1000,
  });

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.priceFrom || filters.priceTo) count++;
    if (filters.venueId) count++;
    if (filters.organizerId) count++;
    if (filters.city) count++;
    return count;
  }, [filters]);

  return {
    filters,
    updateFilters,
    clearFilters,
    removeFilter,
    searchResult,
    isLoading,
    isError,
    error,
    activeFilterCount,
  };
}

// Suggestions hook with debounce
export function useFetchSuggestions(query: string) {
  return useQuery({
    queryKey: ["search-suggestions", query],
    queryFn: async () => {
      if (query.length < 2) return [];
      const res = await fetch(
        `/api/v1/search/suggestions?q=${encodeURIComponent(query)}&limit=5`
      );
      if (!res.ok) return [];
      const json = await res.json();
      return (json as { data?: unknown[] }).data ?? [];
    },
    enabled: query.length >= 2,
    staleTime: 10 * 1000,
  });
}
