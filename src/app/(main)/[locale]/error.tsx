"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { logger } from "@/lib/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    logger.error("error-page", "Route error", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center ps-4 pe-4">
        <h2 className="text-2xl font-bold">{t("error")}</h2>
        <p className="text-muted-foreground max-w-md">
          {t("unexpectedError")}
        </p>
        <Button onClick={reset} variant="outline">
          {t("retry")}
        </Button>
      </div>
    </div>
  );
}
