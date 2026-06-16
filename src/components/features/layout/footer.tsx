"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { Section3DBg } from "@/components/ui/section-3d-bg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  ArrowUp,
} from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const subscribedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (subscribedTimeoutRef.current) clearTimeout(subscribedTimeoutRef.current);
    };
  }, []);

  const handleNewsletterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      if (subscribedTimeoutRef.current) clearTimeout(subscribedTimeoutRef.current);
      subscribedTimeoutRef.current = setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter / X" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  const quickLinks = [
    { label: t("about"), href: "/about" },
    { label: t("contact"), href: "/contact" },
    { label: t("careers"), href: "/careers" },
  ];

  const legalLinks = [
    { label: t("terms"), href: "/terms" },
    { label: t("privacy"), href: "/privacy" },
    { label: t("cookiePolicy"), href: "/cookie-policy" },
  ];

  return (
    <footer className="relative mt-auto overflow-hidden bg-card border-t border-border/50">
      {/* ── Interactive 3D shapes background ── */}
      <Section3DBg theme="footer" />

      {/* Main Footer Content */}
      <div className="relative z-20">
        {/* Gold accent line at top */}
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, oklch(0.76 0.13 85 / 40%) 20%, oklch(0.82 0.14 90 / 60%) 50%, oklch(0.76 0.13 85 / 40%) 80%, transparent 100%)",
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 gap-10 py-12 sm:py-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* ─── Brand Section ─── */}
            <div className="space-y-5 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <span className="gradient-text text-xl font-bold tracking-tight">
                  {tCommon("appName")}
                </span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {t("description")}
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-primary/15 bg-primary/5 transition-all duration-300 hover:border-primary/40 hover:bg-primary/15 hover:text-primary hover:-translate-y-0.5 hover:shadow-[0_0_16px_oklch(0.76_0.13_85/20%)]"
                  >
                    <Icon className="h-4 w-4 text-foreground/70 transition-colors duration-300 group-hover:text-primary" />
                  </a>
                ))}
              </div>
            </div>

            {/* ─── Quick Links ─── */}
            <div className="space-y-5">
              <h3 className="gold-underline inline-block text-sm font-semibold uppercase tracking-wider text-foreground">
                {t("quickLinks")}
              </h3>
              <nav className="flex flex-col gap-3">
                {quickLinks.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex items-center gap-2 text-sm text-muted-foreground transition-all duration-300 hover:text-primary hover:ps-1"
                  >
                    <span
                      className="inline-block h-px w-0 bg-primary transition-all duration-300 group-hover:w-4"
                      aria-hidden="true"
                    />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* ─── Legal ─── */}
            <div className="space-y-5">
              <h3 className="gold-underline inline-block text-sm font-semibold uppercase tracking-wider text-foreground">
                {t("legal")}
              </h3>
              <nav className="flex flex-col gap-3">
                {legalLinks.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex items-center gap-2 text-sm text-muted-foreground transition-all duration-300 hover:text-primary hover:ps-1"
                  >
                    <span
                      className="inline-block h-px w-0 bg-primary transition-all duration-300 group-hover:w-4"
                      aria-hidden="true"
                    />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* ─── Newsletter ─── */}
            <div className="space-y-5">
              <h3 className="gold-underline inline-block text-sm font-semibold uppercase tracking-wider text-foreground">
                {t("newsletter")}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("newsletterDesc")}
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("newsletterPlaceholder")}
                    className="h-11 ps-10 pe-3 bg-muted/20 border-border/50 placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30 transition-all duration-300"
                    dir="ltr"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_24px_oklch(0.76_0.13_85/30%)]"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.76 0.13 85), oklch(0.70 0.11 75), oklch(0.76 0.13 85))",
                  }}
                >
                  {subscribed ? t("subscribed") : t("subscribe")}
                </Button>
              </form>
            </div>
          </div>

          {/* ─── Bottom Bar ─── */}
          <div className="pb-6 pt-4">
            {/* Gold divider */}
            <div
              className="mb-6 h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, oklch(0.76 0.13 85 / 25%) 15%, oklch(0.76 0.13 85 / 50%) 50%, oklch(0.76 0.13 85 / 25%) 85%, transparent 100%)",
              }}
            />

            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-xs text-muted-foreground/80">
                © {new Date().getFullYear()}{" "}
                <span className="text-primary/80 font-medium">{tCommon("appName")}</span>{" "}
                — {t("rights")}
              </p>

              {/* Back to top */}
              <button
                onClick={scrollToTop}
                aria-label={t("backToTop")}
                className="group flex items-center gap-2 text-xs text-muted-foreground/60 transition-colors duration-300 hover:text-primary"
              >
                <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                <span>{t("backToTop")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
