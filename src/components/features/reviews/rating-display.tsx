"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
}

const sizeMap = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function RatingDisplay({
  rating,
  maxRating = 5,
  size = "md",
  showValue = true,
  count,
}: RatingDisplayProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center" dir="ltr">
        {Array.from({ length: maxRating }).map((_, i) => {
          const starValue = i + 1;
          return (
            <Star
              key={i}
              className={cn(
                sizeMap[size],
                starValue <= Math.floor(rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : starValue - 0.5 <= rating
                    ? "fill-yellow-400/50 text-yellow-400"
                    : "fill-transparent text-gray-300"
              )}
            />
          );
        })}
      </div>

      {showValue && (
        <span className="text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}

      {count !== undefined && (
        <span className="text-sm text-gray-500">({count})</span>
      )}
    </div>
  );
}
