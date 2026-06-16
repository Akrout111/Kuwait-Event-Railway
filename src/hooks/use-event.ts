"use client";

import { useQuery } from "@tanstack/react-query";

export function useEvent(slug: string) {
  return useQuery({
    queryKey: ["event", slug],
    queryFn: async () => {
      const res = await fetch(`/api/v1/events/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch event");
      return res.json();
    },
    enabled: !!slug,
    staleTime: 60 * 1000,
  });
}
