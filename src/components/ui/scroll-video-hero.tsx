"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Search, Compass, ChevronDown, Sparkles } from "lucide-react";

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
    () => false
  );
}

function useDataSaver(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => {
      const nav = navigator as { connection?: { saveData?: boolean } };
      return nav.connection?.saveData ?? false;
    },
    () => false
  );
}

/* ──────────────────────────────────────────────
   Animation config — premium cubic-bezier
   ────────────────────────────────────────────── */

const CUBIC_PREMIUM: [number, number, number, number] = [0.22, 1, 0.36, 1];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.3,
    },
  },
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: CUBIC_PREMIUM,
    },
  },
};

const fadeSlideUpSmall = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: CUBIC_PREMIUM,
    },
  },
};

/* ──────────────────────────────────────────────
   Floating gold ring — decorative element
   Uses RTL-aware inline start positioning
   ────────────────────────────────────────────── */

interface FloatingRingProps {
  size: number;
  top: string;
  inlineStart: string;
  delay: number;
  floatDuration: number;
  rotateDuration: number;
}

function FloatingRing({
  size,
  top,
  inlineStart,
  delay,
  floatDuration,
  rotateDuration,
}: FloatingRingProps) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        top,
        insetInlineStart: inlineStart,
        border: "1px solid oklch(0.76 0.13 85 / 12%)",
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0, 0.5, 0.3, 0.5],
        scale: [0.8, 1, 0.95, 1],
        y: [0, -20, 8, -20],
        rotate: [0, 360],
      }}
      transition={{
        opacity: { duration: floatDuration, repeat: Infinity, delay, ease: "easeInOut" },
        scale: { duration: floatDuration, repeat: Infinity, delay, ease: "easeInOut" },
        y: { duration: floatDuration, repeat: Infinity, delay, ease: "easeInOut" },
        rotate: { duration: rotateDuration, repeat: Infinity, ease: "linear" },
      }}
    />
  );
}

/* ──────────────────────────────────────────────
   Deterministic floating ring configs
   (no Math.random — all values hardcoded)
   ────────────────────────────────────────────── */

const RING_CONFIGS: FloatingRingProps[] = [
  { size: 120, top: "12%", inlineStart: "8%", delay: 0, floatDuration: 8, rotateDuration: 40 },
  { size: 80, top: "55%", inlineStart: "75%", delay: 1.5, floatDuration: 10, rotateDuration: 55 },
  { size: 180, top: "25%", inlineStart: "68%", delay: 0.8, floatDuration: 12, rotateDuration: 70 },
  { size: 60, top: "70%", inlineStart: "15%", delay: 2.2, floatDuration: 9, rotateDuration: 45 },
  { size: 100, top: "40%", inlineStart: "50%", delay: 1.0, floatDuration: 11, rotateDuration: 60 },
];

/* ──────────────────────────────────────────────
   Deterministic gold particle dot configs
   ────────────────────────────────────────────── */

const PARTICLE_DOTS = [
  { x: "10%", y: "20%", size: 3, delay: 0 },
  { x: "85%", y: "35%", size: 2, delay: 0.5 },
  { x: "70%", y: "70%", size: 4, delay: 1.2 },
  { x: "25%", y: "80%", size: 2, delay: 0.8 },
  { x: "50%", y: "15%", size: 3, delay: 1.5 },
  { x: "92%", y: "60%", size: 2, delay: 0.3 },
  { x: "15%", y: "55%", size: 3, delay: 2.0 },
];

/* ──────────────────────────────────────────────
   ScrollVideoHero — Scroll-interactive video hero
   Video playback is tied to scroll position.
   ────────────────────────────────────────────── */

interface ScrollVideoHeroProps {
  /** Video URL for the scroll-driven background */
  src: string;
  /** Number of upcoming events for stats display */
  upcomingCount?: number;
  /** Fallback poster image for reduced motion / data saver */
  poster?: string;
}

