"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Loader2 } from "lucide-react";
import { logger } from "@/lib/logger";

interface QRScannerProps {
  onScan: (data: string) => void;
  isActive: boolean;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, isActive, onError }: QRScannerProps) {
  const t = useTranslations("dashboard");
  const scannerRef = useRef<unknown>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setIsStarting(true);
    setCameraError(null);

    try {
      // Dynamically import html5-qrcode
      const { Html5Qrcode } = await import("html5-qrcode");

      // Create scanner instance
      const scannerId = "qr-reader-" + Date.now();

      // Create the container div if it doesn't exist
      let container = document.getElementById("qr-reader-container");
      if (!container) return;

      container.innerHTML = "";
      const scannerDiv = document.createElement("div");
      scannerDiv.id = scannerId;
      container.appendChild(scannerDiv);

      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      // Start scanning
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          // Successfully scanned — call onScan
          onScan(decodedText);
        },
        () => {
          // QR code not found in this frame — ignore
        }
      );

      setHasCamera(true);
    } catch (error: unknown) {
      const err = error as Error & { name?: string };
      logger.error("qr-scanner", "Camera error", err);
      setHasCamera(false);

      if (err.name === "NotAllowedError") {
        setCameraError(t("tickets.cameraDenied"));
        onError?.(t("tickets.cameraDenied"));
      } else if (err.name === "NotFoundError") {
        setCameraError(t("tickets.noCamera"));
        onError?.(t("tickets.noCamera"));
      } else {
        setCameraError(t("tickets.cameraError"));
        onError?.(t("tickets.cameraError"));
      }
    } finally {
      setIsStarting(false);
    }
  }, [onScan, onError, t]);

  const stopCamera = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const scanner = scannerRef.current as {
          stop: () => Promise<void>;
          clear: () => void;
        };
        await scanner.stop();
        scanner.clear();
        scannerRef.current = null;
      }
    } catch {
      // Ignore stop errors
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);

  return (
    <div className="space-y-4">
      {/* Container for html5-qrcode scanner — this renders the video feed */}
      <div
        id="qr-reader-container"
        className="relative w-full aspect-square max-w-sm mx-auto rounded-xl overflow-hidden bg-black"
      />

      {/* Overlay while starting camera */}
      {isStarting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/80 rounded-xl">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="text-sm">{t("tickets.startingCamera")}</p>
        </div>
      )}

      {/* Camera error overlay */}
      {cameraError && (
        <div className="w-full max-w-sm mx-auto bg-gray-100 rounded-xl p-6 text-center">
          <CameraOff className="h-12 w-12 mx-auto mb-3 text-red-400" />
          <p className="text-sm text-center mb-4">{cameraError}</p>
          <Button variant="outline" size="sm" onClick={startCamera}>
            {t("tickets.retryCamera")}
          </Button>
        </div>
      )}

      {/* No camera available */}
      {!hasCamera && !cameraError && (
        <div className="w-full max-w-sm mx-auto bg-gray-100 rounded-xl p-6 text-center">
          <CameraOff className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-center">
            {t("tickets.useManualEntry")}
          </p>
        </div>
      )}

      {/* Camera toggle */}
      {hasCamera && !cameraError && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={isActive ? stopCamera : startCamera}
          >
            {isActive ? (
              <>
                <CameraOff className="h-4 w-4 me-2" />
                {t("tickets.stopCamera")}
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 me-2" />
                {t("tickets.startCamera")}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
