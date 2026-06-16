"use client";

import { useTranslations } from "next-intl";

interface RatingDistributionProps {
  distribution: Record<number, number>;
  totalReviews: number;
}

export function RatingDistribution({
  distribution,
  totalReviews,
}: RatingDistributionProps) {
  const t = useTranslations("reviews");

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = distribution[stars] || 0;
        const percentage =
          totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={stars} className="flex items-center gap-2 text-sm">
            <span className="w-8 text-end text-gray-600">
              {stars} {t("star")}
            </span>
            <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-8 text-gray-500 text-xs">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
