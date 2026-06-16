"use client";

import { useState } from "react";
import { useSafeAuth } from "@/hooks/use-safe-auth";
import { useTranslations } from "next-intl";
import { useEventReviews, useReviewEligibility } from "@/hooks/use-reviews";
import { RatingDisplay } from "@/components/features/reviews/rating-display";
import { RatingDistribution } from "@/components/features/reviews/rating-distribution";
import { ReviewCard } from "@/components/features/reviews/review-card";
import { ReviewForm } from "@/components/features/reviews/review-form";
import { ReviewLockedState } from "@/components/features/reviews/review-locked-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, PenLine } from "lucide-react";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  organizerReply: string | null;
  organizerRepliedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface ReviewsSectionProps {
  eventId: string;
  initialAverageRating?: number;
  initialTotalReviews?: number;
}

export function ReviewsSection({
  eventId,
  initialAverageRating = 0,
  initialTotalReviews = 0,
}: ReviewsSectionProps) {
  const t = useTranslations("reviews");
  const { isSignedIn } = useSafeAuth();
  const [sortBy, setSortBy] = useState("recent");
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useEventReviews(eventId, {
    page,
    limit: 10,
    sortBy,
  });

  const { data: eligibilityData } = useReviewEligibility(eventId);
  const eligibility = eligibilityData?.data;

  const reviews: ReviewItem[] = data?.data?.reviews ?? [];
  const stats = data?.data?.stats;
  const meta = data?.meta;

  const averageRating = stats?.averageRating ?? initialAverageRating;
  const totalReviews = stats?.totalReviews ?? initialTotalReviews;
  const distribution = stats?.distribution ?? {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">{t("title")}</h2>
        <span className="text-gray-400 text-sm">
          ({totalReviews}{" "}
          {totalReviews === 1 ? t("reviewSingle") : t("reviewPlural")})
        </span>
      </div>

      {/* Summary: Average + Distribution */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Left: Average Rating */}
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl">
          <p className="text-5xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </p>
          <RatingDisplay
            rating={averageRating}
            size="lg"
            showValue={false}
            count={totalReviews}
          />
          <p className="text-sm text-gray-500 mt-2">
            {totalReviews} {t("totalReviewsLabel")}
          </p>
        </div>

        {/* Right: Distribution */}
        <div className="p-6">
          <RatingDistribution
            distribution={distribution}
            totalReviews={totalReviews}
          />
        </div>
      </div>

      {/* Write Review CTA or Form */}
      {isSignedIn && eligibility?.canReview && !showForm && (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <PenLine className="h-4 w-4 me-2" />
          {t("writeReview")}
        </Button>
      )}

      {isSignedIn && eligibility?.canReview && showForm && (
        <ReviewForm
          eventId={eventId}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {/* Already Reviewed */}
      {isSignedIn &&
        eligibility?.hasReviewed &&
        !eligibility?.canReview && (
          <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
            {t("alreadyReviewed")}
          </div>
        )}

      {/* Not Eligible */}
      {isSignedIn &&
        !eligibility?.canReview &&
        !eligibility?.hasReviewed &&
        eligibility?.reason === "NO_CONFIRMED_BOOKING" && (
          <ReviewLockedState />
        )}

      {/* Sort Controls */}
      {totalReviews > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {t("showingReviews", {
              count: reviews.length,
              total: totalReviews,
            })}
          </p>
          <Select
            value={sortBy}
            onValueChange={(v) => {
              setSortBy(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t("sortRecent")}</SelectItem>
              <SelectItem value="highest">
                {t("sortHighest")}
              </SelectItem>
              <SelectItem value="lowest">
                {t("sortLowest")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t("noReviews")}</p>
          <p className="text-sm text-gray-400 mt-1">{t("beFirst")}</p>
        </div>
      ) : (
        <div>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                {t("previous")}
              </Button>
              <span className="flex items-center text-sm text-gray-500 px-3">
                {page} / {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage(Math.min(meta.totalPages, page + 1))
                }
                disabled={page === meta.totalPages}
              >
                {t("next")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
