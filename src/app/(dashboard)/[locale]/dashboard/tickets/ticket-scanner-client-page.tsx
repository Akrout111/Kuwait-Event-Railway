"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useValidateTicket } from "@/hooks/use-ticket-validation";
import { QRScanner } from "@/components/features/dashboard/qr-scanner";
import { logger } from "@/lib/logger";
import { ManualEntry } from "@/components/features/dashboard/manual-entry";
import { ValidationResult } from "@/components/features/dashboard/validation-result";
import { RecentValidations } from "@/components/features/dashboard/recent-validations";
import { CheckInStats } from "@/components/features/dashboard/check-in-stats";
import { EventSelector } from "@/components/features/dashboard/event-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Keyboard } from "lucide-react";

interface ValidationState {
  valid: boolean;
  ticket: {
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
  } | null;
  reason: string | null;
}

export function TicketScannerClientPage() {
  const t = useTranslations("dashboard");
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
  const [scannerActive, setScannerActive] = useState(true);
  const [validationResult, setValidationResult] = useState<ValidationState | null>(null);
  const [lastScannedNumber, setLastScannedNumber] = useState<string>("");

  const validateMutation = useValidateTicket();

  // Handle QR scan result
  const handleQRScan = useCallback(
    (scannedData: string) => {
      if (!selectedEventId) return;

      // Prevent duplicate scans of the same code rapidly
      if (scannedData === lastScannedNumber && validationResult) return;

      // Extract ticket number from QR data
      // QR data format: just the ticketNumber string (e.g., "TCK-1234-5678")
      // or a URL like "https://kuwaitevents.com/tickets/TCK-1234-5678"
      let ticketNumber = scannedData;

      // If it's a URL, extract the ticket number from the end
      if (scannedData.startsWith("http")) {
        const parts = scannedData.split("/");
        const lastPart = parts[parts.length - 1];
        if (lastPart.startsWith("TCK-")) {
          ticketNumber = lastPart;
        }
      }

      // Validate format before making API call
      if (!ticketNumber.startsWith("TCK-")) {
        setValidationResult({
          valid: false,
          ticket: null,
          reason: "TICKET_NOT_FOUND",
        });
        return;
      }

      setLastScannedNumber(ticketNumber);

      validateMutation.mutate(
        { ticketNumber, eventId: selectedEventId },
        {
          onSuccess: (response) => {
            setValidationResult({
              valid: response.data.valid,
              ticket: response.data.ticket,
              reason: response.data.reason,
            });

            // If valid, play success sound/vibration
            if (response.data.valid) {
              try {
                navigator.vibrate?.([100, 50, 100]);
              } catch {
                // Vibration not supported
              }
            }
          },
          onError: () => {
            setValidationResult({
              valid: false,
              ticket: null,
              reason: "TICKET_NOT_FOUND",
            });
          },
        }
      );
    },
    [selectedEventId, lastScannedNumber, validationResult, validateMutation]
  );

  // Handle manual entry
  const handleManualEntry = useCallback(
    (ticketNumber: string) => {
      if (!selectedEventId) return;

      setLastScannedNumber(ticketNumber);

      validateMutation.mutate(
        { ticketNumber, eventId: selectedEventId },
        {
          onSuccess: (response) => {
            setValidationResult({
              valid: response.data.valid,
              ticket: response.data.ticket,
              reason: response.data.reason,
            });
          },
          onError: () => {
            setValidationResult({
              valid: false,
              ticket: null,
              reason: "TICKET_NOT_FOUND",
            });
          },
        }
      );
    },
    [selectedEventId, validateMutation]
  );

  // Reset validation state to scan next ticket
  const handleReset = useCallback(() => {
    setValidationResult(null);
    setLastScannedNumber("");
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("tickets.title")}</h1>
        <p className="text-gray-500 mt-1">{t("tickets.subtitle")}</p>
      </div>

      {/* Event Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">
          {t("tickets.selectEventLabel")}:
        </span>
        <EventSelector value={selectedEventId} onChange={setSelectedEventId} />
      </div>

      {!selectedEventId ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Camera className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t("tickets.selectEventFirst")}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Check-in Stats */}
          <CheckInStats eventId={selectedEventId} />

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Scanner / Manual Entry */}
            <div className="space-y-4">
              <Tabs defaultValue="scanner" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="scanner" className="flex-1">
                    <Camera className="h-4 w-4 me-2" />
                    {t("tabs.scanner")}
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex-1">
                    <Keyboard className="h-4 w-4 me-2" />
                    {t("tabs.manual")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="scanner" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {t("tickets.scanQR")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <QRScanner
                        onScan={handleQRScan}
                        isActive={scannerActive && !validationResult}
                        onError={(err) =>
                          logger.error("ticket-scanner", "Scanner error", err)
                        }
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="manual" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {t("tickets.manualTitle")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ManualEntry
                        onSubmit={handleManualEntry}
                        isLoading={validateMutation.isPending}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Validation Result */}
              {validationResult && (
                <ValidationResult
                  valid={validationResult.valid}
                  ticket={validationResult.ticket}
                  reason={validationResult.reason}
                  onReset={handleReset}
                />
              )}

              {/* Loading overlay */}
              {validateMutation.isPending && !validationResult && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="py-8 text-center">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      {t("tickets.validating")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: Recent Validations */}
            <RecentValidations eventId={selectedEventId} />
          </div>
        </>
      )}
    </div>
  );
}
