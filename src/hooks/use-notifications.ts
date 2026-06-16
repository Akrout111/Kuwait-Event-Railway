"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAuth } from "@/hooks/use-safe-auth";

// API response type
interface NotificationData {
  id: string;
  userId: string;
  type: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  data: NotificationData[];
  message: string;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

interface UnreadCountResponse {
  success: boolean;
  data: { unreadCount: number };
  message: string;
}

export function useNotifications(filter: "all" | "unread" = "all", page = 1) {
  const { isSignedIn } = useSafeAuth();
  return useQuery({
    queryKey: ["notifications", filter, page],
    queryFn: async (): Promise<NotificationsResponse> => {
      const res = await fetch(`/api/v1/notifications?filter=${filter}&page=${page}&limit=20`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    enabled: isSignedIn,
    staleTime: 30 * 1000,
  });
}

export function useUnreadCount() {
  const { isSignedIn } = useSafeAuth();
  return useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: async (): Promise<UnreadCountResponse> => {
      const res = await fetch("/api/v1/notifications/count");
      if (!res.ok) throw new Error("Failed to fetch count");
      return res.json();
    },
    enabled: isSignedIn,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch(`/api/v1/notifications/${notificationId}/read`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/notifications", { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to mark all as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}

export type { NotificationData, NotificationsResponse, UnreadCountResponse };
