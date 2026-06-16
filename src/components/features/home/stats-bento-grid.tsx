"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { Calendar, Grid3X3, MapPin, Ticket, Building2, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Section3DBg } from "@/components/ui/section-3d-bg";

// ── Animation config — premium cubic-bezier ────────────────
const CUBIC_PREMIUM: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Types ────────────────────────────────────────────────────
interface StatsBentoGridProps {
  eventCount: number;
  categoryCount: number;
  venueCount: number;
  ticketCount: number;
  featuredCount: number;
}

interface StatCardConfig {
  icon: LucideIcon;
  labelKey: string;
  value: number | string;
  colSpan: 1 | 2;
  /** Suffix after the number (e.g. "+" for "150+") */
  suffix?: string;
}

// ── Stat Card Component ──────────────────────────────────────
function StatCard({
  config,
  index,
  isInView,
}: {
  config: StatCardConfig;
  index: number;
  isInView: boolean;
}) {
  const t = useTranslations("home");
  const Icon = config.icon;
  const isLarge = config.colSpan === 2;
  const isStringValue = typeof config.value === "string";

  return (
    <motion.div
      className={`relative group rounded-2xl overflow-hidden transition-all duration-300 bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${
        isLarge ? "md:col-span-2" : "md:col-span-1"
      }`}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: CUBIC_PREMIUM,
      }}
      whileHover={{
        y: -4,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
    >
      {/* Hover glow effect - Royal Gold */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.76 0.13 85 / 8%), transparent 70%)",
          filter: "blur(20px)",
          zIndex: 0,
        }}
      />

      {/* Card content */}
      <div
        className={`relative z-10 p-6 ${
          isLarge ? "flex items-center gap-5" : ""
        }`}
      >
        {/* Icon with Royal Gold gradient background */}
        <div
          className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110"
          style={{
            background: "linear-gradient(135deg, oklch(0.76 0.13 85), oklch(0.82 0.14 90))",
            boxShadow: "0 4px 14px oklch(0.76 0.13 85 / 25%)",
          }}
        >
          <Icon className="h-6 w-6 text-white drop-shadow-sm" />
        </div>

        {/* Text content */}
        <div className={isLarge ? "flex-1" : ""}>
          <p className={`font-bold text-foreground ${
            isLarge ? "text-4xl md:text-5xl" : "text-3xl"
          } mb-1`}>
            {isStringValue ? (
              config.value
            ) : (
              <AnimatedCounter target={config.value as number} suffix={config.suffix} />
            )}
          </p>
          <p className="text-muted-foreground text-sm font-medium">
            {t(config.labelKey as Parameters<typeof t>[0])}
          </p>
        </div>
      </div>

      {/* Subtle top-edge highlight */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
      />
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────
export function StatsBentoGrid({
  eventCount,
  categoryCount,
  venueCount,
  ticketCount,
  featuredCount,
}: StatsBentoGridProps) {
  const t = useTranslations("home");
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  // Stat cards configuration
  const statCards: StatCardConfig[] = [
    {
      icon: Calendar,
      labelKey: "statsUpcomingEvents",
      value: eventCount,
      colSpan: 2,
      suffix: "+",
    },
    {
      icon: Grid3X3,
      labelKey: "statsCategories",
      value: categoryCount,
      colSpan: 1,
      suffix: "+",
    },
    {
      icon: MapPin,
      labelKey: "statsVenues",
      value: venueCount,
      colSpan: 1,
      suffix: "+",
    },
    {
      icon: Ticket,
      labelKey: "statsTicketsAvailable",
      value: ticketCount,
      colSpan: 2,
      suffix: "+",
    },
    {
      icon: Building2,
      labelKey: "statsCity",
      value: t("statsCityValue" as Parameters<typeof t>[0]),
      colSpan: 1,
    },
    {
      icon: Star,
      labelKey: "statsFeatured",
      value: featuredCount,
      colSpan: 1,
      suffix: "+",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-28 overflow-hidden bg-background"
      aria-label={t("statsTitle")}
    >
      {/* ── Interactive 3D shapes background ── */}
      <Section3DBg theme="stats" />

      {/* ── Subtle decorative blobs ── */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        {/* Gold accent blob */}
        <div
          className="absolute -top-1/4 -start-1/4 w-[60vw] h-[60vw] rounded-full animate-morph-blob opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.76 0.13 85 / 12%) 0%, transparent 70%)",
          }}
        />

        {/* Secondary blob */}
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

      {/* ── Content ── */}
      <div className="relative z-10 container mx-auto px-4">
        {/* Section heading */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: CUBIC_PREMIUM }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            {t("statsTitle")}
          </h2>
          {/* Royal Gold accent line */}
          <div
            className="mx-auto w-16 h-1 rounded-full"
            style={{
              background: "linear-gradient(to right, oklch(0.76 0.13 85), oklch(0.82 0.14 90))",
            }}
          />
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mt-4">
            {t("statsSubtitle")}
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((card, index) => (
            <StatCard
              key={card.labelKey}
              config={card}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
