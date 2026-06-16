"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import {
  useAdminEvents,
  useFeatureEvent,
  useChangeEventStatus,
} from "@/hooks/use-admin";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Search,
  Star,
  StarOff,
  Eye,
  Ban,
  CheckCircle2,
} from "lucide-react";

interface EventOrganizer {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface EventCategory {
  id: string;
  nameAr: string;
  nameEn: string | null;
  slug: string;
}

interface EventVenue {
  id: string;
  nameAr: string;
  city: string;
}

interface AdminEvent {
  id: string;
  titleAr: string;
  titleEn: string | null;
  slug: string;
  status: string;
  isFeatured: boolean;
  startDate: string;
  startTime: string | null;
  coverImageUrl: string | null;
  deletedAt: string | null;
  createdAt: string;
  organizer: EventOrganizer;
  category: EventCategory | null;
  venue: EventVenue | null;
  ticketTiers: Array<{
    price: string;
    quantityTotal: number;
    quantitySold: number;
    quantityAvailable: number;
  }>;
  bookingsCount: number;
  reviewsCount: number;
  totalCapacity: number;
  totalSold: number;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-success/10 text-success",
  CANCELLED: "bg-destructive/10 text-destructive",
  SOLD_OUT: "bg-warning/10 text-warning",
  COMPLETED: "bg-info/10 text-info",
};

export default function AdminEventsPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading } = useAdminEvents({
    search: search || undefined,
    status: statusFilter || undefined,
    limit: 20,
  });

  const featureEvent = useFeatureEvent();
  const changeStatus = useChangeEventStatus();

  const events: AdminEvent[] = data?.data?.events ?? [];
  const statusStats: Record<string, number> = data?.data?.statusStats ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("events.title")}</h1>
        <p className="text-gray-500 mt-1">{t("events.subtitle")}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("events.searchPlaceholder")}
            className="ps-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("events.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("events.allStatuses")}</SelectItem>
            <SelectItem value="DRAFT">{t("events.status.DRAFT")}</SelectItem>
            <SelectItem value="PUBLISHED">
              {t("events.status.PUBLISHED")}
            </SelectItem>
            <SelectItem value="CANCELLED">
              {t("events.status.CANCELLED")}
            </SelectItem>
            <SelectItem value="COMPLETED">
              {t("events.status.COMPLETED")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("events.table.title")}</TableHead>
              <TableHead>{t("events.table.organizer")}</TableHead>
              <TableHead>{t("events.table.status")}</TableHead>
              <TableHead>{t("events.table.featured")}</TableHead>
              <TableHead>{t("events.table.capacity")}</TableHead>
              <TableHead>{t("events.table.bookings")}</TableHead>
              <TableHead>{t("events.table.date")}</TableHead>
              <TableHead className="text-end">
                {t("events.table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {event.coverImageUrl && (
                      <Image
                        src={event.coverImageUrl}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded object-cover shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-medium text-sm">{event.titleAr}</p>
                      {event.titleEn && (
                        <p className="text-xs text-gray-400">
                          {event.titleEn}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <p>{event.organizer?.name}</p>
                  <p className="text-xs text-gray-400">
                    {event.organizer?.email}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusColors[event.status] || ""}
                  >
                    {t(`events.status.${event.status}`)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {event.isFeatured ? (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4 text-gray-300" />
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {event.totalSold}/{event.totalCapacity}
                </TableCell>
                <TableCell className="text-sm">
                  {event.bookingsCount}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(event.startDate).toLocaleDateString(locale === "ar" ? "ar-KW" : "en-US")}
                </TableCell>
                <TableCell className="text-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/events/${event.slug}`}>
                          <Eye className="h-4 w-4 me-2" />
                          {t("events.view")}
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Feature Toggle */}
                      {event.isFeatured ? (
                        <DropdownMenuItem
                          onClick={() =>
                            featureEvent.mutate({
                              eventId: event.id,
                              data: { isFeatured: false },
                            })
                          }
                        >
                          <StarOff className="h-4 w-4 me-2" />
                          {t("events.unfeature")}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() =>
                            featureEvent.mutate({
                              eventId: event.id,
                              data: { isFeatured: true },
                            })
                          }
                        >
                          <Star className="h-4 w-4 me-2" />
                          {t("events.feature")}
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      {/* Status Changes */}
                      {event.status !== "PUBLISHED" && (
                        <DropdownMenuItem
                          onClick={() =>
                            changeStatus.mutate({
                              eventId: event.id,
                              data: { status: "PUBLISHED" },
                            })
                          }
                        >
                          <CheckCircle2 className="h-4 w-4 me-2 text-green-600" />
                          {t("events.publish")}
                        </DropdownMenuItem>
                      )}
                      {event.status !== "CANCELLED" && (
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>
                            changeStatus.mutate({
                              eventId: event.id,
                              data: { status: "CANCELLED" },
                            })
                          }
                        >
                          <Ban className="h-4 w-4 me-2" />
                          {t("events.cancel")}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
