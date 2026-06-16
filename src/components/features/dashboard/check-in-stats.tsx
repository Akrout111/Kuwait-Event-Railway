"use client";

import { useTranslations } from "next-intl";
import { useTicketStats } from "@/hooks/use-ticket-validation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Ticket, TrendingUp, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CheckInStatsProps {
  eventId: string | undefined;
}

export function CheckInStats({ eventId }: CheckInStatsProps) {
  const t = useTranslations("dashboard");
  const { data, isLoading } = useTicketStats(eventId);

  if (isLoading || !eventId) {
    return (
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = data?.data?.stats;

  const cards: {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
  }[] = [
    {
      label: t("tickets.stats.totalTickets"),
      value: stats?.totalTickets ?? 0,
      icon: Ticket,
      color: "text-blue-600",
    },
    {
      label: t("tickets.stats.checkedIn"),
      value: stats?.usedTickets ?? 0,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      label: t("tickets.stats.remaining"),
      value: stats?.unusedTickets ?? 0,
      icon: Users,
      color: "text-orange-600",
    },
    {
      label: t("tickets.stats.checkInRate"),
      value: `${stats?.checkInRate ?? "0.0"}%`,
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              <span className="text-xs text-gray-500">{card.label}</span>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
