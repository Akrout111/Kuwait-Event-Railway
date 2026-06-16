"use client";

import { useState, useEffect, useSyncExternalStore, useCallback, useRef } from "react";
import { useLocale } from "next-intl";
import { Loader3D } from "@/components/ui/loader-3d";

const emptySubscribe = () => () => {};

/**
 * SiteLoader — Shows the 3D animated loader on first visit,
 * then stores in sessionStorage so it doesn't repeat on navigation.
 */
export function SiteLoader() {
  const locale = useLocale();
  const alreadyLoaded = useSyncExternalStore(
    emptySubscribe,
    () => sessionStorage.getItem("site-loaded") === "true",
    () => false
  );

  const [isLoading, setIsLoading] = useState(!alreadyLoaded);
  const markLoadedRef = useRef(false);

  const markLoaded = useCallback(() => {
    if (!markLoadedRef.current) {
      markLoadedRef.current = true;
      sessionStorage.setItem("site-loaded", "true");
    }
  }, []);

  useEffect(() => {
    if (alreadyLoaded) return;

    // Mark as loaded after a minimum display time
    const timer = setTimeout(() => {
      setIsLoading(false);
      markLoaded();
    }, 2500);

    return () => clearTimeout(timer);
  }, [alreadyLoaded, markLoaded]);

  if (alreadyLoaded) return null;

  const appName = locale === "en" ? "Kuwait Events" : "فعاليات الكويت";

  return <Loader3D isLoading={isLoading} maxDuration={3500} appName={appName} />;
}
