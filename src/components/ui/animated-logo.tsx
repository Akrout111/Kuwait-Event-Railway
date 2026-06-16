"use client";

import { useSyncExternalStore } from "react";

interface AnimatedLogoProps {
  className?: string;
  size?: number;
}

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function AnimatedLogo({ className, size = 40 }: AnimatedLogoProps) {
  const mounted = useMounted();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
    >
      <path
        d="M20 2 L24 14 L36 14 L26 22 L30 34 L20 26 L10 34 L14 22 L4 14 L16 14 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
        style={{ opacity: mounted ? 1 : 0.8 }}
      />
      <path
        d="M20 10 L22 16 L28 16 L23 20 L25 26 L20 22 L15 26 L17 20 L12 16 L18 16 Z"
        className="fill-primary/30"
        style={{ opacity: mounted ? 0.3 : 0.2 }}
      />
    </svg>
  );
}
