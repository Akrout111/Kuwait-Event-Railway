"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function RatingInput({
  value,
  onChange,
  size = "lg",
  disabled = false,
}: RatingInputProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const displayValue = hoveredStar ?? value;

  return (
    <div
      className="flex items-center gap-1"
      dir="ltr"
      onMouseLeave={() => setHoveredStar(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => !disabled && setHoveredStar(star)}
          className={cn(
            "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm",
            disabled
              ? "cursor-default"
              : "cursor-pointer hover:scale-110"
          )}
          aria-label={`${star} ${star === 1 ? "نجمة" : "نجوم"}`}
        >
          <Star
            className={cn(
              sizeMap[size],
              "transition-all",
              star <= displayValue
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}
