"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function CreateEventButton() {
  const t = useTranslations("dashboard");

  return (
    <Link href="/dashboard/events/new">
      <Button>
        <Plus className="h-4 w-4 me-2" />
        {t("events.create")}
      </Button>
    </Link>
  );
}
