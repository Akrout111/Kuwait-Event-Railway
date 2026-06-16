"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  TicketCheck,
  CreditCard,
  XCircle,
  Clock,
  ShoppingCart,
  Star,
  CheckCircle,
  RotateCcw,
  ScanLine,
  Bell,
} from "lucide-react";
import { NOTIFICATION_ICONS, NOTIFICATION_COLORS, NotificationType } from "@/lib/notifications/types";
import { useMarkAsRead, type NotificationData } from "@/hooks/use-notifications";

// Map icon name strings to actual Lucide React icon names
const ICON_NAME_SET = new Set<string>([
  "TicketCheck",
  "CreditCard",
  "XCircle",
  "Clock",
  "ShoppingCart",
  "Star",
  "CheckCircle",
  "RotateCcw",
  "ScanLine",
]);

function getColorClasses(type: string): string {
  return NOTIFICATION_COLORS[type as NotificationType] ?? "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
}

function NotificationIcon({ type }: { type: string }) {
  const iconName = NOTIFICATION_ICONS[type as NotificationType];
  const isValidIcon = iconName && ICON_NAME_SET.has(iconName);

  if (!isValidIcon) {
    return <Bell className="size-4" />;
  }

  switch (iconName) {
    case "TicketCheck":
      return <TicketCheck className="size-4" />;
    case "CreditCard":
      return <CreditCard className="size-4" />;
    case "XCircle":
      return <XCircle className="size-4" />;
    case "Clock":
      return <Clock className="size-4" />;
    case "ShoppingCart":
      return <ShoppingCart className="size-4" />;
    case "Star":
      return <Star className="size-4" />;
    case "CheckCircle":
      return <CheckCircle className="size-4" />;
    case "RotateCcw":
      return <RotateCcw className="size-4" />;
    case "ScanLine":
      return <ScanLine className="size-4" />;
    default:
      return <Bell className="size-4" />;
  }
}

function timeAgo(dateStr: string, locale: string, t: ReturnType<typeof useTranslations<"notifications">>): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return t("now");
  }
  if (diffMinutes < 60) {
    return t("minutesAgo", { count: diffMinutes });
  }
  if (diffHours < 24) {
    return t("hoursAgo", { count: diffHours });
  }
  if (diffDays < 7) {
    return t("daysAgo", { count: diffDays });
  }

  // Format the date for older notifications
  return date.toLocaleDateString(locale === "ar" ? "ar-KW" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface NotificationItemProps {
  notification: NotificationData;
  onClick?: () => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const markAsRead = useMarkAsRead();

  const colorClasses = getColorClasses(notification.type);
  const isArabic = locale === "ar";

  const title = isArabic ? notification.titleAr : notification.titleEn;
  const body = isArabic ? notification.bodyAr : notification.bodyEn;

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative flex w-full items-start gap-3 px-4 py-3 text-start transition-colors hover:bg-accent/50 ${
        !notification.isRead ? "bg-primary/5" : ""
      }`}
    >
      {/* Unread indicator dot */}
      {!notification.isRead && (
        <span className="absolute top-4 start-2 h-2 w-2 rounded-full bg-primary" />
      )}

      {/* Icon */}
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${colorClasses}`}>
        <NotificationIcon type={notification.type} />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1 overflow-hidden ps-1">
        <p className={`text-sm leading-snug ${!notification.isRead ? "font-semibold" : "font-medium"}`}>
          {title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2">{body}</p>
        <p className="text-xs text-muted-foreground/70">{timeAgo(notification.createdAt, locale, t)}</p>
      </div>
    </button>
  );
}