export function ScrollVideoHero({ src, upcomingCount, poster }: ScrollVideoHeroProps) {
  const t = useTranslations("home");

  /* ── Refs ── */
  const containerRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* ── State ── */
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  /* ── Accessibility hooks ── */
  const prefersReducedMotion = usePrefersReducedMotion();
  const dataSaver = useDataSaver();
  const skipVideo = prefersReducedMotion || dataSaver;

  /* ── Scroll tracking ── */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  /* ── Content parallax transforms ── */
  // Opacity: 1 → 0 as scroll goes 0 → 0.3
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  // TranslateY: 0 → -80 as scroll goes 0 → 0.5
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);

  /* ── 3D tilt + cursor-following light ── */
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 120, damping: 30, mass: 0.5 };

  // 3D tilt rotation (subtle, max ±3°)
  const tiltX = useSpring(useTransform(mouseY, [0, 1], [3, -3]), springConfig);
  const tiltY = useSpring(useTransform(mouseX, [0, 1], [-3, 3]), springConfig);

  // Cursor-following light spot position (%)
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

  /* ── IntersectionObserver: lazy load video ── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsVisible(inView);

        if (inView && !shouldLoad) {
          setShouldLoad(true);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [shouldLoad]);

  /* ── Scroll-driven video playback ── */
  // Use a ref for the target time to avoid stale closures
  const targetTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!videoRef.current || !videoRef.current.duration || skipVideo) return;

    // Set the target time based on scroll progress
    targetTimeRef.current = latest * videoRef.current.duration;

    // Start RAF loop if not already running
    if (rafRef.current === null) {
      const interpolate = () => {
        const video = videoRef.current;
        if (!video || !video.duration) {
          rafRef.current = null;
          return;
        }

        const target = targetTimeRef.current;
        const current = video.currentTime;
        const diff = target - current;

        // Smoothly interpolate towards the target
        // Use a lerp factor that's smooth but responsive
        if (Math.abs(diff) > 0.03) {
          // Lerp with factor 0.15 for smooth interpolation
          video.currentTime = current + diff * 0.15;
          rafRef.current = requestAnimationFrame(interpolate);
        } else if (Math.abs(diff) > 0.005) {
          // Snap when very close
          video.currentTime = target;
          rafRef.current = requestAnimationFrame(interpolate);
        } else {
          // Close enough — stop the loop
          video.currentTime = target;
          rafRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(interpolate);
    }
  });

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  /* ── Pause video to prevent autoplay ── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || skipVideo) return;

    // Ensure video is paused and not autoplaying
    video.pause();

    const handlePlay = () => {
      // Only allow play if it's not from user interaction
      // (our scroll-driven approach doesn't use play())
      if (!video.dataset.scrollDriven) {
        video.pause();
      }
    };

    video.addEventListener("play", handlePlay);
    return () => video.removeEventListener("play", handlePlay);
  }, [skipVideo, isLoaded]);

  /* ── Video error handler ── */
  const handleVideoError = useCallback(() => {
    setHasError(true);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoaded(true);
    // Immediately pause — no autoplay
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  /* ── Mouse handlers for 3D tilt + light ── */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!stickyRef.current) return;
      const rect = stickyRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      mouseX.set(nx);
      mouseY.set(ny);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  /* ── Fallback gradient ── */
  const fallbackGradient =
    "linear-gradient(to bottom, oklch(0.15 0.03 260) 0%, oklch(0.12 0.04 260) 50%, oklch(0.10 0.02 260) 100%)";

  /* ── Video transform (3D tilt) ── */
  const videoTransform = useTransform(
    [tiltX, tiltY] as [
      ReturnType<typeof useSpring>,
      ReturnType<typeof useSpring>,
    ],
    ([tx, ty]: number[]) =>
      `scale(1.15) rotateX(${tx}deg) rotateY(${ty}deg)`
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-[200vh] overflow-hidden"
    >
      {/* ── Sticky container that stays in view while scrolling ── */}
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen overflow-hidden"
        style={{ perspective: "1200px" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* ── Video background (scroll-driven) ── */}
        {!hasError && !skipVideo && shouldLoad && (
          <motion.div
            className="absolute inset-0 will-change-transform"
            style={{
              transform: videoTransform,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Loading shimmer */}
            {!isLoaded && (
              <div
                className="absolute inset-0 shimmer"
                style={{ background: fallbackGradient }}
              />
            )}

            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
              onError={handleVideoError}
              onCanPlay={handleCanPlay}
              poster={poster}
              aria-hidden="true"
              data-scroll-driven="true"
            >
              <source src={src} />
            </video>
          </motion.div>
        )}

        {/* ── Fallback: poster image on error or reduced motion ── */}
        {(hasError || skipVideo) && poster && (
          <div className="absolute inset-0 w-full h-full" aria-hidden="true">
            <Image
              src={poster}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* ── Fallback: gradient on error or reduced motion (no poster) ── */}
        {(hasError || skipVideo) && !poster && (
          <div
            className="absolute inset-0"
            style={{ background: fallbackGradient }}
          />
        )}

        {/* ── Gradient overlay: darker at top/bottom, transparent in center ── */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, oklch(0.12 0.04 260 / 75%) 0%, oklch(0.12 0.04 260 / 15%) 30%, oklch(0.12 0.04 260 / 10%) 60%, oklch(0.12 0.04 260 / 60%) 100%)",
          }}
        />

        {/* ── Subtle grain texture for premium depth ── */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
          }}
        />

        {/* ── Floating decorative gold rings ── */}
        <div className="absolute inset-0 z-[3] pointer-events-none hidden sm:block">
          {RING_CONFIGS.map((ring, i) => (
            <FloatingRing key={i} {...ring} />
          ))}
        </div>

        {/* ── Animated gold particle dots ── */}
        <div className="absolute inset-0 z-[3] pointer-events-none hidden md:block">
          {PARTICLE_DOTS.map((dot, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: dot.x,
                top: dot.y,
                width: dot.size,
                height: dot.size,
                backgroundColor: "oklch(0.76 0.13 85 / 50%)",
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: dot.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* ── Cursor-following light spot ── */}
        {!skipVideo && (
          <motion.div
            className="absolute inset-0 z-[4] pointer-events-none"
            style={{ background: lightGradient }}
          />
        )}

        {/* ── Main hero content — scroll-driven parallax fade ── */}
        <motion.div
          className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center"
          style={{
            opacity: contentOpacity,
            y: contentY,
          }}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            {/* Sparkle badge */}
            {upcomingCount !== undefined && upcomingCount > 0 && (
              <motion.div variants={fadeSlideUpSmall} className="flex justify-center">
                <div className="inline-flex items-center gap-2 ps-4 pe-5 py-2 rounded-full glass-card text-sm font-medium text-white/90 dark:text-white/90">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    <AnimatedCounter target={upcomingCount} /> {t("upcomingEventsCount")}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Main heading — gold gradient text */}
            <motion.h1
              variants={fadeSlideUp}
              className="gradient-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
            >
              {t("heroTitle")}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeSlideUp}
              className="text-lg sm:text-xl md:text-2xl text-white/70 dark:text-white/70 max-w-2xl mx-auto leading-relaxed"
            >
              {t("heroSubtitle")}
            </motion.p>

            {/* CTA buttons — Magnetic effect */}
            <motion.div
              variants={fadeSlideUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              {/* Primary CTA — gold background with glow */}
              <MagneticButton asChild strength={0.25}>
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base sm:text-lg glow-gold transition-all duration-300 hover:brightness-110"
                >
                  <Search className="h-5 w-5 shrink-0" />
                  <span>{t("browseEvents")}</span>
                </Link>
              </MagneticButton>

              {/* Secondary CTA — glass/outline style */}
              <MagneticButton asChild strength={0.25}>
                <Link
                  href="/events#categories"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl glass-card text-white dark:text-white font-semibold text-base sm:text-lg border border-white/10 transition-all duration-300 hover:border-primary/30 hover:bg-white/5"
                >
                  <Compass className="h-5 w-5 shrink-0" />
                  <span>{t("exploreCategories")}</span>
                </Link>
              </MagneticButton>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Stats bar — animated counters ── */}
        <motion.div
          className="relative z-10 absolute bottom-20 inset-x-0 pb-6 sm:pb-8 md:pb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8, ease: CUBIC_PREMIUM }}
          style={{ opacity: contentOpacity }}
        >
          {upcomingCount !== undefined && upcomingCount > 0 && (
            <div className="flex items-center justify-center gap-8 sm:gap-12 md:gap-16">
              {/* Upcoming events stat */}
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
                  <AnimatedCounter target={upcomingCount} />
                </span>
                <span className="text-white/50 dark:text-white/50 text-xs sm:text-sm mt-1 tracking-wider uppercase">
                  {t("upcomingEventsCount")}
                </span>
              </div>

              {/* Divider */}
              <div className="w-px h-12 bg-white/10 hidden sm:block" />

              {/* Categories stat */}
              <div className="hidden sm:flex flex-col items-center">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white/90 dark:text-white/90">
                  <AnimatedCounter target={8} />
                </span>
                <span className="text-white/50 dark:text-white/50 text-xs sm:text-sm mt-1 tracking-wider uppercase">
                  {t("categoriesCount")}
                </span>
              </div>

              {/* Divider */}
              <div className="w-px h-12 bg-white/10 hidden sm:block" />

              {/* Venues stat */}
              <div className="hidden sm:flex flex-col items-center">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white/90 dark:text-white/90">
                  <AnimatedCounter target={3} />
                </span>
                <span className="text-white/50 dark:text-white/50 text-xs sm:text-sm mt-1 tracking-wider uppercase">
                  {t("venuesCount")}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Scroll indicator — bouncing arrow ── */}
        <motion.div
          className="relative z-10 absolute bottom-4 sm:bottom-6 inset-x-0 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
          style={{ opacity: contentOpacity }}
        >
          <motion.button
            type="button"
            className="flex flex-col items-center gap-1 cursor-pointer text-white/30 hover:text-white/60 transition-colors duration-300"
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            onClick={() => {
              window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
            }}
            aria-label={t("discoverMore")}
          >
            <span className="text-[10px] sm:text-xs tracking-widest uppercase">
              {t("discoverMore")}
            </span>
            <ChevronDown className="h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
