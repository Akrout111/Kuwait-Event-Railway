"use client";

import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";

export function ReviewLockedState() {
  const t = useTranslations("reviews");

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">
            {t("lockedTitle")}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("lockedDescription")}
          </p>
        </div>
      </div>
    </div>
  );
}
