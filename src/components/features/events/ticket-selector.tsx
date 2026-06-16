"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/ui/animated-section";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { formatKWD } from "@/lib/utils";
import { formatLocalizedNumber } from "@/lib/format-number";
import { Minus, Plus, Ticket, Sparkles, Bird, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TicketTier {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  type: string;
  price: string;
  quantityTotal: number;
  quantitySold: number;
  quantityAvailable: number;
  maxPerBooking: number;
}

interface TicketSelectorProps {
  ticketTiers: TicketTier[];
  onSelectionChange: (selection: { ticketTierId: string; quantity: number }[], total: number) => void;
}

const PREMIUM_CUBIC = [0.22, 1, 0.36, 1] as const;

function getTypeBadge(type: string, t: (key: string) => string) {
  switch (type) {
    case "VIP":
      return (
        <Badge className="bg-primary/15 text-primary border-primary/25 hover:bg-primary/20 gap-1">
          <Sparkles className="h-3 w-3" />
          {t("vip")}
        </Badge>
      );
    case "EARLY_BIRD":
      return (
        <Badge className="bg-primary/15 text-primary border-primary/25 hover:bg-primary/20 gap-1">
          <Bird className="h-3 w-3" />
          {t("earlyBird")}
        </Badge>
      );
    case "GROUP":
      return (
        <Badge className="bg-primary/15 text-primary border-primary/25 hover:bg-primary/20 gap-1">
          <Users className="h-3 w-3" />
          {t("group")}
        </Badge>
      );
    default:
      return null;
  }
}

export function TicketSelector({ ticketTiers, onSelectionChange }: TicketSelectorProps) {
  const t = useTranslations("tickets");
  const locale = useLocale();
  const prefersReducedMotion = useReducedMotion();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { selection, totalAmount } = useMemo(() => {
    const sel: { ticketTierId: string; quantity: number }[] = [];
    let total = 0;
    for (const [tierId, qty] of Object.entries(quantities)) {
      if (qty > 0) {
        sel.push({ ticketTierId: tierId, quantity: qty });
        const tier = ticketTiers.find((t) => t.id === tierId);
        if (tier) total += parseFloat(tier.price) * qty;
      }
    }
    return { selection: sel, totalAmount: total };
  }, [quantities, ticketTiers]);

  // Fix: Use useEffect instead of useMemo for side effect
  useEffect(() => {
    onSelectionChange(selection, totalAmount);
  }, [selection, totalAmount, onSelectionChange]);

  const updateQuantity = (tierId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[tierId] ?? 0;
      const tier = ticketTiers.find((t) => t.id === tierId);
      if (!tier) return prev;
      const newQty = Math.max(0, Math.min(current + delta, tier.maxPerBooking, tier.quantityAvailable));
      return { ...prev, [tierId]: newQty };
    });
  };

  const totalTickets = Object.values(quantities).reduce((sum, q) => sum + q, 0);

  if (ticketTiers.length === 0) {
    return (
      <AnimatedSection direction="up" delay={0.1}>
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-4">
            <Ticket className="h-7 w-7 text-primary" />
          </div>
          <p className="text-muted-foreground">{t("noTickets")}</p>
        </div>
      </AnimatedSection>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatedSection direction="up" delay={0.1}>
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          {t("selectTickets")}
        </h3>
      </AnimatedSection>

      {ticketTiers.map((tier, index) => {
        const qty = quantities[tier.id] ?? 0;
        const isSoldOut = tier.quantityAvailable <= 0;
        const isSelected = qty > 0;
        const typeBadge = getTypeBadge(tier.type, t);

        return (
          <AnimatedSection key={tier.id} direction="up" delay={0.15 + index * 0.08}>
            <motion.div
              layout={!prefersReducedMotion}
              className={`glass-card rounded-xl p-4 sm:p-5 transition-all duration-300 ${
                isSoldOut
                  ? "opacity-40"
                  : isSelected
                    ? "border-primary/50 bg-primary/5 glow-gold"
                    : "hover:border-primary/20"
              }`}
              style={{ transitionTimingFunction: `cubic-bezier(${PREMIUM_CUBIC.join(",")})` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Tier name + type badge */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-base">{locale === "ar" ? tier.nameAr : (tier.nameEn || tier.nameAr)}</span>
                    {typeBadge}
                    {isSoldOut && (
                      <Badge variant="destructive" className="text-[10px]">
                        {t("soldOut")}
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="price-gold text-xl font-bold mb-1.5">
                    {tier.price === "0.000" ? t("free") : formatKWD(tier.price, locale)}
                  </div>

                  {/* Availability info */}
                  {!isSoldOut && (
                    <div className="text-xs text-muted-foreground">
                      <span>
                        {t("available")} {formatLocalizedNumber(tier.quantityAvailable, locale)}{" "}
                        {tier.quantityAvailable === 1 ? t("ticket") : t("tickets")}
                      </span>
                      {tier.maxPerBooking < 10 && (
                        <span className="ms-1">
                          • {t("maxPerBooking")} {formatLocalizedNumber(tier.maxPerBooking, locale)} {t("perBooking")}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Quantity controls */}
                {!isSoldOut && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:hover:scale-100"
                      onClick={() => updateQuantity(tier.id, -1)}
                      disabled={qty <= 0}
                      aria-label={t("decreaseQuantity")}
                      style={{ transitionTimingFunction: `cubic-bezier(${PREMIUM_CUBIC.join(",")})` }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={qty}
                        initial={prefersReducedMotion ? false : { scale: 1.3, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={prefersReducedMotion ? undefined : { scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="w-9 text-center font-bold text-base tabular-nums"
                      >
                        {formatLocalizedNumber(qty, locale)}
                      </motion.span>
                    </AnimatePresence>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full border-border/50 hover:border-primary/50 hover:bg-primary/10 hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:hover:scale-100"
                      onClick={() => updateQuantity(tier.id, 1)}
                      disabled={qty >= tier.maxPerBooking || qty >= tier.quantityAvailable}
                      aria-label={t("increaseQuantity")}
                      style={{ transitionTimingFunction: `cubic-bezier(${PREMIUM_CUBIC.join(",")})` }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatedSection>
        );
      })}

      {/* Total section */}
      {totalTickets > 0 && (
        <AnimatedSection direction="up" delay={0.15 + ticketTiers.length * 0.08}>
          <div
            className="rounded-xl p-4 sm:p-5 mt-2 border border-primary/30"
            style={{
              background: `linear-gradient(135deg, oklch(0.76 0.13 85 / 0.08) 0%, oklch(0.15 0.03 260 / 0.05) 100%)`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-muted-foreground">{t("total")}</span>
                <div className="text-sm mt-0.5">
                  {formatLocalizedNumber(totalTickets, locale)} {totalTickets === 1 ? t("ticket") : t("tickets")}
                </div>
              </div>
              <div className="price-gold text-2xl font-bold">
                {formatKWD(totalAmount, locale)}
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}
