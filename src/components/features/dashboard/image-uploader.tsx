"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useUploadFile } from "@/hooks/use-upload";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { logger } from "@/lib/logger";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: "events" | "avatars" | "categories";
  label?: string;
}

export function ImageUploader({
  value,
  onChange,
  folder = "events",
  label,
}: ImageUploaderProps) {
  const t = useTranslations("dashboard");
  const upload = useUploadFile();
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) {
        alert(t("events.imageTooLarge"));
        return;
      }

      try {
        const result = await upload.mutateAsync({ file, folder });
        onChange(result.publicUrl);
      } catch (error: unknown) {
        logger.error("image-uploader", "Upload error", error);
      }
    },
    [upload, folder, onChange, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}

      {value ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
          <Image
            src={value}
            alt="Cover"
            fill
            className="object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 end-2 h-8 w-8"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) handleFile(file);
            };
            input.click();
          }}
        >
          {upload.isPending ? (
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                {t("events.dragOrClick")}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t("events.maxSize")}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
