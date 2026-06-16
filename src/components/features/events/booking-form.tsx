"use client";

import { useState, useCallback } from "react";
import { useSafeAuth } from "@/hooks/use-safe-auth";
import { useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { TicketSelector } from "./ticket-selector";
import { useCreateBooking } from "@/hooks/use-booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatKWD } from "@/lib/utils";
import { Loader2, AlertCircle, LogIn } from "lucide-react";
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

interface BookingFormProps {
  eventId: string;
  ticketTiers: TicketTier[];
}

export function BookingForm({ eventId, ticketTiers }: BookingFormProps) {
  const { isSignedIn, isLoaded } = useSafeAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("booking");
  const createBooking = useCreateBooking();

  const [ticketSelection, setTicketSelection] = useState<
    { ticketTierId: string; quantity: number }[]
  >([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeePhone, setAttendeePhone] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSelectionChange = useCallback(
    (selection: { ticketTierId: string; quantity: number }[], total: number) => {
      setTicketSelection(selection);
      setTotalAmount(total);
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/login");
      return;
    }

    if (ticketSelection.length === 0) {
      setError(t("mustSelectOne"));
      return;
    }

    if (!attendeeName.trim() || !attendeePhone.trim() || !attendeeEmail.trim()) {
      setError(t("fillAllFields"));
      return;
    }

    try {
      const result = await createBooking.mutateAsync({
        eventId,
        attendeeName: attendeeName.trim(),
        attendeePhone: attendeePhone.trim(),
        attendeeEmail: attendeeEmail.trim(),
        tickets: ticketSelection,
      });

      if (result.data?.booking?.id) {
        try {
          const paymentRes = await fetch("/api/v1/payments/initiate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId: result.data.booking.id, method: "KNET" }),
          });
          const paymentData = await paymentRes.json();

          if (paymentData.data?.redirectUrl) {
            window.location.href = paymentData.data.redirectUrl;
          } else {
            router.push(`/bookings/${result.data.booking.id}?pending=true`);
          }
        } catch {
          router.push(`/bookings/${result.data.booking.id}?pending=true`);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("bookingError");
      setError(message);
    }
  };

  const isFree =
    totalAmount === 0 &&
    ticketSelection.length > 0 &&
    ticketTiers.every((t) => t.price === "0.000");

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Section Title */}
      <h2 className="text-xl font-bold mb-4 gradient-text">{t("selectTickets")}</h2>

      <TicketSelector ticketTiers={ticketTiers} onSelectionChange={handleSelectionChange} />

      {(totalAmount > 0 || isFree) && ticketSelection.length > 0 && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="border-t border-primary/10 pt-4">
            <h3 className="font-semibold mb-3 text-foreground">
              <span className="gold-underline">{t("attendeeInfo")}</span>
            </h3>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="attendee-name"
                  className="block text-sm font-medium mb-1 text-foreground/80"
                >
                  {t("fullName")}
                </label>
                <Input
                  id="attendee-name"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  required
                  className="focus-visible:ring-primary/50 focus-visible:border-primary/50"
                />
              </div>
              <div>
                <label
                  htmlFor="attendee-phone"
                  className="block text-sm font-medium mb-1 text-foreground/80"
                >
                  {t("phone")}
                </label>
                <Input
                  id="attendee-phone"
                  value={attendeePhone}
                  onChange={(e) => setAttendeePhone(e.target.value)}
                  placeholder="96599998888"
                  dir="ltr"
                  required
                  className="focus-visible:ring-primary/50 focus-visible:border-primary/50"
                />
              </div>
              <div>
                <label
                  htmlFor="attendee-email"
                  className="block text-sm font-medium mb-1 text-foreground/80"
                >
                  {t("email")}
                </label>
                <Input
                  id="attendee-email"
                  type="email"
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  placeholder="mohammed@example.com"
                  dir="ltr"
                  required
                  className="focus-visible:ring-primary/50 focus-visible:border-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Error state with animation */}
          <AnimatePresence>
            {error && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Booking button with gold gradient */}
          <Button
            type="submit"
            className="w-full glow-gold bg-gradient-to-r from-primary via-primary to-primary/80 text-primary-foreground font-semibold text-base hover:opacity-95 transition-opacity"
            size="lg"
            disabled={createBooking.isPending || ticketSelection.length === 0}
          >
            {createBooking.isPending ? (
              <>
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
                {t("bookingInProgress")}
              </>
            ) : (
              `${t("bookNow")} — ${formatKWD(totalAmount, locale)}`
            )}
          </Button>

          {/* Login required notice */}
          {!isSignedIn && isLoaded && (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
              <LogIn className="h-3.5 w-3.5" />
              {t("mustLogin")}
            </p>
          )}
        </form>
      )}

      {totalAmount === 0 && !isFree && ticketSelection.length === 0 && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          {t("selectTicketsFirst")}
        </p>
      )}
    </div>
  );
}
