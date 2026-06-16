/**
 * Centralized animation configuration for Kuwait Events Platform
 * Single source of truth for all animation tokens
 */

export const ANIMATION = {
  /** Premium cubic-bezier easing — consistent across all components */
  EASING: [0.22, 1, 0.36, 1] as [number, number, number, number],

  /** Standard durations (seconds) */
  DURATION: {
    fast: 0.3,
    normal: 0.5,
    slow: 0.7,
    slower: 0.9,
  },

  /** Standard delays for stagger effects */
  STAGGER: {
    fast: 0.08,
    normal: 0.1,
    slow: 0.15,
  },

  /** Viewport margin for scroll-triggered animations */
  VIEWPORT_MARGIN: "-50px",

  /** Spring config for interactive elements */
  SPRING: {
    magnetic: { stiffness: 350, damping: 15, mass: 0.5 },
    card: { stiffness: 300, damping: 20, mass: 0.5 },
    gentle: { stiffness: 200, damping: 25, mass: 0.8 },
  },
} as const;

/** Helper to create consistent motion variants */
export function createFadeSlideVariants(
  direction: "up" | "down" | "left" | "right" = "up"
) {
  const offsets = {
    up: { x: 0, y: 40 },
    down: { x: 0, y: -40 },
    left: { x: 60, y: 0 },
    right: { x: -60, y: 0 },
  };

  return {
    hidden: { opacity: 0, ...offsets[direction] },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: ANIMATION.DURATION.slow,
        ease: ANIMATION.EASING,
      },
    },
  };
}
