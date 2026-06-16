"use client";

import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function UpcomingEventsList() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const events = data?.data?.upcomingEvents ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("upcomingEvents.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            {t("upcomingEvents.noUpcoming")}
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event: Record<string, unknown>) => (
              <Link
                key={event.id as string}
                href={`/dashboard/events/${event.id as string}/edit`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {!!event.coverImageUrl && (
                  <Image
                    src={event.coverImageUrl as string}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {event.titleAr as string}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.startDate as string).toLocaleDateString(locale === "ar" ? "ar-KW" : "en-US")} —{" "}
                    {event.startTime as string}
                  </p>
                </div>
                <div className="text-end shrink-0">
                  <p className="text-sm font-medium">
                    {(event._count as Record<string, number>)?.bookings ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("upcomingEvents.bookings")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
