"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ManualEntryProps {
  onSubmit: (ticketNumber: string) => void;
  isLoading: boolean;
}

export function ManualEntry({ onSubmit, isLoading }: ManualEntryProps) {
  const t = useTranslations("dashboard");
  const [ticketNumber, setTicketNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = ticketNumber.trim().toUpperCase();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="text-sm font-medium">
        {t("tickets.manualEntryLabel")}
      </label>
      <div className="flex gap-2">
        <Input
          value={ticketNumber}
          onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
          placeholder="TCK-XXXX-XXXX"
          dir="ltr"
          className="font-mono text-center text-lg tracking-wider"
          maxLength={13}
        />
        <Button
          type="submit"
          disabled={isLoading || ticketNumber.trim().length < 13}
        >
          {isLoading ? "..." : t("tickets.validate")}
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        {t("tickets.manualEntryHint")}
      </p>
    </form>
  );
}
