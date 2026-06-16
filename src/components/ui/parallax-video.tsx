"use client";

import React, { useRef, useState, useCallback, useEffect, useSyncExternalStore } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

/* ──────────────────────────────────────────────
   Reduced-motion & data-saver detection hooks
   ────────────────────────────────────────────── */

const emptySubscribe = () => () => {};

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false // SSR fallback
  );
}

function useDataSaver(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => {
      const nav = navigator as { connection?: { saveData?: boolean } };
      return nav.connection?.saveData ?? false;
    },
    () => false // SSR fallback
  );
}

/* ──────────────────────────────────────────────
   ParallaxVideo — Production-grade interactive
   video background with performance optimization
   ────────────────────────────────────────────── */

interface ParallaxVideoProps {
  src: string;
  className?: string;
  overlayOpacity?: number;
  /** Parallax speed multiplier (0–0.15 recommended) */
  speed?: number;
  /** Enable 3D tilt effect on mouse move */
  tiltEffect?: boolean;
  /** Enable cursor-following light spot */
  lightEffect?: boolean;
  /** Enable scroll-based parallax depth */
  scrollParallax?: boolean;
  /** Poster image for loading state & fallback */
  poster?: string;
  /** Preload strategy: auto (hero), metadata (below-fold), none (lazy) */
  preload?: "auto" | "metadata" | "none";
  /** Overlay blend mode for seamless integration */
  blendMode?: "normal" | "multiply" | "overlay" | "screen";
  /** Children rendered inside the video container */
  children?: React.ReactNode;
}

