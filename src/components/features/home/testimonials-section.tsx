"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Section3DBg } from "@/components/ui/section-3d-bg";
import { Button } from "@/components/ui/button";
import { Quote, Star, Search, ArrowLeft, Sparkles } from "lucide-react";

// ── Animation config — premium cubic-bezier ────────────────
const CUBIC_PREMIUM: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Animation Variants ─────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: CUBIC_PREMIUM,
    },
  },
};

const ctaVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: CUBIC_PREMIUM,
    },
  },
};

// ── Star Rating Component ──────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-[oklch(0.76_0.13_85)] text-[oklch(0.76_0.13_85)]"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

// ── Testimonial Card ──────────────────────────────
interface TestimonialData {
  id: number;
  textKey: string;
  authorKey: string;
  roleKey: string;
  rating: number;
}

function TestimonialCard({
  testimonial,
}: {
  testimonial: TestimonialData;
}) {
  const t = useTranslations("home");
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  // Map scroll progress to subtle 3D rotation
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -4]);
  const rotateZ = useTransform(scrollYProgress, [0, 0.5, 1], [-2, 0, 1]);

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        rotateX,
        rotateZ,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className="group relative rounded-2xl p-6 transition-shadow duration-300"
    >
      {/* Card background — theme-aware */}
      <div className="absolute inset-0 rounded-2xl bg-card border border-border/50" />

      {/* Decorative Quote Icon (faded Royal Gold) */}
      <Quote
        className="absolute top-4 end-4 h-10 w-10 transition-colors duration-300 text-primary/[0.05]"
      />
      {/* Hover state for quote icon */}
      <Quote
        className="absolute top-4 end-4 h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary/10"
      />

      {/* Content */}
      <div className="relative space-y-4">
        {/* Star Rating */}
        <StarRating rating={testimonial.rating} />

        {/* Testimonial Text */}
        <p className="leading-relaxed text-sm md:text-base text-foreground/85">
          &ldquo;{t(testimonial.textKey as Parameters<typeof t>[0])}&rdquo;
        </p>

        {/* Author Info */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/30">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
            style={{
              background: "linear-gradient(to bottom right, oklch(0.76 0.13 85), oklch(0.82 0.14 90))",
              color: "oklch(0.25 0.05 85)",
            }}
          >
            {t(testimonial.authorKey as Parameters<typeof t>[0]).charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              {t(testimonial.authorKey as Parameters<typeof t>[0])}
            </p>
            <p className="text-xs text-muted-foreground">
              {t(testimonial.roleKey as Parameters<typeof t>[0])}
            </p>
          </div>
        </div>
      </div>

      {/* Hover glow effect — Royal Gold */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.76 0.13 85 / 8%), transparent 60%)",
          inset: "-2px",
          borderRadius: "1rem",
          filter: "blur(16px)",
        }}
      />
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────
export function TestimonialsSection() {
  const t = useTranslations("home");

  const testimonials: TestimonialData[] = [
    {
      id: 1,
      textKey: "testimonial1Text",
      authorKey: "testimonial1Author",
      roleKey: "testimonial1Role",
      rating: 5,
    },
    {
      id: 2,
      textKey: "testimonial2Text",
      authorKey: "testimonial2Author",
      roleKey: "testimonial2Role",
      rating: 5,
    },
    {
      id: 3,
      textKey: "testimonial3Text",
      authorKey: "testimonial3Author",
      roleKey: "testimonial3Role",
      rating: 5,
    },
  ];

  return (
    <section className="relative py-20 bg-background overflow-hidden" aria-label="Testimonials">
      {/* ── Interactive 3D shapes background ── */}
      <Section3DBg theme="testimonials" />

      <div className="relative z-10 container mx-auto px-4">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: CUBIC_PREMIUM }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full premium-glass text-xs font-medium text-muted-foreground tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t("testimonialsTitle")}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold gradient-text">
            {t("testimonialsTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-base">
            {t("testimonialsSubtitle")}
          </p>
        </motion.div>

        {/* ── Testimonial Cards Grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
            />
          ))}
        </motion.div>

        {/* ── CTA Section ── */}
        <motion.div
          variants={ctaVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="relative overflow-hidden rounded-3xl px-6 py-14 md:px-12 md:py-20 text-center bg-card border border-border/50">
            {/* Decorative background */}
            <div
              aria-hidden="true"
              className="absolute -top-1/4 -start-1/4 w-[60%] h-[60%] rounded-full animate-mesh-move opacity-20 z-0"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.76 0.13 85 / 15%) 0%, transparent 70%)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-1/4 -end-1/4 w-[50%] h-[50%] rounded-full animate-mesh-move opacity-15 z-0"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.76 0.13 85 / 10%) 0%, transparent 70%)",
                animationDelay: "-7s",
                animationDuration: "25s",
              }}
            />

            {/* CTA Content */}
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-muted/50 backdrop-blur-sm text-xs font-medium text-muted-foreground tracking-wide">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {t("ctaTitle")}
              </div>

              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight max-w-2xl mx-auto">
                {t("ctaTitle")}
              </h3>

              <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg leading-relaxed">
                {t("ctaSubtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
                {/* Primary CTA */}
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    size="lg"
                    asChild
                    className="relative h-12 px-8 text-base font-semibold rounded-xl border-0 transition-all duration-300"
                    style={{
                      background: "oklch(0.76 0.13 85)",
                      color: "oklch(0.25 0.05 85)",
                      boxShadow: "0 10px 25px oklch(0.76 0.13 85 / 25%)",
                    }}
                  >
                    <Link href="/events">
                      <Search className="h-5 w-5 me-2" />
                      {t("ctaBrowse")}
                    </Link>
                  </Button>
                </motion.div>

                {/* Secondary CTA */}
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    size="lg"
                    asChild
                    variant="outline"
                    className="h-12 px-8 text-base font-semibold rounded-xl transition-all duration-300"
                  >
                    <Link href="/register">
                      <ArrowLeft className="h-5 w-5 me-2" />
                      {t("ctaRegister")}
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
