"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useOrganizerBookings, useOrganizerEvents } from "@/hooks/use-dashboard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const bookingStatusColors: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning",
  CONFIRMED: "bg-success/10 text-success",
  CANCELLED: "bg-destructive/10 text-destructive",
  REFUNDED: "bg-info/10 text-info",
};

export function BookingsClientPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const [eventFilter, setEventFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: eventsData } = useOrganizerEvents({ limit: 100 });
  const { data: bookingsData, isLoading } = useOrganizerBookings({
    eventId: eventFilter || undefined,
    status: statusFilter || undefined,
  });

  const bookings = bookingsData?.data?.bookings ?? [];
  const events = eventsData?.data?.events ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("bookings.title")}</h1>
        <p className="text-gray-500 mt-1">{t("bookings.subtitle")}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select onValueChange={setEventFilter} value={eventFilter}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder={t("bookings.filterByEvent")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("bookings.allEvents")}</SelectItem>
            {events.map((e: Record<string, unknown>) => (
              <SelectItem key={e.id as string} value={e.id as string}>
                {e.titleAr as string}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setStatusFilter} value={statusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("bookings.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("bookings.allStatuses")}</SelectItem>
            <SelectItem value="PENDING">{t("bookings.status.PENDING")}</SelectItem>
            <SelectItem value="CONFIRMED">{t("bookings.status.CONFIRMED")}</SelectItem>
            <SelectItem value="CANCELLED">{t("bookings.status.CANCELLED")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>{t("bookings.noBookings")}</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("bookings.table.number")}</TableHead>
              <TableHead>{t("bookings.table.event")}</TableHead>
              <TableHead>{t("bookings.table.attendee")}</TableHead>
              <TableHead>{t("bookings.table.quantity")}</TableHead>
              <TableHead>{t("bookings.table.amount")}</TableHead>
              <TableHead>{t("bookings.table.status")}</TableHead>
              <TableHead>{t("bookings.table.date")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking: Record<string, unknown>) => (
              <TableRow key={booking.id as string}>
                <TableCell className="font-mono text-sm">
                  {booking.bookingNumber as string}
                </TableCell>
                <TableCell>{(booking.event as Record<string, string>)?.titleAr}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{booking.attendeeName as string}</p>
                    <p className="text-xs text-gray-500">{booking.attendeeEmail as string}</p>
                  </div>
                </TableCell>
                <TableCell>{booking.quantity as number}</TableCell>
                <TableCell dir="ltr" className="text-end">
                  {booking.totalAmount as string} KWD
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={bookingStatusColors[booking.status as string] || ""}
                  >
                    {t(`bookings.status.${booking.status as string}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(booking.createdAt as string).toLocaleDateString(locale === "ar" ? "ar-KW" : "en-US")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
