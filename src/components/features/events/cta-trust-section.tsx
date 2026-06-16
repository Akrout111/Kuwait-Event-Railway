"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Section3DBg } from "@/components/ui/section-3d-bg";
import { AnimatedSection } from "@/components/ui/animated-section";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Zap,
  Star,
  ArrowLeft,
  MapPin,
  Calendar,
  Tag,
} from "lucide-react";

/* ──────────────────────────────────────────────
   Animation config — premium cubic-bezier
   ────────────────────────────────────────────── */

const CUBIC_PREMIUM: [number, number, number, number] = [0.22, 1, 0.36, 1];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: CUBIC_PREMIUM,
    },
  },
};

/* ──────────────────────────────────────────────
   Feature card data
   ────────────────────────────────────────────── */

interface FeatureItem {
  icon: React.ElementType;
  emoji: string;
  titleKey: string;
  descKey: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: ShieldCheck,
    emoji: "🎫",
    titleKey: "ctaSecureTitle",
    descKey: "ctaSecureDesc",
  },
  {
    icon: Zap,
    emoji: "⚡",
    titleKey: "ctaFastTitle",
    descKey: "ctaFastDesc",
  },
  {
    icon: Star,
    emoji: "🌟",
    titleKey: "ctaBestTitle",
    descKey: "ctaBestDesc",
  },
];

/* ──────────────────────────────────────────────
   CTA/Trust Section — "Why Kuwait Events?"
   Uses 3D floating shapes instead of video
   ────────────────────────────────────────────── */

interface CTATrustSectionProps {
  upcomingCount?: number;
  categoriesCount?: number;
  venuesCount?: number;
}

export function CTATrustSection({
  upcomingCount = 0,
  categoriesCount = 0,
  venuesCount = 0,
}: CTATrustSectionProps) {
  const t = useTranslations("home");

  return (
    <section className="relative py-20 sm:py-28 md:py-32 overflow-hidden">
      {/* ── Interactive 3D shapes background (replaces video) ── */}
      <Section3DBg theme="cta" />

      {/* ── Decorative gradient blobs ── */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-1/4 -start-1/4 w-[60vw] h-[60vw] rounded-full animate-morph-blob opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.76 0.13 85 / 10%) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-1/4 -end-1/4 w-[50vw] h-[50vw] rounded-full animate-morph-blob opacity-8"
          style={{
            background:
              "radial-gradient(circle, oklch(0.76 0.13 85 / 8%) 0%, transparent 70%)",
            animationDelay: "-3s",
            animationDuration: "12s",
          }}
        />
      </div>

      {/* ── Gold accent line at top ── */}
      <div
        className="absolute top-0 inset-x-0 h-px z-[2]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, oklch(0.76 0.13 85 / 40%) 30%, oklch(0.76 0.13 85 / 60%) 50%, oklch(0.76 0.13 85 / 40%) 70%, transparent 100%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <AnimatedSection direction="up" className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text leading-tight">
            {t("ctaTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            {t("ctaSubtitle")}
          </p>
        </AnimatedSection>

        {/* Feature cards — staggered reveal */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.titleKey}
                variants={cardVariant}
                className="rounded-2xl p-6 sm:p-8 text-center group transition-all duration-500 bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Gold icon / emoji */}
                <div className="flex justify-center mb-5">
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 transition-all duration-500 group-hover:bg-primary/20 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/10">
                    <span className="text-2xl sm:text-3xl">{feature.emoji}</span>
                    <Icon className="absolute -bottom-1 -end-1 h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                  {t(feature.titleKey)}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA button */}
        <AnimatedSection direction="up" delay={0.3} className="text-center mb-14 sm:mb-18">
          <MagneticButton asChild strength={0.25}>
            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base sm:text-lg glow-gold transition-all duration-300 hover:brightness-110 hover:glow-gold-lg"
            >
              <span>{t("ctaButton")}</span>
              <ArrowLeft className="h-5 w-5 shrink-0 -scale-x-100" />
            </Link>
          </MagneticButton>
        </AnimatedSection>

        {/* Stats row */}
        <AnimatedSection direction="up" delay={0.4}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 md:gap-20">
            {/* Upcoming events */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-5 w-5 text-primary/70" />
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
                  {upcomingCount > 0 ? (
                    <AnimatedCounter target={upcomingCount} />
                  ) : (
                    "0"
                  )}
                </span>
              </div>
              <span className="text-muted-foreground text-xs sm:text-sm tracking-wider uppercase">
                {t("upcomingEventsCount")}
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-12 bg-border hidden sm:block" />

            {/* Categories */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="h-5 w-5 text-primary/70" />
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
                  {categoriesCount > 0 ? (
                    <AnimatedCounter target={categoriesCount} />
                  ) : (
                    "0"
                  )}
                </span>
              </div>
              <span className="text-muted-foreground text-xs sm:text-sm tracking-wider uppercase">
                {t("categoriesCount")}
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-12 bg-border hidden sm:block" />

            {/* Venues */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-5 w-5 text-primary/70" />
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">
                  {venuesCount > 0 ? (
                    <AnimatedCounter target={venuesCount} />
                  ) : (
                    "0"
                  )}
                </span>
              </div>
              <span className="text-muted-foreground text-xs sm:text-sm tracking-wider uppercase">
                {t("venuesCount")}
              </span>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* ── Gold accent line at bottom ── */}
      <div
        className="absolute bottom-0 inset-x-0 h-px z-[2]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, oklch(0.76 0.13 85 / 30%) 30%, oklch(0.76 0.13 85 / 50%) 50%, oklch(0.76 0.13 85 / 30%) 70%, transparent 100%)",
        }}
      />
    </section>
  );
}