export function ParallaxVideo({
  src,
  className,
  overlayOpacity = 0.4,
  speed = 0.05,
  tiltEffect = true,
  lightEffect = true,
  scrollParallax = true,
  poster,
  preload = "auto",
  blendMode = "normal",
  children,
}: ParallaxVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(preload === "auto");

  const prefersReducedMotion = usePrefersReducedMotion();
  const dataSaver = useDataSaver();

  // Skip video entirely on reduced motion or data saver
  const skipVideo = prefersReducedMotion || dataSaver;

  // ── IntersectionObserver: lazy load + play/pause ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsVisible(inView);

        // Start loading when near viewport
        if (inView && !shouldLoad) {
          setShouldLoad(true);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [shouldLoad]);

  // Play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad || skipVideo) return;

    if (isVisible) {
      video.play().catch(() => {
        // Autoplay was prevented (e.g., iOS Low Power Mode)
      });
    } else {
      video.pause();
    }
  }, [isVisible, shouldLoad, skipVideo]);

  // ── Motion Values ──
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 120, damping: 30, mass: 0.5 };
  const rawOffsetX = useMotionValue(0);
  const rawOffsetY = useMotionValue(0);
  const offsetX = useSpring(rawOffsetX, springConfig);
  const offsetY = useSpring(rawOffsetY, springConfig);

  // 3D tilt rotation (subtle, max ±3°)
  const tiltX = useSpring(useTransform(mouseY, [0, 1], [3, -3]), springConfig);
  const tiltY = useSpring(useTransform(mouseX, [0, 1], [-3, 3]), springConfig);

  // Light spot position (%)
  const lightX = useSpring(useTransform(mouseX, [0, 1], [20, 80]), {
    stiffness: 80,
    damping: 25,
  });
  const lightY = useSpring(useTransform(mouseY, [0, 1], [20, 80]), {
    stiffness: 80,
    damping: 25,
  });

  // Computed light gradient
  const lightGradient = useTransform(
    [lightX, lightY] as [ReturnType<typeof useSpring>, ReturnType<typeof useSpring>],
    ([lx, ly]: number[]) =>
      `radial-gradient(ellipse 600px 400px at ${lx}% ${ly}%, oklch(0.76 0.13 85 / 6%), transparent 70%)`
  );

  // Scroll parallax
  const scrollY = useMotionValue(0);
  const scrollOffset = useTransform(scrollY, [0, 2000], [0, -60]);

  // Combined transform string for the video wrapper
  const videoTransform = useTransform(
    [offsetX, offsetY, scrollOffset, tiltX, tiltY] as [
      ReturnType<typeof useSpring>,
      ReturnType<typeof useSpring>,
      ReturnType<typeof useTransform<number>>,
      ReturnType<typeof useSpring>,
      ReturnType<typeof useSpring>,
    ],
    ([ox, oy, so, tx, ty]: number[]) => {
      const scrollPart = scrollParallax ? `translateY(${so}px)` : "";
      const tiltPart = tiltEffect ? `rotateX(${tx}deg) rotateY(${ty}deg)` : "";
      return `translateX(${ox}px) translateY(${oy}px) ${scrollPart} scale(1.15) ${tiltPart}`;
    }
  );

  useEffect(() => {
    if (!scrollParallax) return;
    const handleScroll = () => {
      scrollY.set(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollParallax, scrollY]);

  // ── Mouse handlers ──
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      mouseX.set(nx);
      mouseY.set(ny);
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      rawOffsetX.set((e.clientX - centerX) * speed);
      rawOffsetY.set((e.clientY - centerY) * speed);
    },
    [speed, mouseX, mouseY, rawOffsetX, rawOffsetY]
  );

  const handleMouseLeave = useCallback(() => {
    rawOffsetX.set(0);
    rawOffsetY.set(0);
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [rawOffsetX, rawOffsetY, mouseX, mouseY]);

  // Touch support (reduced intensity for finger imprecision)
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!containerRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const nx = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
      const ny = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));
      mouseX.set(nx);
      mouseY.set(ny);
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      rawOffsetX.set((touch.clientX - centerX) * speed * 0.5);
      rawOffsetY.set((touch.clientY - centerY) * speed * 0.5);
    },
    [speed, mouseX, mouseY, rawOffsetX, rawOffsetY]
  );

  const handleTouchEnd = useCallback(() => {
    rawOffsetX.set(0);
    rawOffsetY.set(0);
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [rawOffsetX, rawOffsetY, mouseX, mouseY]);

  const handleVideoError = useCallback(() => {
    setHasError(true);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Gradient fallback for error / skip
  const fallbackGradient =
    "linear-gradient(to bottom, oklch(0.15 0.03 260) 0%, oklch(0.12 0.04 260) 50%, oklch(0.10 0.02 260) 100%)";

  // Determine positioning: if caller passes a position class (e.g. "absolute inset-0"),
  // use it; otherwise default to "relative" so absolute children are contained.
  const hasPositionClass = className?.includes("absolute") || className?.includes("fixed") || className?.includes("sticky");
  const positionClass = hasPositionClass ? "" : "relative";

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${positionClass} ${className ?? ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={tiltEffect ? { perspective: "1200px" } : undefined}
    >
      {/* Loading shimmer */}
      {!isLoaded && !hasError && !skipVideo && shouldLoad && (
        <div
          className="absolute inset-0 shimmer"
          style={{ background: fallbackGradient }}
        />
      )}

      {/* Fallback: poster image on error or reduced motion */}
      {(hasError || skipVideo) && poster && (
        <img
          src={poster}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
      )}

      {/* Fallback: gradient on error or reduced motion (no poster) */}
      {(hasError || skipVideo) && !poster && (
        <div className="absolute inset-0" style={{ background: fallbackGradient }} />
      )}

      {/* Video — only rendered when shouldLoad and not skipped */}
      {!hasError && !skipVideo && shouldLoad && (
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: videoTransform,
            ...(tiltEffect ? { transformStyle: "preserve-3d" } : {}),
          }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload={preload}
            onError={handleVideoError}
            onCanPlay={handleCanPlay}
            poster={poster}
          >
            <source src={src} />
          </video>
        </motion.div>
      )}

      {/* Dark overlay with optional blend mode */}
      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{
          opacity: overlayOpacity,
          ...(blendMode !== "normal" ? { mixBlendMode: blendMode } : {}),
        }}
      />

      {/* Interactive light spot that follows cursor */}
      {lightEffect && !skipVideo && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{ background: lightGradient }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default ParallaxVideo;
