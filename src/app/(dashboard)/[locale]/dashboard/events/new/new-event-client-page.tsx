"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateEvent } from "@/hooks/use-event-mutations";
import { createEventSchema, type CreateEventInput } from "@/lib/validators/event-schema";
import { logger } from "@/lib/logger";
import { useCategories } from "@/hooks/use-categories";
import { ImageUploader } from "@/components/features/dashboard/image-uploader";
import { TicketTierBuilder } from "@/components/features/dashboard/ticket-tier-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";

const STEPS = ["basic", "media", "tickets", "review"] as const;

export function NewEventClientPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const createEvent = useCreateEvent();
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema) as unknown as Resolver<CreateEventInput>,
    defaultValues: {
      titleAr: "",
      descriptionAr: "",
      coverImageUrl: "",
      galleryUrls: "[]",
      startDate: "",
      startTime: "18:00",
      categoryId: "",
      ticketTiers: [
        {
          nameAr: "",
          type: "STANDARD",
          price: "0.000",
          quantityTotal: 100,
          maxPerBooking: 10,
        },
      ],
    },
  });

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data?.categories ?? [];

  const stepTitles = [
    t("events.steps.basic"),
    t("events.steps.media"),
    t("events.steps.tickets"),
    t("events.steps.review"),
  ];

  const nextStep = async () => {
    let fieldsToValidate: (keyof CreateEventInput)[] = [];
    if (currentStep === 0) {
      fieldsToValidate = [
        "titleAr",
        "descriptionAr",
        "startDate",
        "startTime",
        "categoryId",
      ];
    } else if (currentStep === 1) {
      fieldsToValidate = ["coverImageUrl"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["ticketTiers"];
    }

    const valid = await form.trigger(fieldsToValidate);
    if (valid && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const onSubmit = async (data: CreateEventInput) => {
    try {
      await createEvent.mutateAsync(data);
      router.push(`/${locale}/dashboard/events`);
    } catch (error: unknown) {
      logger.error("new-event", "Create event failed", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("events.createTitle")}</h1>
        <p className="text-gray-500 mt-1">{t("events.createSubtitle")}</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${
                i < currentStep
                  ? "bg-primary text-white"
                  : i === currentStep
                  ? "bg-primary/10 text-primary border-2 border-primary"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-12 mx-1 ${
                  i < currentStep ? "bg-primary" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{stepTitles[0]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("events.titleAr")}</label>
                  <Input
                    {...form.register("titleAr")}
                  />
                  {form.formState.errors.titleAr && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.titleAr.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("events.titleEn")}</label>
                  <Input
                    {...form.register("titleEn")}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("events.descriptionAr")}</label>
                <Textarea
                  {...form.register("descriptionAr")}
                  rows={4}
                />
                {form.formState.errors.descriptionAr && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.descriptionAr.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("events.descriptionEn")}</label>
                <Textarea
                  {...form.register("descriptionEn")}
                  rows={4}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("events.startDate")}</label>
                  <Input
                    type="date"
                    {...form.register("startDate")}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("events.startTime")}</label>
                  <Input
                    type="time"
                    {...form.register("startTime")}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t("events.endDate")}</label>
                  <Input
                    type="date"
                    {...form.register("endDate")}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    {t("events.category")}
                  </label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("categoryId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("events.selectCategory")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: Record<string, unknown>) => (
                        <SelectItem key={cat.id as string} value={cat.id as string}>
                          {cat.nameAr as string}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.categoryId.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Media */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>{stepTitles[1]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUploader
                value={form.watch("coverImageUrl")}
                onChange={(url) => form.setValue("coverImageUrl", url)}
                label={t("events.coverImage")}
              />
              {form.formState.errors.coverImageUrl && (
                <p className="text-sm text-red-500">{form.formState.errors.coverImageUrl.message}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Ticket Tiers */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>{stepTitles[2]}</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketTierBuilder form={form} />
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>{stepTitles[3]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("events.titleAr")}:</span>
                  <span className="font-medium">
                    {form.watch("titleAr")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {t("events.startDate")}:
                  </span>
                  <span className="font-medium">
                    {form.watch("startDate")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {t("events.tierCount")}:
                  </span>
                  <span className="font-medium">
                    {form.watch("ticketTiers")?.length}
                  </span>
                </div>
                {form.watch("coverImageUrl") && (
                  <div className="mt-4">
                    <img
                      src={form.watch("coverImageUrl")}
                      alt="Cover preview"
                      className="w-full max-w-sm rounded-lg object-cover aspect-video"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 bg-amber-50 rounded-lg text-amber-800 text-sm">
                {t("events.draftNotice")}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ArrowRight className="h-4 w-4 me-2" />
            {t("events.prevStep")}
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button type="button" onClick={nextStep}>
              {t("events.nextStep")}
              <ArrowLeft className="h-4 w-4 ms-2" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={createEvent.isPending}
                onClick={form.handleSubmit(async (data) => {
                  await createEvent.mutateAsync({ ...data, status: "DRAFT" } as CreateEventInput);
                  router.push(`/${locale}/dashboard/events`);
                })}
              >
                {t("events.saveDraft")}
              </Button>
              <Button
                type="submit"
                disabled={createEvent.isPending}
              >
                {createEvent.isPending && (
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                )}
                {t("events.publish")}
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
