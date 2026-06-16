"use client";

import * as React from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale/ar";
import { enUS } from "date-fns/locale/en-US";
import { CalendarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder, className }: DatePickerProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const dateLocale = locale === "ar" ? ar : enUS;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full sm:w-auto bg-white/[0.05] border-white/[0.1] text-foreground hover:bg-white/[0.08] hover:text-foreground rounded-xl justify-start text-start font-normal",
            !value && "text-white/40",
            className
          )}
        >
          <CalendarIcon className="me-2 h-4 w-4 text-primary" />
          {value ? (
            format(value, "PPP", { locale: dateLocale })
          ) : (
            <span>{placeholder || t("selectDate")}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-popover border-white/[0.1]" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          autoFocus
          locale={dateLocale}
          className="bg-popover"
        />
      </PopoverContent>
    </Popover>
  );
}
