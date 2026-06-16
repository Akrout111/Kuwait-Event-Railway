"use client";

import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";

interface TicketQRProps {
  ticketNumber: string;
  qrData: string;
  tierName: string;
  eventTitle: string;
}

export function TicketQR({ ticketNumber, qrData, tierName, eventTitle }: TicketQRProps) {
  const t = useTranslations("bookingDetail");

  return (
    <div className="rounded-xl border p-4 bg-card">
      <div className="flex items-start gap-4">
        {/* QR Code */}
        <div className="bg-white p-2 rounded-lg shrink-0">
          <QRCodeSVG
            value={qrData}
            size={120}
            level="M"
            includeMargin={false}
          />
        </div>

        {/* Ticket Info */}
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs bg-muted px-2 py-1 rounded inline-block mb-2">
            {ticketNumber}
          </p>
          <p className="font-medium text-sm">{tierName}</p>
          <p className="text-xs text-muted-foreground mt-1 truncate">{eventTitle}</p>
          <p className="text-xs text-green-600 mt-2 font-medium">
            ✅ {t("ticketConfirmed")}
          </p>
        </div>
      </div>
    </div>
  );
}
