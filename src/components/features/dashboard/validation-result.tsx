"use client";

import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Ticket,
  Calendar,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TicketData {
  id: string;
  ticketNumber: string;
  isUsed: boolean;
  usedAt: string | null;
  ticketTier: {
    nameAr: string;
    nameEn: string | null;
    type: string;
    price: string;
  };
  booking: {
    attendeeName: string;
    attendeeEmail: string;
    attendeePhone: string;
    status: string;
    bookingNumber: string;
    quantity: number;
  };
  event: {
    id: string;
    titleAr: string;
    titleEn: string | null;
    startDate: string;
    startTime: string;
  } | null;
}

interface ValidationResultProps {
  valid: boolean;
  ticket: TicketData | null;
  reason: string | null;
  onReset: () => void;
}

const reasonLabels: Record<
  string,
  { icon: LucideIcon; color: string }
> = {
  TICKET_NOT_FOUND: { icon: XCircle, color: "text-red-500" },
  WRONG_EVENT: { icon: AlertTriangle, color: "text-orange-500" },
  ALREADY_USED: { icon: AlertTriangle, color: "text-orange-500" },
  BOOKING_NOT_CONFIRMED: { icon: XCircle, color: "text-red-500" },
};

export function ValidationResult({
  valid,
  ticket,
  reason,
  onReset,
}: ValidationResultProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  // ── Success state ──
  if (valid && ticket) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 space-y-4">
          {/* Success Header */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-green-700">
                {t("tickets.validTicket")}
              </p>
              <p className="text-sm text-green-600">
                {t("tickets.checkInSuccess")}
              </p>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="grid gap-3 bg-white rounded-lg p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {t("tickets.attendee")}:
              </span>
              <span className="font-medium">
                {ticket.booking.attendeeName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {t("tickets.tier")}:
              </span>
              <Badge variant="secondary">
                {ticket.ticketTier.nameAr}
              </Badge>
              <Badge variant="outline">{ticket.ticketTier.type}</Badge>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {t("tickets.booking")}:
              </span>
              <span className="font-mono text-sm">
                {ticket.booking.bookingNumber}
              </span>
            </div>

            {ticket.event && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {t("tickets.eventTime")}:
                </span>
                <span className="text-sm">
                  {new Date(ticket.event.startDate).toLocaleDateString(
                    locale === "ar" ? "ar-KW" : "en-US"
                  )}{" "}
                  — {ticket.event.startTime}
                </span>
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {t("tickets.ticketNumber")}:
                </span>
                <span className="font-mono font-medium" dir="ltr">
                  {ticket.ticketNumber}
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={onReset}
            className="w-full"
            variant="outline"
          >
            {t("tickets.scanNext")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Failure state ──
  const ReasonIcon = reason
    ? reasonLabels[reason]?.icon || XCircle
    : XCircle;
  const reasonColor = reason
    ? reasonLabels[reason]?.color || "text-red-500"
    : "text-red-500";

  const reasonMessages: Record<string, string> = {
    TICKET_NOT_FOUND: t("tickets.reasonNotFound"),
    WRONG_EVENT: t("tickets.reasonWrongEvent"),
    ALREADY_USED: t("tickets.reasonAlreadyUsed"),
    BOOKING_NOT_CONFIRMED: t("tickets.reasonNotConfirmed"),
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6 space-y-4">
        {/* Failure Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <ReasonIcon className={`h-7 w-7 ${reasonColor}`} />
          </div>
          <div>
            <p className="text-lg font-bold text-red-700">
              {t("tickets.invalidTicket")}
            </p>
            <p className="text-sm text-red-600">
              {reason
                ? reasonMessages[reason] || reason
                : t("tickets.unknownError")}
            </p>
          </div>
        </div>

        {/* Ticket details if available */}
        {ticket && (
          <div className="grid gap-2 bg-white rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {t("tickets.ticketNumber")}:
              </span>
              <span className="font-mono font-medium" dir="ltr">
                {ticket.ticketNumber}
              </span>
            </div>
            {ticket.booking && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {t("tickets.attendee")}:
                </span>
                <span className="font-medium">
                  {ticket.booking.attendeeName}
                </span>
              </div>
            )}
            {ticket.isUsed && ticket.usedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {t("tickets.usedAt")}:
                </span>
                <span className="text-orange-600">
                  {new Date(ticket.usedAt).toLocaleString(locale === "ar" ? "ar-KW" : "en-US")}
                </span>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={onReset}
          className="w-full"
          variant="outline"
        >
          {t("tickets.tryAgain")}
        </Button>
      </CardContent>
    </Card>
  );
}
