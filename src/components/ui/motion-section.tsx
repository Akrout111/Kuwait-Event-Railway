"use client";

import { motion, type Variants } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { ReactNode } from "react";

/* ──────────────────────────────────────────────
   Premium easing — consistent across the app
   ────────────────────────────────────────────── */
const PREMIUM_CUBIC: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ──────────────────────────────────────────────
   Direction-specific variants
   ────────────────────────────────────────────── */
const directionVariants: Record<string, Variants> = {
  up: {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: PREMIUM_CUBIC },
    },
  },
  down: {
    hidden: { opacity: 0, y: -32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: PREMIUM_CUBIC },
    },
  },
  start: {
    hidden: { opacity: 0, x: -32 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: PREMIUM_CUBIC },
    },
  },
  end: {
    hidden: { opacity: 0, x: 32 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: PREMIUM_CUBIC },
    },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, ease: PREMIUM_CUBIC },
    },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: PREMIUM_CUBIC },
    },
  },
};

/* ──────────────────────────────────────────────
   MotionSection — Scroll-triggered reveal
   ────────────────────────────────────────────── */

interface MotionSectionProps {
  children: ReactNode;
  direction?: "up" | "down" | "start" | "end" | "fade" | "scale";
  delay?: number;
  className?: string;
  /** Override reduced motion behavior */
  forceAnimate?: boolean;
}

export function MotionSection({
  children,
  direction = "up",
  delay = 0,
  className,
  forceAnimate = false,
}: MotionSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  // Skip animation entirely if reduced motion preferred (unless forced)
  if (prefersReducedMotion && !forceAnimate) {
    return <div className={className}>{children}</div>;
  }

  const variants = directionVariants[direction] ?? directionVariants.up;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        ...variants,
        visible: {
          ...(variants.visible as Record<string, unknown>),
          transition: {
            ...((variants.visible as Record<string, unknown>).transition as Record<string, unknown>),
            delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   StaggerContainer — Stagger children animations
   ────────────────────────────────────────────── */

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  /** Delay before first child animates */
  delayChildren?: number;
}

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  delayChildren = 0.1,
}: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        ...staggerContainerVariants,
        visible: {
          ...staggerContainerVariants.visible,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   StaggerItem — Individual stagger child
   ────────────────────────────────────────────── */

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: PREMIUM_CUBIC },
  },
};

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
