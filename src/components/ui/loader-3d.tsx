"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ──────────────────────────────────────────────
   Loader3D — Premium 3D loading screen with
   rotating 8-pointed Islamic star (Rub el Hizb ☸),
   orbiting gold particles, and progress ring.
   Replaces the VideoLoader with pure code animation.
   ────────────────────────────────────────────── */

// ── Types ────────────────────────────────────────
interface Loader3DProps {
  /** Whether the app is still loading */
  isLoading: boolean;
  /** Maximum time to show loader (ms), even if isLoading is true */
  maxDuration?: number;
  /** App name to display (locale-aware) */
  appName?: string;
}

// ── Deterministic particle configs ───────────────
// 8 particles, each offset by 45°, with varying sizes for depth illusion
const PARTICLE_COUNT = 8;
const PARTICLE_ANGLES = Array.from(
  { length: PARTICLE_COUNT },
  (_, i) => i * 45
);
const PARTICLE_SIZES = [5, 4, 6, 4, 5, 4, 6, 4]; // px — deterministic
const PARTICLE_OPACITIES = [0.9, 0.6, 1, 0.7, 0.8, 0.5, 0.9, 0.6]; // varying depth

// ── SVG 8-pointed star clip-path ─────────────────
// Creates a proper 8-pointed Islamic star (Rub el Hizb)
const STAR_CLIP_PATH =
  "polygon(50% 0%, 62.5% 25%, 100% 25%, 75% 50%, 100% 75%, 62.5% 75%, 50% 100%, 37.5% 75%, 0% 75%, 25% 50%, 0% 25%, 37.5% 25%)";

// ── Gradient IDs (unique to avoid SVG collisions) ──
const GOLD_GRADIENT_ID = "loader3d-gold-gradient";
const RING_GRADIENT_ID = "loader3d-ring-gradient";

// ── Elliptical orbit parameters ──────────────────
const ORBIT_RADIUS_X = 80; // px — horizontal radius
const ORBIT_RADIUS_Y = 40; // px — vertical radius (perspective squish)
const ORBIT_DURATION = 4; // seconds per full orbit

// ── Generate smooth elliptical keyframes ─────────
// Pre-computes X/Y positions along the ellipse at regular intervals
function generateEllipseKeyframes(
  radiusX: number,
  radiusY: number,
  steps: number
): { x: number[]; y: number[] } {
  const xValues: number[] = [];
  const yValues: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    xValues.push(Math.cos(angle) * radiusX);
    yValues.push(Math.sin(angle) * radiusY);
  }

  return { x: xValues, y: yValues };
}

const ORBIT_KEYFRAMES = generateEllipseKeyframes(
  ORBIT_RADIUS_X,
  ORBIT_RADIUS_Y,
  36 // 36 steps = smooth 10° increments
);

/* ──────────────────────────────────────────────
   Loader3D Component
   ────────────────────────────────────────────── */
