"use client";

import { useQuery } from "@tanstack/react-query";

interface EventFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  startDateFrom?: string;
  startDateTo?: string;
  venueId?: string;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));
      if (filters.category) params.set("category", filters.category);
      if (filters.search) params.set("search", filters.search);
      if (filters.startDateFrom) params.set("startDateFrom", filters.startDateFrom);
      if (filters.startDateTo) params.set("startDateTo", filters.startDateTo);
      if (filters.venueId) params.set("venueId", filters.venueId);
      if (filters.isFeatured !== undefined) params.set("isFeatured", String(filters.isFeatured));
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

      const res = await fetch(`/api/v1/events?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
    staleTime: 60 * 1000,
  });
}
