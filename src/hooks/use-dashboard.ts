"use client";

import { useQuery } from "@tanstack/react-query";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/v1/dashboard/stats");
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return res.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useOrganizerEvents(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  return useQuery({
    queryKey: ["dashboard", "events", params],
    queryFn: async () => {
      const res = await fetch(`/api/v1/dashboard/events?${query}`);
      if (!res.ok) throw new Error("Failed to fetch organizer events");
      return res.json();
    },
    staleTime: 30 * 1000,
  });
}

export function useOrganizerBookings(params?: {
  page?: number;
  limit?: number;
  eventId?: string;
  status?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.eventId) query.set("eventId", params.eventId);
  if (params?.status) query.set("status", params.status);

  return useQuery({
    queryKey: ["dashboard", "bookings", params],
    queryFn: async () => {
      const res = await fetch(`/api/v1/dashboard/bookings?${query}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    staleTime: 30 * 1000,
  });
}
