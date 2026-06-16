"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

export function ClerkSetupBanner() {
  const t = useTranslations("auth");
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Don't show banner if Clerk is configured
  if (pk && !pk.includes("placeholder") && pk.startsWith("pk_")) {
    return null;
  }

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
      <Info className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
        <strong>{t("previewMode")}:</strong> {t("clerkNotConfigured")}{" "}
        <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        </code>{" "}
        {t("and")}{" "}
        <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">
          CLERK_SECRET_KEY
        </code>{" "}
        {t("inEnvLocal")}
      </AlertDescription>
    </Alert>
  );
}
