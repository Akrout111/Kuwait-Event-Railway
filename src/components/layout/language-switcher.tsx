"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useTransition } from "react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSwitching, setIsSwitching] = useState(false);
  const t = useTranslations("nav");

  const toggleLocale = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    setIsSwitching(true);
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
      // Small delay to let the transition feel smooth
      setTimeout(() => setIsSwitching(false), 300);
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      disabled={isPending}
      aria-label={t("switchLanguage")}
      className="relative gap-1.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
    >
      <Globe className="h-4 w-4" />
      <AnimatePresence mode="wait">
        <motion.span
          key={locale}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-sm font-medium"
        >
          {locale === "ar" ? "EN" : "عربي"}
        </motion.span>
      </AnimatePresence>
      {isPending && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </Button>
  );
}
