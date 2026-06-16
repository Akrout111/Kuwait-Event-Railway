"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fill,
  width,
  height,
  priority = false,
  sizes,
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const locale = useLocale();

  // Generate a dark placeholder SVG with gold accent text
  // Using encodeURIComponent instead of btoa to safely handle Arabic characters
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
      <rect width="100%" height="100%" fill="#0f172a"/>
      <circle cx="200" cy="120" r="30" fill="#D4AF37" opacity="0.15"/>
      <path d="M185 120 L200 105 L215 120 L205 120 L205 140 L195 140 L195 120 Z" fill="#D4AF37" opacity="0.3"/>
      <text x="50%" y="185" dominant-baseline="middle" text-anchor="middle" 
            fill="#D4AF37" font-size="12" font-family="sans-serif" opacity="0.5">
        ${locale === "ar" ? "الصورة غير متوفرة" : "Image unavailable"}
      </text>
    </svg>`;
  const placeholderSvg = `data:image/svg+xml,${encodeURIComponent(svgString)}`;

  return (
    <div className={cn("relative overflow-hidden", fill && "h-full w-full", className)}>
      {/* Shimmer loading state */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 skeleton-shimmer" />
      )}
      <Image
        src={hasError ? placeholderSvg : src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        className={cn(
          "object-cover transition-opacity duration-500",
          isLoading && !hasError ? "opacity-0" : "opacity-100",
          hasError && "opacity-70"
        )}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onLoad={() => setIsLoading(false)}
        priority={priority}
      />
    </div>
  );
}
