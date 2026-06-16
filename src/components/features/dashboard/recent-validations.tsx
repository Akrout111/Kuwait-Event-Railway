"use client";

import { useTranslations, useLocale } from "next-intl";
import { useValidationHistory } from "@/hooks/use-ticket-validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock } from "lucide-react";

interface RecentValidationsProps {
  eventId: string | undefined;
}

interface HistoryTicket {
  id: string;
  ticketNumber: string;
  usedAt: string;
  ticketTier: {
    nameAr: string;
    type: string;
    price: string;
  };
  booking: {
    attendeeName: string;
    attendeeEmail: string;
    bookingNumber: string;
  };
}

export function RecentValidations({ eventId }: RecentValidationsProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data, isLoading } = useValidationHistory(eventId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const tickets: HistoryTicket[] = data?.data?.tickets ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t("tickets.recentValidations")}
          {tickets.length > 0 && (
            <Badge variant="secondary" className="ms-auto">
              {tickets.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            {t("tickets.noValidationsYet")}
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
              >
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {ticket.booking.attendeeName}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs shrink-0"
                    >
                      {ticket.ticketTier.type}
                    </Badge>
                  </div>
                  <p
                    className="text-xs text-gray-500 font-mono"
                    dir="ltr"
                  >
                    {ticket.ticketNumber}
                  </p>
                </div>
                <div className="text-end shrink-0">
                  <p className="text-xs text-gray-500">
                    {ticket.usedAt
                      ? new Date(ticket.usedAt).toLocaleTimeString(
                          locale === "ar" ? "ar-KW" : "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
