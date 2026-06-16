"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type { CreateReviewInput } from "@/lib/validators/review-schema";

export function useEventReviews(
  eventId: string,
  params?: { page?: number; limit?: number; sortBy?: string }
) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.sortBy) query.set("sortBy", params.sortBy);

  return useQuery({
    queryKey: ["reviews", eventId, params],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/events/${eventId}/reviews/list?${query}`
      );
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    staleTime: 60 * 1000, // 1 minute
    enabled: !!eventId,
  });
}

export function useReviewEligibility(eventId: string) {
  return useQuery({
    queryKey: ["review-eligibility", eventId],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/events/${eventId}/reviews/eligibility`
      );
      if (!res.ok) throw new Error("Failed to check eligibility");
      return res.json();
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!eventId,
  });
}

export function useCreateReview(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewInput) => {
      const res = await fetch(`/api/v1/events/${eventId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          error.error?.message || "Failed to create review"
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", eventId] });
      queryClient.invalidateQueries({
        queryKey: ["review-eligibility", eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] }); // refresh event detail
    },
    onError: (error: Error) => {
      toast({ title: error.message || "An error occurred", variant: "destructive" });
    },
  });
}

export function useReplyToReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      reply,
      eventId,
    }: {
      reviewId: string;
      reply: string;
      eventId: string;
    }) => {
      const res = await fetch(`/api/v1/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to reply");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
    },
    onError: (error: Error) => {
      toast({ title: error.message || "An error occurred", variant: "destructive" });
    },
  });
}
