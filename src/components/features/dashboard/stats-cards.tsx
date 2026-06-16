"use client";

import { useTranslations, useLocale } from "next-intl";
import { useDashboardStats } from "@/hooks/use-dashboard";
import {
  CalendarDays,
  ClipboardList,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKWD } from "@/lib/utils";

export function StatsCards() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = data?.data?.stats;

  const cards = [
    {
      title: t("stats.totalEvents"),
      value: stats?.totalEvents ?? 0,
      icon: CalendarDays,
      subtitle: `${stats?.publishedEvents ?? 0} ${t("stats.published")}`,
    },
    {
      title: t("stats.totalBookings"),
      value: stats?.confirmedBookings ?? 0,
      icon: ClipboardList,
      subtitle: `${t("stats.from")} ${stats?.totalBookings ?? 0}`,
    },
    {
      title: t("stats.totalRevenue"),
      value: formatKWD(stats?.totalRevenue ?? "0.000", locale),
      icon: DollarSign,
      subtitle: t("stats.confirmedRevenue"),
    },
    {
      title: t("stats.draftEvents"),
      value: stats?.draftEvents ?? 0,
      icon: TrendingUp,
      subtitle: t("stats.awaitingPublish"),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
