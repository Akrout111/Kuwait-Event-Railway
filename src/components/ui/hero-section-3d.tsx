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
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ThreeHeroBg } from "@/components/ui/three-hero-bg";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Search, Compass, ChevronDown, Sparkles } from "lucide-react";

/* ──────────────────────────────────────────────
   Reduced-motion detection hook
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
   HeroSection3D — Interactive 3D Hero with Canvas
   Replaces ScrollVideoHero with pure 3D scene.
   ────────────────────────────────────────────── */

interface HeroSection3DProps {
  /** Number of upcoming events for stats display */
  upcomingCount?: number;
}

export function HeroSection3D({ upcomingCount }: HeroSection3DProps) {
  const t = useTranslations("home");

  /* ── Refs ── */
  const containerRef = useRef<HTMLElement>(null);

  /* ── Accessibility ── */
  const prefersReducedMotion = usePrefersReducedMotion();

  /* ── Scroll tracking ── */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  /* ── Content parallax transforms ── */
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);

  /* ── Mouse position for 3D scene ── */
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;
      mouseX.set(nx);
      mouseY.set(ny);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  /* ── Scroll progress for 3D scene ── */
  const [scrollProgress, setScrollProgress] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollProgress(latest);
  });

  /* ── Fallback gradient ── */
  const fallbackGradient =
    "linear-gradient(to bottom, oklch(0.15 0.03 260) 0%, oklch(0.12 0.04 260) 50%, oklch(0.10 0.02 260) 100%)";

  return (
    <section
      ref={containerRef}
      className="relative min-h-[200vh] overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, oklch(0.12 0.04 260) 0%, oklch(0.10 0.03 260) 50%, oklch(0.15 0.03 260) 100%)",
      }}
    >
      {/* ── Sticky container that stays in view while scrolling ── */}
      <div
        className="sticky top-0 h-screen overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* ── 3D Three.js Background ── */}
        <ThreeHeroBg
          scrollProgress={scrollProgress}
          mouseX={mouseX.get()}
          mouseY={mouseY.get()}
        />

        {/* ── Fallback: gradient on reduced motion ── */}
        {prefersReducedMotion && (
          <div
            className="absolute inset-0"
            style={{ background: fallbackGradient }}
          />
        )}

        {/* ── Gradient overlay: darker at top/bottom ── */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, oklch(0.12 0.04 260 / 65%) 0%, oklch(0.12 0.04 260 / 10%) 30%, oklch(0.12 0.04 260 / 5%) 60%, oklch(0.12 0.04 260 / 55%) 100%)",
          }}
        />

        {/* ── Subtle grain texture ── */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
          }}
        />

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

            {/* CTA buttons */}
            <motion.div
              variants={fadeSlideUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <MagneticButton asChild strength={0.25}>
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base sm:text-lg glow-gold transition-all duration-300 hover:brightness-110"
                >
                  <Search className="h-5 w-5 shrink-0" />
                  <span>{t("browseEvents")}</span>
                </Link>
              </MagneticButton>

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

        {/* ── Stats bar ── */}
        <motion.div
          className="relative z-10 absolute bottom-20 inset-x-0 pb-6 sm:pb-8 md:pb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8, ease: CUBIC_PREMIUM }}
          style={{ opacity: contentOpacity }}
        >
          {upcomingCount !== undefined && upcomingCount > 0 && (
            <div className="flex items-center justify-center gap-8 sm:gap-12 md:gap-16">
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
                  <AnimatedCounter target={upcomingCount} />
                </span>
                <span className="text-white/50 dark:text-white/50 text-xs sm:text-sm mt-1 tracking-wider uppercase">
                  {t("upcomingEventsCount")}
                </span>
              </div>

              <div className="w-px h-12 bg-white/10 hidden sm:block" />

              <div className="hidden sm:flex flex-col items-center">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white/90 dark:text-white/90">
                  <AnimatedCounter target={8} />
                </span>
                <span className="text-white/50 dark:text-white/50 text-xs sm:text-sm mt-1 tracking-wider uppercase">
                  {t("categoriesCount")}
                </span>
              </div>

              <div className="w-px h-12 bg-white/10 hidden sm:block" />

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

        {/* ── Scroll indicator ── */}
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
