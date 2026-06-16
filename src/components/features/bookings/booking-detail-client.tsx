"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCancelBooking } from "@/hooks/use-booking";
import { formatKWD } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, Ticket, AlertTriangle, Loader2 } from "lucide-react";
import { TicketQR } from "./ticket-qr";
import { Link } from "@/i18n/routing";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

interface BookingDetailClientProps {
  booking: {
    id: string;
    bookingNumber: string;
    status: string;
    totalAmount: string;
    quantity: number;
    attendeeName: string;
    attendeePhone: string;
    attendeeEmail: string;
    createdAt: string;
    event: {
      id: string;
      titleAr: string;
      titleEn?: string | null;
      slug: string;
      coverImageUrl: string;
      startDate: string;
      startTime: string;
      venue: { nameAr: string; nameEn?: string | null; address: string; city: string } | null;
    };
    tickets: {
      id: string;
      ticketNumber: string;
      qrCodeUrl?: string | null;
      ticketTier: { nameAr: string; nameEn?: string | null; type: string; price: string };
    }[];
    payment: {
      id: string;
      amount: string;
      status: string;
      method: string;
    } | null;
  };
  isPending: boolean;
}

function BookingDetailContent({ booking, isPending }: BookingDetailClientProps) {
  const locale = useLocale();
  const t = useTranslations("bookingDetail");
  const tBooking = useTranslations("booking");
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const cancelBooking = useCancelBooking();
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [paying, setPaying] = useState(false);

  const eventTitle = locale === "ar" ? booking.event.titleAr : (booking.event.titleEn ?? booking.event.titleAr);
  const venueName = booking.event.venue
    ? (locale === "ar" ? booking.event.venue.nameAr : (booking.event.venue.nameEn ?? booking.event.venue.nameAr))
    : null;

  const paymentStatusLabels: Record<string, string> = {
    SUCCESS: t("paymentSuccess"),
    PENDING: t("paymentPending"),
    REFUNDED: t("paymentRefunded"),
    FAILED: t("paymentFailed"),
  };

  const paymentStatusColors: Record<string, string> = {
    SUCCESS: "text-success",
    PENDING: "text-warning",
    REFUNDED: "text-info",
    FAILED: "text-destructive",
  };

  // Countdown timer — 15 minutes
  useEffect(() => {
    if (booking.status !== "PENDING") return;

    const createdAt = new Date(booking.createdAt).getTime();
    const expiryTime = createdAt + 15 * 60 * 1000;

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeLeft(t("expired"));
        clearInterval(timer);
        window.location.reload();
        return;
      }

      const minutes = Math.floor(diff / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [booking.status, booking.createdAt, t]);

  const isExpired = timeLeft === t("expired");

  const handlePayNow = async () => {
    setPaying(true);
    try {
      const res = await fetch("/api/v1/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, method: "KNET" }),
      });
      const data = await res.json();
      if (data.data?.redirectUrl) {
        window.location.href = data.data.redirectUrl;
      } else {
        alert(data.error?.message ?? t("payNowFailed"));
        setPaying(false);
      }
    } catch {
      alert(t("payNowError"));
      setPaying(false);
    }
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Payment success message */}
        {paymentStatus === "success" && booking.status === "CONFIRMED" && (
          <div className="mb-6 rounded-lg border-2 border-success/40 bg-success/5 p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <h3 className="font-semibold text-success text-lg">{t("paymentCompleteTitle")}</h3>
                <p className="text-sm text-success/80">{t("paymentCompleteDesc")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment failed message */}
        {paymentStatus === "failed" && (
          <div className="mb-6 rounded-lg border-2 border-destructive/40 bg-destructive/5 p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">❌</span>
              <div>
                <h3 className="font-semibold text-destructive">{t("paymentFailTitle")}</h3>
                <p className="text-sm text-destructive/80">{t("paymentFailDesc")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending booking alert */}
        {booking.status === "PENDING" && !isExpired && (
          <div className="mb-6 rounded-lg border-2 border-warning/40 bg-warning/5 p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-warning" />
              <div>
                <h3 className="font-semibold text-warning">{t("pendingAlertTitle")}</h3>
                <p className="text-sm text-warning/80">
                  {t("timeRemaining")} <span className="font-bold text-lg">{timeLeft}</span> {t("toCompletePayment")}
                </p>
              </div>
            </div>
            <Button
              className="w-full mt-3"
              size="lg"
              onClick={handlePayNow}
              disabled={paying}
            >
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  {t("redirectingToPayment")}
                </>
              ) : (
                `💳 ${t("payViaKNet")} — ${formatKWD(booking.totalAmount, locale)}`
              )}
            </Button>
            <p className="text-xs text-warning text-center mt-2">
              {t("testModeNotice")}
            </p>
          </div>
        )}

        {isExpired && (
          <div className="mb-6 rounded-lg border-2 border-destructive/40 bg-destructive/5 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <div>
                <h3 className="font-semibold text-destructive">{t("paymentExpiredTitle")}</h3>
                <p className="text-sm text-destructive/80">{t("paymentExpiredDesc")}</p>
              </div>
            </div>
          </div>
        )}

        {booking.status === "CANCELLED" && paymentStatus !== "failed" && (
          <div className="mb-6 rounded-lg border bg-muted p-4">
            <p className="font-medium text-muted-foreground">{t("bookingCancelled")}</p>
          </div>
        )}

        {booking.status === "CONFIRMED" && paymentStatus !== "success" && (
          <div className="mb-6 rounded-lg border-2 border-success/40 bg-success/5 p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <h3 className="font-semibold text-success">{t("bookingConfirmed")}</h3>
            </div>
          </div>
        )}

        {booking.status === "REFUNDED" && (
          <div className="mb-6 rounded-lg border-2 border-info/40 bg-info/5 p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <h3 className="font-semibold text-info">{t("bookingRefunded")}</h3>
            </div>
          </div>
        )}

        {/* Booking details card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("bookingDetails")}</CardTitle>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {booking.bookingNumber}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Event */}
            <div className="flex gap-3">
              <ImageWithFallback
                src={booking.event.coverImageUrl}
                alt={eventTitle}
                className="h-16 w-24 rounded-md object-cover"
              />
              <div>
                <Link
                  href={`/events/${booking.event.slug}`}
                  className="font-medium hover:text-primary"
                >
                  {eventTitle}
                </Link>
                {venueName && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{venueName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t" />

            {/* Tickets */}
            <div>
              <h4 className="font-medium flex items-center gap-1.5 mb-2">
                <Ticket className="h-4 w-4" /> {t("tickets")}
              </h4>
              <div className="space-y-2">
                {booking.tickets.map((ticket) => {
                  const tierName = locale === "ar" ? ticket.ticketTier.nameAr : (ticket.ticketTier.nameEn ?? ticket.ticketTier.nameAr);
                  return (
                    <div key={ticket.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                          {ticket.ticketNumber}
                        </span>
                        <span className="ms-2">{tierName}</span>
                      </div>
                      <span className="font-medium">{formatKWD(ticket.ticketTier.price, locale)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t" />

            {/* Attendee info */}
            <div>
              <h4 className="font-medium mb-2">{t("attendeeInfo")}</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>{t("nameLabel")}: {booking.attendeeName}</p>
                <p dir="ltr" className="text-start">{t("phoneLabel")}: {booking.attendeePhone}</p>
                <p dir="ltr" className="text-start">{t("emailLabel")}: {booking.attendeeEmail}</p>
              </div>
            </div>

            {/* Payment status */}
            {booking.payment && (
              <>
                <div className="border-t" />
                <div>
                  <h4 className="font-medium mb-2">{t("paymentStatus")}</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("paymentMethod")}</span>
                      <span className="font-medium">{booking.payment.method}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("paymentStatusLabel")}</span>
                      <span className={`font-medium ${paymentStatusColors[booking.payment.status] ?? ""}`}>
                        {paymentStatusLabels[booking.payment.status] ?? booking.payment.status}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="border-t" />

            {/* Total */}
            <div className="flex items-center justify-between text-lg font-bold">
              <span>{t("total")}</span>
              <span className="text-primary">{formatKWD(booking.totalAmount, locale)}</span>
            </div>
          </CardContent>
        </Card>

        {/* QR Codes — only for confirmed bookings */}
        {booking.status === "CONFIRMED" && booking.tickets.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3 text-lg">{t("yourTickets")}</h3>
            <div className="space-y-3">
              {booking.tickets.map((ticket) => {
                const tierName = locale === "ar" ? ticket.ticketTier.nameAr : (ticket.ticketTier.nameEn ?? ticket.ticketTier.nameAr);
                return (
                  <TicketQR
                    key={ticket.id}
                    ticketNumber={ticket.ticketNumber}
                    qrData={ticket.qrCodeUrl ?? `{"tn":"${ticket.ticketNumber}","bid":"${booking.id}","v":1}`}
                    tierName={tierName}
                    eventTitle={eventTitle}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex gap-3">
          {booking.status === "PENDING" && !isExpired && (
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => cancelBooking.mutate(booking.id)}
              disabled={cancelBooking.isPending}
            >
              {cancelBooking.isPending ? (
                <><Loader2 className="h-4 w-4 me-2 animate-spin" /> {t("cancelling")}</>
              ) : (
                tBooking("cancelBooking")
              )}
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/bookings">{t("myBookings")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BookingDetailClient({ booking, isPending }: BookingDetailClientProps) {
  const t = useTranslations("bookingDetail");
  return (
    <Suspense fallback={<div className="py-8 text-center text-muted-foreground">{t("loading")}</div>}>
      <BookingDetailContent booking={booking} isPending={isPending} />
    </Suspense>
  );
}
