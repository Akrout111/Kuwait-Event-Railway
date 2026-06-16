"use client";

import { useTranslations, useLocale } from "next-intl";
import { useAdminStats } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  CalendarDays,
  ClipboardList,
  DollarSign,
  Tag,
  Star,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatsCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle: string;
  color: string;
}

function formatKWD(amount: number | string, locale: string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale === "ar" ? "ar-KW" : "en-US", {
    style: "currency",
    currency: "KWD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value);
}

export default function AdminOverviewPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { data, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.data;

  const cards: StatsCard[] = [
    {
      title: t("stats.totalUsers"),
      value: stats?.users.total ?? 0,
      icon: Users,
      subtitle: `+${stats?.users.newLastWeek ?? 0} ${t("stats.thisWeek")}`,
      color: "text-blue-600",
    },
    {
      title: t("stats.organizers"),
      value: stats?.users.organizers ?? 0,
      icon: TrendingUp,
      subtitle: t("stats.activeOrganizers"),
      color: "text-green-600",
    },
    {
      title: t("stats.totalEvents"),
      value: stats?.events.total ?? 0,
      icon: CalendarDays,
      subtitle: `${stats?.events.published ?? 0} ${t("stats.published")}`,
      color: "text-purple-600",
    },
    {
      title: t("stats.totalBookings"),
      value: stats?.bookings.confirmed ?? 0,
      icon: ClipboardList,
      subtitle: `${t("stats.from")} ${stats?.bookings.total ?? 0}`,
      color: "text-orange-600",
    },
    {
      title: t("stats.totalRevenue"),
      value: formatKWD(stats?.bookings.totalRevenue ?? "0.000", locale),
      icon: DollarSign,
      subtitle: t("stats.allTime"),
      color: "text-emerald-600",
    },
    {
      title: t("stats.last30DaysRevenue"),
      value: formatKWD(stats?.bookings.last30DaysRevenue ?? "0.000", locale),
      icon: DollarSign,
      subtitle: t("stats.last30Days"),
      color: "text-teal-600",
    },
    {
      title: t("stats.categories"),
      value: stats?.categories ?? 0,
      icon: Tag,
      subtitle: t("stats.activeCategories"),
      color: "text-pink-600",
    },
    {
      title: t("stats.reviews"),
      value: stats?.reviews ?? 0,
      icon: Star,
      subtitle: t("stats.totalReviews"),
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("overview.title")}</h1>
        <p className="text-gray-500 mt-1">{t("overview.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
