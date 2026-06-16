"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useSafeAuth } from "@/hooks/use-safe-auth";
import { NavbarUserButton } from "@/components/features/auth/user-button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Menu,
  Calendar,
  LayoutDashboard,
  TicketCheck,
  Search,
  Sun,
  Moon,
} from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Button } from "@/components/ui/button";
import { Navbar3DBg } from "@/components/ui/navbar-3d-bg";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/* ──────────────────────────────────────────────
   Helpers for hydration-safe client detection
   ────────────────────────────────────────────── */

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/* ──────────────────────────────────────────────
   Nav link data
   ────────────────────────────────────────────── */

interface NavLink {
  href: string;
  labelKey: string;
  icon: React.ElementType;
  authOnly: boolean;
}

const NAV_LINKS: NavLink[] = [
  { href: "/events", labelKey: "events", icon: Search, authOnly: false },
  { href: "/bookings", labelKey: "bookings", icon: TicketCheck, authOnly: true },
  { href: "/profile", labelKey: "profile", icon: Calendar, authOnly: true },
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, authOnly: true },
];

/* ──────────────────────────────────────────────
   Desktop nav link with gold underline animation
   ────────────────────────────────────────────── */

function DesktopNavLink({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center gap-1.5 px-1 py-1.5 text-sm font-medium transition-colors duration-300"
    >
      <Icon className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
      <span
        className={
          isActive
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground"
        }
      >
        {label}
      </span>
      {/* Gold underline — slides in from center on hover, always visible when active */}
      <span
        className={`absolute bottom-0 start-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 transition-all duration-300 ease-out ${
          isActive ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  );
}

/* ──────────────────────────────────────────────
   Mobile nav link with stagger animation
   ────────────────────────────────────────────── */

const mobileItemVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.08 * i + 0.15,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
  exit: { opacity: 0, x: 24, transition: { duration: 0.2 } },
};

function MobileNavLink({
  href,
  label,
  icon: Icon,
  isActive,
  index,
  onClose,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  index: number;
  onClose: () => void;
}) {
  return (
    <motion.div
      custom={index}
      variants={mobileItemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Link
        href={href}
        onClick={onClose}
        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
        {isActive && (
          <span className="ms-auto h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </Link>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Theme toggle button
   ────────────────────────────────────────────── */

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const t = useTranslations("nav");

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={t("toggleTheme")}>
        <Sun className="h-4 w-4 opacity-50" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 relative overflow-hidden"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={t("toggleTheme")}
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === "dark" ? 0 : 1,
          rotate: theme === "dark" ? 90 : 0,
          opacity: theme === "dark" ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sun className="h-4 w-4" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: theme === "light" ? 0 : 1,
          rotate: theme === "light" ? -90 : 0,
          opacity: theme === "light" ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon className="h-4 w-4" />
      </motion.div>
    </Button>
  );
}

/* ──────────────────────────────────────────────
   Main Navbar Component
   ────────────────────────────────────────────── */

export function Navbar() {
  const { isLoaded, isSignedIn } = useSafeAuth();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Filter links based on auth
  const visibleLinks = NAV_LINKS.filter((link) => !link.authOnly || isSignedIn);

  // Check if a link is active
  const isActive = useCallback(
    (href: string) => {
      if (href === "/events") {
        return pathname === "/events" || pathname.startsWith("/events/");
      }
      return pathname === href || pathname.startsWith(href + "/");
    },
    [pathname]
  );

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ease-out ${
        scrolled
          ? "h-18 bg-background/70 backdrop-blur-xl border-b border-border shadow-[0_1px_12px_oklch(0.15_0.03_260/6%)]"
          : "h-18 bg-transparent border-b border-transparent"
      }`}
    >
      {/* ── 3D Gradient Mesh Background (visible when scrolled) ── */}
      <Navbar3DBg isScrolled={scrolled} />

      <div className="relative z-10 container mx-auto flex h-full items-center justify-between px-4 lg:px-6">
        {/* ── Logo ── */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 shrink-0"
        >
          <motion.div
            whileHover={{ rotate: 12, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="flex items-center justify-center"
          >
            <Calendar className="h-6 w-6 text-primary" />
          </motion.div>
          <span className="gradient-text text-xl font-bold tracking-tight">
            {tCommon("appName")}
          </span>
        </Link>

        {/* ── Desktop Navigation ── */}
        <nav className="hidden lg:flex items-center gap-1">
          {visibleLinks.map((link) => (
            <DesktopNavLink
              key={link.href}
              href={link.href}
              label={t(link.labelKey)}
              icon={link.icon}
              isActive={isActive(link.href)}
            />
          ))}
        </nav>

        {/* ── Desktop Right Section ── */}
        <div className="hidden lg:flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />

          {/* Auth state */}
          {!isLoaded && (
            <div className="h-9 w-28 animate-pulse rounded-md bg-muted/50" />
          )}
          {isLoaded && !isSignedIn && (
            <>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/login">
                  {t("login")}
                </Link>
              </Button>
              <MagneticButton asChild strength={0.25} className="glow-gold inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-8 px-3 text-sm font-medium transition-all">
                <Link href="/register">
                  {t("register")}
                </Link>
              </MagneticButton>
            </>
          )}
          {isLoaded && isSignedIn && <NavbarUserButton />}
        </div>

        {/* ── Mobile Right Section ── */}
        <div className="flex lg:hidden items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 touch-target"
            onClick={() => setMobileOpen(true)}
            aria-label={t("openMenu")}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* ── Mobile Sheet Menu ── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="right"
          className="w-[300px] sm:w-[340px] bg-[oklch(0.15_0.03_260/95%)] backdrop-blur-2xl border-s-white/10 p-0"
        >
          <SheetHeader className="ps-6 pe-6 pt-6 pb-2">
            <SheetTitle className="flex items-center gap-2.5">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="gradient-text text-lg font-bold">{tCommon("appName")}</span>
            </SheetTitle>
          </SheetHeader>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <AnimatePresence mode="wait">
              <motion.nav className="space-y-1">
                {visibleLinks.map((link, i) => (
                  <MobileNavLink
                    key={link.href}
                    href={link.href}
                    label={t(link.labelKey)}
                    icon={link.icon}
                    isActive={isActive(link.href)}
                    index={i}
                    onClose={closeMobile}
                  />
                ))}
              </motion.nav>
            </AnimatePresence>

            {/* Divider */}
            <div className="my-4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            {/* Language Switcher */}
            <motion.div
              custom={visibleLinks.length}
              variants={mobileItemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="px-1"
            >
              <LanguageSwitcher />
            </motion.div>

            {/* Auth Section */}
            <motion.div
              custom={visibleLinks.length + 1}
              variants={mobileItemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-4 space-y-2 px-1"
            >
              {!isLoaded && (
                <div className="h-9 w-full animate-pulse rounded-md bg-muted/50" />
              )}
              {isLoaded && !isSignedIn && (
                <>
                  <Button variant="ghost" size="sm" className="w-full justify-center" asChild>
                    <Link href="/login" onClick={closeMobile}>
                      {t("login")}
                    </Link>
                  </Button>
                  <MagneticButton asChild strength={0.2} className="glow-gold inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 text-sm font-medium transition-all">
                    <Link href="/register" onClick={closeMobile}>
                      {t("register")}
                    </Link>
                  </MagneticButton>
                </>
              )}
              {isLoaded && isSignedIn && (
                <div className="flex items-center gap-3 px-3 py-2">
                  <NavbarUserButton />
                </div>
              )}
            </motion.div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
