"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/** Premium cubic-bezier easing — consistent with MotionSection / AnimatedSection */
const PREMIUM_CUBIC = (t: number): number => {
  // Approximates CSS cubic-bezier(0.22, 1, 0.36, 1) via Bernstein polynomial
  const cx = 0.22;
  const cy = 1.0;
  const bx = 0.36;
  const by = 1.0;
  const ax = 1.0 - 3 * bx + 3 * cx;
  const ay = 1.0 - 3 * by + 3 * cy;
  const bxb = 3 * bx - 6 * cx;
  const byb = 3 * by - 6 * cy;
  const cxc = 3 * cx;
  const cyc = 3 * cy;

  // Newton-Raphson to find t for given x, then compute y
  let guess = t;
  for (let i = 0; i < 8; i++) {
    const x = ((ax * guess + bxb) * guess + cxc) * guess - t;
    if (Math.abs(x) < 1e-6) break;
    const dx = (3 * ax * guess + 2 * bxb) * guess + cxc;
    if (Math.abs(dx) < 1e-6) break;
    guess -= x / dx;
  }
  return ((ay * guess + byb) * guess + cyc) * guess;
};

interface AnimatedCounterProps {
  /** Number to count up to */
  target: number;
  /** Animation duration in milliseconds (default 1800) */
  duration?: number;
  /** Optional suffix displayed after the number (e.g. "+" for "150+") */
  suffix?: string;
  /** Optional prefix displayed before the number (e.g. "$" for "$150") */
  prefix?: string;
  /** CSS class for the span wrapper */
  className?: string;
}

/**
 * AnimatedCounter — shared component for counting up to a target number.
 * Uses requestAnimationFrame with premium cubic-bezier easing for a luxury feel.
 * Only starts animating when scrolled into view (once: true).
 */
export function AnimatedCounter({
  target,
  duration = 1800,
  suffix,
  prefix,
  className,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isInView || target === 0) return;

    startTimeRef.current = null;

    function step(timestamp: number) {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Premium cubic-bezier easing for luxury feel
      const eased = PREMIUM_CUBIC(progress);
      const current = Math.round(eased * target);
      setCount(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}
