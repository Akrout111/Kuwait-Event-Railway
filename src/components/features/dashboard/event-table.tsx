"use client";

import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useOrganizerEvents } from "@/hooks/use-dashboard";
import { useDeleteEvent } from "@/hooks/use-event-mutations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-success/10 text-success",
  CANCELLED: "bg-destructive/10 text-destructive",
  SOLD_OUT: "bg-warning/10 text-warning",
  COMPLETED: "bg-info/10 text-info",
};

export function EventTable() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data, isLoading } = useOrganizerEvents();
  const deleteEvent = useDeleteEvent();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const events = data?.data?.events ?? [];

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">{t("events.noEvents")}</p>
        <Link href={`/dashboard/events/new`}>
          <Button className="mt-4">{t("events.createFirst")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("events.table.title")}</TableHead>
          <TableHead>{t("events.table.status")}</TableHead>
          <TableHead>{t("events.table.date")}</TableHead>
          <TableHead>{t("events.table.bookings")}</TableHead>
          <TableHead>{t("events.table.category")}</TableHead>
          <TableHead className="text-end">{t("events.table.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event: Record<string, unknown>) => (
          <TableRow key={event.id as string}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-3">
                {!!event.coverImageUrl && (
                  <Image
                    src={event.coverImageUrl as string}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{event.titleAr as string}</p>
                  {!!event.titleEn && (
                    <p className="text-xs text-gray-500">{event.titleEn as string}</p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant="secondary"
                className={statusColors[event.status as string] || ""}
              >
                {t(`events.status.${event.status as string}`)}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(event.startDate as string).toLocaleDateString(locale === "ar" ? "ar-KW" : "en-US")}
            </TableCell>
            <TableCell>{event.bookingsCount as number}</TableCell>
            <TableCell>{(event.category as Record<string, string>)?.nameAr}</TableCell>
            <TableCell className="text-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/events/${event.slug as string}`}>
                      <Eye className="h-4 w-4 me-2" />
                      {t("events.actions.view")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/dashboard/events/${event.id as string}/edit`}
                    >
                      <Pencil className="h-4 w-4 me-2" />
                      {t("events.actions.edit")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => {
                      if (confirm(t("events.actions.confirmDelete"))) {
                        deleteEvent.mutate(event.id as string);
                      }
                    }}
                    disabled={deleteEvent.isPending}
                  >
                    <Trash2 className="h-4 w-4 me-2" />
                    {t("events.actions.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
