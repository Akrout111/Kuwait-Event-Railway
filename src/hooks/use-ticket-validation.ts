"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type { ValidateTicketInput } from "@/lib/validators/ticket-schema";

export function useValidateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ValidateTicketInput) => {
      const res = await fetch("/api/v1/tickets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          error.error?.message || "Failed to validate ticket"
        );
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate stats and history so they refresh
      queryClient.invalidateQueries({ queryKey: ["ticket-stats"] });
      queryClient.invalidateQueries({ queryKey: ["validation-history"] });
    },
    onError: (error: Error) => {
      toast({ title: error.message || "An error occurred", variant: "destructive" });
    },
  });
}

export function useTicketStats(eventId: string | undefined) {
  return useQuery({
    queryKey: ["ticket-stats", eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const res = await fetch(`/api/v1/tickets/stats?eventId=${eventId}`);
      if (!res.ok) throw new Error("Failed to fetch ticket stats");
      return res.json();
    },
    enabled: !!eventId,
    staleTime: 10 * 1000, // 10 seconds — stats change frequently during check-in
  });
}

export function useValidationHistory(eventId: string | undefined) {
  return useQuery({
    queryKey: ["validation-history", eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const res = await fetch(`/api/v1/tickets/history?eventId=${eventId}`);
      if (!res.ok) throw new Error("Failed to fetch validation history");
      return res.json();
    },
    enabled: !!eventId,
    staleTime: 5 * 1000, // 5 seconds — refresh often during active scanning
  });
}
