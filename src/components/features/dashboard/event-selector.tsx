"use client";

import { useTranslations, useLocale } from "next-intl";
import { useOrganizerEvents } from "@/hooks/use-dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface EventSelectorProps {
  value: string | undefined;
  onChange: (eventId: string) => void;
}

interface EventItem {
  id: string;
  titleAr: string;
  titleEn: string | null;
  startDate: string;
  status: string;
}

export function EventSelector({ value, onChange }: EventSelectorProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data, isLoading } = useOrganizerEvents({ limit: 100 });

  if (isLoading) {
    return <Skeleton className="h-10 w-64" />;
  }

  const events: EventItem[] = data?.data?.events ?? [];

  // Only show published events with upcoming dates (for check-in)
  const activeEvents = events.filter(
    (e) =>
      e.status === "PUBLISHED" &&
      new Date(e.startDate) <=
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  return (
    <Select onValueChange={onChange} value={value || ""}>
      <SelectTrigger className="w-64">
        <SelectValue placeholder={t("tickets.selectEvent")} />
      </SelectTrigger>
      <SelectContent>
        {activeEvents.length === 0 ? (
          <SelectItem value="none" disabled>
            {t("tickets.noActiveEvents")}
          </SelectItem>
        ) : (
          activeEvents.map((event) => (
            <SelectItem key={event.id} value={event.id}>
              {event.titleAr + " — " + new Date(event.startDate).toLocaleDateString(locale === "ar" ? "ar-KW" : "en-US")}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
