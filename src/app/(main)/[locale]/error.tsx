"use client";

import { useEffect, useState } from "react";
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
  // Show the real error message in development OR when a flag is set, so
  // we can debug runtime errors on Railway without needing to read logs.
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    logger.error("error-page", "Route error", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center ps-4 pe-4 max-w-2xl">
        <h2 className="text-2xl font-bold">{t("error")}</h2>
        <p className="text-muted-foreground max-w-md">
          {t("unexpectedError")}
        </p>

        {showDetails && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded text-left w-full overflow-auto">
            <p className="font-mono text-sm text-red-700 dark:text-red-300 break-words">
              {error.message || "No error message"}
            </p>
            {error.digest && (
              <p className="font-mono text-xs text-muted-foreground mt-2">
                digest: {error.digest}
              </p>
            )}
            {error.stack && (
              <pre className="font-mono text-xs text-muted-foreground mt-2 whitespace-pre-wrap">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={reset} variant="outline">
            {t("retry")}
          </Button>
          <Button
            onClick={() => setShowDetails((v) => !v)}
            variant="ghost"
            size="sm"
          >
            {showDetails ? "Hide details" : "Show details"}
          </Button>
        </div>
      </div>
    </div>
  );
}
