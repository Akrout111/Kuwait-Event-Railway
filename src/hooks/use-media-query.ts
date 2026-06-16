"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * useMediaQuery — SSR-safe hook for matching media queries.
 * @param query - CSS media query string
 * @param ssrFallback - Default value for SSR (default: false)
 */
export function useMediaQuery(query: string, ssrFallback = false): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query]
  );
  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query]
  );
  const getServerSnapshot = useCallback(() => ssrFallback, [ssrFallback]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
