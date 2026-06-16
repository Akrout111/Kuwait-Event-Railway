"use client";

import { useSafeAuth } from "@/hooks/use-safe-auth";
import { useTranslations } from "next-intl";

export function NavbarUserButton() {
  const { isSignedIn, signOut } = useSafeAuth();
  const t = useTranslations("auth");

  // When Clerk is configured, ClerkUserButton is rendered by the auth provider.
  // This component provides a fallback user button for custom auth.
  if (!isSignedIn) return null;

  return (
    <button
      onClick={signOut}
      className="inline-flex items-center justify-center rounded-full w-9 h-9 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
      aria-label={t("signOut")}
    >
      {t("signOut")}
    </button>
  );
}
