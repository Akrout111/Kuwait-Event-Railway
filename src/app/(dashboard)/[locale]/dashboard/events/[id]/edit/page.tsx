"use client";

import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useForm, type UseFormReturn, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateEvent } from "@/hooks/use-event-mutations";
import { updateEventSchema, type UpdateEventInput } from "@/lib/validators/event-schema";
import type { CreateEventInput } from "@/lib/validators/event-schema";
import { logger } from "@/lib/logger";
import { ImageUploader } from "@/components/features/dashboard/image-uploader";
import { TicketTierBuilder } from "@/components/features/dashboard/ticket-tier-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function EditEventPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const updateEvent = useUpdateEvent();

  const { data: eventData, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/events/${eventId}`);
      if (!res.ok) throw new Error("Event not found");
      return res.json();
    },
  });

  const event = eventData?.data?.event;

  const form = useForm<UpdateEventInput>({
    resolver: zodResolver(updateEventSchema) as unknown as Resolver<UpdateEventInput>,
    values: event
      ? {
          titleAr: event.titleAr ?? "",
          titleEn: event.titleEn || "",
          descriptionAr: event.descriptionAr ?? "",
          descriptionEn: event.descriptionEn || "",
          coverImageUrl: event.coverImageUrl ?? "",
          galleryUrls: typeof event.galleryUrls === "string" ? event.galleryUrls : JSON.stringify(event.galleryUrls ?? []),
          startDate: event.startDate?.split("T")[0] ?? "",
          startTime: event.startTime ?? "",
          categoryId: event.categoryId ?? "",
          venueId: event.venueId || "",
          ticketTiers: event.ticketTiers?.map((tier: Record<string, unknown>) => ({
            nameAr: (tier.nameAr as string) ?? "",
            nameEn: (tier.nameEn as string) || "",
            type: (tier.type as string) ?? "STANDARD",
            price: (tier.price as string) ?? "0.000",
            quantityTotal: (tier.quantityTotal as number) ?? 100,
            maxPerBooking: (tier.maxPerBooking as number) ?? 10,
            description: (tier.description as string) || "",
          })),
        }
      : undefined,
  });

  const onSubmit = async (data: UpdateEventInput) => {
    try {
      await updateEvent.mutateAsync({ id: eventId, data });
      router.push(`/${locale}/dashboard/events`);
    } catch (error: unknown) {
      logger.error("edit-event", "Update failed", error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("events.notFound")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{t("events.editTitle")}</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("events.basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("events.titleAr")}</label>
                <Input {...form.register("titleAr")} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("events.titleEn")}</label>
                <Input {...form.register("titleEn")} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("events.descriptionAr")}</label>
              <Textarea {...form.register("descriptionAr")} rows={4} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("events.startDate")}</label>
                <Input type="date" {...form.register("startDate")} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("events.startTime")}</label>
                <Input type="time" {...form.register("startTime")} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("events.endDate")}</label>
                <Input type="date" {...form.register("endDate")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("events.media")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader
              value={form.watch("coverImageUrl") || ""}
              onChange={(url) => form.setValue("coverImageUrl", url)}
              label={t("events.coverImage")}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("events.ticketTiers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TicketTierBuilder form={form as unknown as UseFormReturn<CreateEventInput>} />
          </CardContent>
        </Card>

        {/* Status Change */}
        <Card>
          <CardHeader>
            <CardTitle>{t("events.publishStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button
              type="button"
              variant={event.status === "DRAFT" ? "default" : "outline"}
              onClick={() => form.setValue("status", "DRAFT")}
            >
              {t("events.status.DRAFT")}
            </Button>
            <Button
              type="button"
              variant={event.status === "PUBLISHED" ? "default" : "outline"}
              onClick={() => form.setValue("status", "PUBLISHED")}
            >
              {t("events.status.PUBLISHED")}
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            {t("events.cancel")}
          </Button>
          <Button type="submit" disabled={updateEvent.isPending}>
            {updateEvent.isPending && (
              <Loader2 className="h-4 w-4 me-2 animate-spin" />
            )}
            {t("events.saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  );
}
