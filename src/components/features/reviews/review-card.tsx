"use client";

import { useTranslations, useLocale } from "next-intl";
import { RatingDisplay } from "@/components/features/reviews/rating-display";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    organizerReply?: string | null;
    organizerRepliedAt?: string | null;
    createdAt: string;
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  };
  showOrganizerReply?: boolean;
}

export function ReviewCard({
  review,
  showOrganizerReply = true,
}: ReviewCardProps) {
  const t = useTranslations("reviews");
  const locale = useLocale();

  const timeAgo = getTimeAgo(review.createdAt, locale);

  return (
    <div className="py-4 border-b last:border-0">
      {/* Review Header */}
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={review.user.avatarUrl || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {review.user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-medium text-sm">{review.user.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <RatingDisplay
                  rating={review.rating}
                  size="sm"
                  showValue={false}
                />
                <span className="text-xs text-gray-400">{timeAgo}</span>
              </div>
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              {review.comment}
            </p>
          )}

          {/* Organizer Reply */}
          {showOrganizerReply && review.organizerReply && (
            <div className="mt-3 bg-gray-50 rounded-lg p-3 border-s-2 border-s-primary/30">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">
                  {t("organizerReply")}
                </Badge>
                {review.organizerRepliedAt && (
                  <span className="text-xs text-gray-400">
                    {getTimeAgo(review.organizerRepliedAt, locale)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {review.organizerReply}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateString: string, locale: string = "ar"): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  const rtf = new Intl.RelativeTimeFormat(locale === "ar" ? "ar" : "en", { numeric: "auto" });

  if (diffSeconds < 60) return rtf.format(0, "second");
  if (diffMinutes < 60) return rtf.format(-diffMinutes, "minute");
  if (diffHours < 24) return rtf.format(-diffHours, "hour");
  if (diffDays < 7) return rtf.format(-diffDays, "day");
  if (diffWeeks < 4) return rtf.format(-diffWeeks, "week");
  if (diffMonths < 12) return rtf.format(-diffMonths, "month");
  return date.toLocaleDateString(locale === "ar" ? "ar-KW" : "en-US");
}
