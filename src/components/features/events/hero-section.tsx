"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ParallaxVideo } from "@/components/ui/parallax-video";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Search, Compass, ChevronDown, Sparkles } from "lucide-react";

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
   Hero Section — Premium world-class design
   with interactive 3D video background
   ────────────────────────────────────────────── */

interface HeroSectionProps {
  upcomingCount?: number;
}

export function HeroSection({ upcomingCount }: HeroSectionProps) {
  const t = useTranslations("home");

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex flex-col overflow-hidden">
      {/* ── Interactive video background with 3D tilt + parallax + light ── */}
      <ParallaxVideo
        src="/videos/hero-bg.mp4"
        overlayOpacity={0.25}
        speed={0.06}
        tiltEffect={true}
        lightEffect={true}
        scrollParallax={true}
        className="absolute inset-0 z-0"
      />

      {/* ── Gradient overlay: transparent in center for video visibility, darker at edges for text readability ── */}
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
        {[
          { x: "10%", y: "20%", size: 3, delay: 0 },
          { x: "85%", y: "35%", size: 2, delay: 0.5 },
          { x: "70%", y: "70%", size: 4, delay: 1.2 },
          { x: "25%", y: "80%", size: 2, delay: 0.8 },
          { x: "50%", y: "15%", size: 3, delay: 1.5 },
          { x: "92%", y: "60%", size: 2, delay: 0.3 },
          { x: "15%", y: "55%", size: 3, delay: 2.0 },
        ].map((dot, i) => (
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

      {/* ── Main hero content — staggered entrance ── */}
      <motion.div
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center"
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
        className="relative z-10 pb-6 sm:pb-8 md:pb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8, ease: CUBIC_PREMIUM }}
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
        className="relative z-10 flex justify-center pb-4 sm:pb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
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
    </section>
  );
}