export function Loader3D({
  isLoading,
  maxDuration = 4000,
  appName = "فعاليات الكويت",
}: Loader3DProps) {
  const [showLoader, setShowLoader] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  // Detect prefers-reduced-motion for accessibility
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // If reduced motion is preferred, progress is always 100% (static display)
  const [progress, setProgress] = useState(prefersReducedMotion ? 100 : 0);

  // ── Auto-dismiss after maxDuration ────────────
  useEffect(() => {
    const maxTimer = setTimeout(() => {
      setFadeOut(true);
    }, maxDuration);
    return () => clearTimeout(maxTimer);
  }, [maxDuration]);

  // ── Dismiss when loading completes ────────────
  useEffect(() => {
    if (!isLoading) {
      // Buffer: let the page render underneath before fading
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 600);
      return () => clearTimeout(fadeTimer);
    }
  }, [isLoading]);

  // ── Remove from DOM after exit animation ──────
  useEffect(() => {
    if (fadeOut) {
      const hideTimer = setTimeout(() => {
        setShowLoader(false);
      }, 800); // Match exit animation duration
      return () => clearTimeout(hideTimer);
    }
  }, [fadeOut]);

  // ── Progress ring animation (0% → 100% over 2.5s) ──
  useEffect(() => {
    // Skip animation if reduced motion is preferred (progress starts at 100%)
    if (prefersReducedMotion) return;

    const duration = 2500; // ms — matches the spec
    const startTime = Date.now();
    let rafId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);

      if (pct < 100) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [prefersReducedMotion]);

  // ── SVG progress ring calculations ────────────
  const ringRadius = 72;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringStrokeDashoffset =
    ringCircumference - (progress / 100) * ringCircumference;

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: "oklch(0.10 0.02 260)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
          }}
        >
          {/* ── Background: Radial vignette ────────── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 20%, oklch(0.06 0.02 260 / 80%) 100%)",
            }}
          />

          {/* ── Background: Faint grain texture ────── */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              backgroundSize: "128px 128px",
            }}
          />

          {/* ── Center content ─────────────────────── */}
          <div className="relative flex flex-col items-center justify-center">
            {/* ── Star + Ring + Particles wrapper ──── */}
            <div className="relative" style={{ width: 180, height: 180 }}>
              {/* ── Pulsing gold glow behind the star ── */}
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  width: 140,
                  height: 140,
                  left: "50%",
                  top: "50%",
                  marginLeft: -70,
                  marginTop: -70,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, oklch(0.76 0.13 85 / 30%) 0%, oklch(0.76 0.13 85 / 8%) 50%, transparent 70%)",
                }}
                animate={
                  prefersReducedMotion
                    ? { opacity: 0.5 }
                    : {
                        opacity: [0.4, 0.7, 0.4],
                        scale: [1, 1.1, 1],
                      }
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* ── Central 8-pointed star ──────────── */}
              <motion.div
                className="absolute"
                style={{
                  width: 120,
                  height: 120,
                  left: "50%",
                  top: "50%",
                  marginLeft: -60,
                  marginTop: -60,
                  willChange: "transform",
                }}
                animate={
                  prefersReducedMotion ? { rotate: 0 } : { rotate: 360 }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        duration: 8, // 8 seconds per revolution
                        repeat: Infinity,
                        ease: "linear",
                      }
                }
              >
                <svg
                  viewBox="0 0 100 100"
                  width="120"
                  height="120"
                  style={{
                    clipPath: STAR_CLIP_PATH,
                    filter:
                      "drop-shadow(0 0 16px oklch(0.76 0.13 85 / 50%)) drop-shadow(0 0 4px oklch(0.82 0.14 90 / 80%))",
                  }}
                >
                  <defs>
                    <linearGradient
                      id={GOLD_GRADIENT_ID}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="oklch(0.82 0.14 90)" />
                      <stop offset="40%" stopColor="oklch(0.76 0.13 85)" />
                      <stop offset="70%" stopColor="oklch(0.70 0.11 75)" />
                      <stop offset="100%" stopColor="oklch(0.82 0.14 90)" />
                    </linearGradient>
                  </defs>
                  {/* Two overlapping squares rotated 45° = 8-pointed star */}
                  <rect
                    x="25"
                    y="25"
                    width="50"
                    height="50"
                    fill={`url(#${GOLD_GRADIENT_ID})`}
                    transform="rotate(0 50 50)"
                  />
                  <rect
                    x="25"
                    y="25"
                    width="50"
                    height="50"
                    fill={`url(#${GOLD_GRADIENT_ID})`}
                    transform="rotate(45 50 50)"
                  />
                </svg>
              </motion.div>

              {/* ── Progress ring (SVG) ─────────────── */}
              <svg
                className="absolute inset-0 pointer-events-none"
                viewBox="0 0 180 180"
                width="180"
                height="180"
                style={{ transform: "rotate(-90deg)" }} // Start from top
              >
                <defs>
                  <linearGradient
                    id={RING_GRADIENT_ID}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="oklch(0.82 0.14 90)" />
                    <stop offset="100%" stopColor="oklch(0.76 0.13 85)" />
                  </linearGradient>
                </defs>
                {/* Background track */}
                <circle
                  cx="90"
                  cy="90"
                  r={ringRadius}
                  fill="none"
                  stroke="oklch(0.76 0.13 85 / 8%)"
                  strokeWidth="2"
                />
                {/* Progress arc */}
                <circle
                  cx="90"
                  cy="90"
                  r={ringRadius}
                  fill="none"
                  stroke={`url(#${RING_GRADIENT_ID})`}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringStrokeDashoffset}
                  style={{
                    transition: prefersReducedMotion
                      ? "none"
                      : "stroke-dashoffset 0.08s linear",
                  }}
                />
              </svg>

              {/* ── Orbiting particles ──────────────── */}
              {!prefersReducedMotion &&
                PARTICLE_ANGLES.map((angleOffset, i) => {
                  // Each particle starts at a different point on the ellipse
                  // by offsetting the keyframe array
                  const offsetSteps = Math.round(
                    (angleOffset / 360) * ORBIT_KEYFRAMES.x.length
                  );
                  const rotatedX = [
                    ...ORBIT_KEYFRAMES.x.slice(offsetSteps),
                    ...ORBIT_KEYFRAMES.x.slice(0, offsetSteps),
                  ];
                  const rotatedY = [
                    ...ORBIT_KEYFRAMES.y.slice(offsetSteps),
                    ...ORBIT_KEYFRAMES.y.slice(0, offsetSteps),
                  ];

                  return (
                    <motion.div
                      key={`particle-${i}`}
                      className="absolute"
                      style={{
                        width: PARTICLE_SIZES[i],
                        height: PARTICLE_SIZES[i],
                        borderRadius: "50%",
                        backgroundColor: `oklch(0.82 0.14 90 / ${PARTICLE_OPACITIES[i]})`,
                        left: "50%",
                        top: "50%",
                        marginLeft: -(PARTICLE_SIZES[i] / 2),
                        marginTop: -(PARTICLE_SIZES[i] / 2),
                        boxShadow: `0 0 ${PARTICLE_SIZES[i] + 3}px oklch(0.76 0.13 85 / ${PARTICLE_OPACITIES[i] * 0.7}), 0 0 ${PARTICLE_SIZES[i] + 8}px oklch(0.76 0.13 85 / ${PARTICLE_OPACITIES[i] * 0.25})`,
                        willChange: "transform",
                      }}
                      animate={{
                        x: rotatedX,
                        y: rotatedY,
                      }}
                      transition={{
                        duration: ORBIT_DURATION,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      {/* Subtle trail effect — larger, faded copy behind */}
                      <div
                        className="absolute rounded-full"
                        style={{
                          width: PARTICLE_SIZES[i] * 2.5,
                          height: PARTICLE_SIZES[i] * 2.5,
                          top: -(PARTICLE_SIZES[i] * 0.75),
                          left: -(PARTICLE_SIZES[i] * 0.75),
                          backgroundColor: `oklch(0.82 0.14 90 / ${PARTICLE_OPACITIES[i] * 0.2})`,
                          filter: "blur(3px)",
                        }}
                      />
                    </motion.div>
                  );
                })}
            </div>

            {/* ── App name with gold gradient text ─── */}
            <motion.div
              className="gradient-text text-2xl sm:text-3xl font-bold mt-8 select-none"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
            >
              {appName}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Loader3D;
