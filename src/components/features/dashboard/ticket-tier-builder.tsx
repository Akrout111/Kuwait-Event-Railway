"use client";

import { useFieldArray, UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { CreateEventInput } from "@/lib/validators/event-schema";

interface TicketTierBuilderProps {
  form: UseFormReturn<CreateEventInput>;
}

export function TicketTierBuilder({ form }: TicketTierBuilderProps) {
  const t = useTranslations("dashboard");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ticketTiers",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("events.ticketTiers")}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              nameAr: "",
              type: "STANDARD",
              price: "0.000",
              quantityTotal: 100,
              maxPerBooking: 10,
              description: "",
            })
          }
        >
          <Plus className="h-4 w-4 me-2" />
          {t("events.addTier")}
        </Button>
      </div>

      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  placeholder={t("events.tierNameAr")}
                  {...form.register(`ticketTiers.${index}.nameAr`)}
                />
                <Select
                  onValueChange={(value) =>
                    form.setValue(`ticketTiers.${index}.type`, value as "STANDARD" | "VIP" | "EARLY_BIRD" | "GROUP")
                  }
                  defaultValue={field.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("events.tierType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">
                      {t("events.tierTypes.STANDARD")}
                    </SelectItem>
                    <SelectItem value="VIP">
                      {t("events.tierTypes.VIP")}
                    </SelectItem>
                    <SelectItem value="EARLY_BIRD">
                      {t("events.tierTypes.EARLY_BIRD")}
                    </SelectItem>
                    <SelectItem value="GROUP">
                      {t("events.tierTypes.GROUP")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="0.000 KWD"
                  {...form.register(`ticketTiers.${index}.price`)}
                  type="text"
                  dir="ltr"
                />
                <Input
                  placeholder={t("events.tierQuantity")}
                  {...form.register(`ticketTiers.${index}.quantityTotal`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min={1}
                />
                <Input
                  placeholder={t("events.tierMaxPerBooking")}
                  {...form.register(`ticketTiers.${index}.maxPerBooking`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min={1}
                  max={50}
                />
              </div>

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 shrink-0"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {form.formState.errors.ticketTiers?.[index] && (
              <p className="text-sm text-red-500 mt-2">
                {String(form.formState.errors.ticketTiers[index]?.message ?? "")}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
