"use client";

import { useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────
interface Navbar3DBgProps {
  isScrolled: boolean;
}

// ─── Theme Detection (SSR-safe) ──────────────────────────────
const themeQuery =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

function subscribeTheme(callback: () => void) {
  const mql = themeQuery;
  if (!mql) return () => {};
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getThemeSnapshot(): boolean {
  if (typeof document !== "undefined") {
    const html = document.documentElement;
    if (html.classList.contains("dark")) return true;
    if (html.classList.contains("light")) return false;
  }
  return themeQuery?.matches ?? false;
}

function getThemeServerSnapshot(): boolean {
  return false;
}

function useIsDark(): boolean {
  return useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);
}

// ─── Reduced Motion Detection (SSR-safe) ─────────────────────
const reducedMotionQuery =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

function subscribeReducedMotion(callback: () => void) {
  const mql = reducedMotionQuery;
  if (!mql) return () => {};
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return reducedMotionQuery?.matches ?? false;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

// ─── Gradient Mesh Spot Configs (Deterministic) ──────────────
// Each spot is a radial gradient circle that slowly drifts across the navbar.
// Positions animate between keyframes over 10-20 seconds.

interface GradientSpot {
  // Sequence of positions the spot drifts through (percentage coordinates)
  keyframes: { x: string; y: string }[];
  // Duration for one full cycle through all keyframes (seconds)
  duration: number;
  // Size of the gradient spot (percentage of container)
  size: string;
  // Color of the gradient spot (oklch)
  color: string;
}

/** Dark mode gradient spots — navy base with gold accents */
const DARK_SPOTS: GradientSpot[] = [
  {
    keyframes: [
      { x: "15%", y: "30%" },
      { x: "40%", y: "50%" },
      { x: "70%", y: "30%" },
      { x: "40%", y: "20%" },
      { x: "15%", y: "30%" },
    ],
    duration: 18,
    size: "70%",
    color: "oklch(0.15 0.03 260 / 60%)",
  },
  {
    keyframes: [
      { x: "80%", y: "20%" },
      { x: "60%", y: "60%" },
      { x: "30%", y: "40%" },
      { x: "60%", y: "10%" },
      { x: "80%", y: "20%" },
    ],
    duration: 14,
    size: "50%",
    color: "oklch(0.76 0.13 85 / 15%)",
  },
  {
    keyframes: [
      { x: "50%", y: "70%" },
      { x: "20%", y: "40%" },
      { x: "80%", y: "50%" },
      { x: "50%", y: "30%" },
      { x: "50%", y: "70%" },
    ],
    duration: 20,
    size: "60%",
    color: "oklch(0.15 0.03 260 / 40%)",
  },
  {
    keyframes: [
      { x: "25%", y: "50%" },
      { x: "70%", y: "40%" },
      { x: "50%", y: "70%" },
      { x: "10%", y: "30%" },
      { x: "25%", y: "50%" },
    ],
    duration: 16,
    size: "40%",
    color: "oklch(0.76 0.13 85 / 10%)",
  },
];

/** Light mode gradient spots — white base with subtle gold accents */
const LIGHT_SPOTS: GradientSpot[] = [
  {
    keyframes: [
      { x: "15%", y: "30%" },
      { x: "40%", y: "50%" },
      { x: "70%", y: "30%" },
      { x: "40%", y: "20%" },
      { x: "15%", y: "30%" },
    ],
    duration: 18,
    size: "70%",
    color: "oklch(0.995 0.004 85 / 60%)",
  },
  {
    keyframes: [
      { x: "80%", y: "20%" },
      { x: "60%", y: "60%" },
      { x: "30%", y: "40%" },
      { x: "60%", y: "10%" },
      { x: "80%", y: "20%" },
    ],
    duration: 14,
    size: "50%",
    color: "oklch(0.76 0.13 85 / 8%)",
  },
  {
    keyframes: [
      { x: "50%", y: "70%" },
      { x: "20%", y: "40%" },
      { x: "80%", y: "50%" },
      { x: "50%", y: "30%" },
      { x: "50%", y: "70%" },
    ],
    duration: 20,
    size: "60%",
    color: "oklch(0.995 0.004 85 / 40%)",
  },
  {
    keyframes: [
      { x: "25%", y: "50%" },
      { x: "70%", y: "40%" },
      { x: "50%", y: "70%" },
      { x: "10%", y: "30%" },
      { x: "25%", y: "50%" },
    ],
    duration: 16,
    size: "40%",
    color: "oklch(0.76 0.13 85 / 6%)",
  },
];

// ─── Noise Texture Overlay ───────────────────────────────────
// Inline SVG feTurbulence for a subtle grain texture effect.
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// ─── Mesh Gradient Background ────────────────────────────────
function MeshGradient({ isDark, prefersReducedMotion }: { isDark: boolean; prefersReducedMotion: boolean }) {
  const spots = isDark ? DARK_SPOTS : LIGHT_SPOTS;

  // Base background color
  const baseBg = isDark
    ? "oklch(0.15 0.03 260 / 85%)"
    : "oklch(0.995 0.004 85 / 85%)";

  return (
    <div
      className="absolute inset-0"
      style={{ backgroundColor: baseBg }}
    >
      {/* ── Animated gradient spots ── */}
      {spots.map((spot, i) => {
        // Build Framer Motion keyframes for x and y positions
        const xKeyframes = spot.keyframes.map((kf) => kf.x);
        const yKeyframes = spot.keyframes.map((kf) => kf.y);

        return (
          <motion.div
            key={`spot-${i}`}
            animate={
              prefersReducedMotion
                ? { x: spot.keyframes[0].x, y: spot.keyframes[0].y }
                : { x: xKeyframes, y: yKeyframes }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    duration: spot.duration,
                    repeat: Infinity,
                    ease: "linear",
                  }
            }
            style={{
              position: "absolute",
              width: spot.size,
              height: spot.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${spot.color}, transparent 70%)`,
              filter: "blur(40px)",
              transform: "translate(-50%, -50%)",
              willChange: prefersReducedMotion ? "auto" : "transform",
            }}
          />
        );
      })}

      {/* ── Noise texture overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: NOISE_SVG,
          backgroundRepeat: "repeat",
          opacity: 0.03,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />

      {/* ── Glassmorphism backdrop blur layer ── */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
function Navbar3DBg({ isScrolled }: Navbar3DBgProps) {
  const isDark = useIsDark();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <AnimatePresence>
      {isScrolled && (
        <motion.div
          key="navbar-3d-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
          role="presentation"
        >
          <MeshGradient isDark={isDark} prefersReducedMotion={prefersReducedMotion} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { Navbar3DBg };
export type { Navbar3DBgProps };
export default Navbar3DBg;
