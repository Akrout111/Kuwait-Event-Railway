"use client";

import { useTranslations } from "next-intl";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentBookingsTable() {
  const t = useTranslations("dashboard");
  const { data, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const bookings = data?.data?.recentBookings ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recentBookings.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            {t("recentBookings.noBookings")}
          </p>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking: Record<string, unknown>) => (
              <div
                key={booking.id as string}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                    {(booking.attendeeName as string)?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{booking.attendeeName as string}</p>
                    <p className="text-xs text-gray-500">
                      {(booking.event as Record<string, string>)?.titleAr}
                    </p>
                  </div>
                </div>
                <div className="text-end">
                  <p className="font-medium text-sm" dir="ltr">
                    {booking.totalAmount as string} KWD
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {booking.quantity as number} {t("recentBookings.tickets")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
