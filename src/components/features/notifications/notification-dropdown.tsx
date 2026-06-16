"use client";

import { useTranslations } from "next-intl";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications, useMarkAllAsRead } from "@/hooks/use-notifications";
import { NotificationItem } from "./notification-item";

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const t = useTranslations("notifications");
  const { data, isLoading } = useNotifications("all", 1);
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.data ?? [];
  const displayedNotifications = notifications.slice(0, 5);

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <div className="w-80">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold">{t("title")}</h3>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleMarkAllRead}
            disabled={markAllAsRead.isPending}
          >
            <CheckCheck className="me-1 size-3.5" />
            {t("markAllRead")}
          </Button>
        )}
      </div>

      <Separator />

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      ) : displayedNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <Bell className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t("noNotifications")}</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="flex flex-col">
            {displayedNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={onClose}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-primary hover:text-primary/80"
              asChild
              onClick={onClose}
            >
              <a href={`/${typeof window !== "undefined" ? document.documentElement.lang || "ar" : "ar"}/notifications`}>
                {t("viewAll")}
              </a>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
