"use client";

import { useQuery } from "@tanstack/react-query";

export function useVenue(slug: string) {
  return useQuery({
    queryKey: ["venue", slug],
    queryFn: async () => {
      const res = await fetch(`/api/v1/venues/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch venue");
      return res.json();
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
