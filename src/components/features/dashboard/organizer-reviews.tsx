"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useOrganizerEvents } from "@/hooks/use-dashboard";
import { useEventReviews, useReplyToReview } from "@/hooks/use-reviews";
import { RatingDisplay } from "@/components/features/reviews/rating-display";
import { ReviewCard } from "@/components/features/reviews/review-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Reply } from "lucide-react";

interface EventItem {
  id: string;
  titleAr: string;
  titleEn: string | null;
}

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

export function OrganizerReviews() {
  const t = useTranslations("dashboard");
  const tReviews = useTranslations("reviews");
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: eventsData } = useOrganizerEvents({ limit: 100 });
  const events: EventItem[] = eventsData?.data?.events ?? [];

  const { data: reviewsData, isLoading } = useEventReviews(
    selectedEventId || "",
    { limit: 20, sortBy: "recent" }
  );

  const replyMutation = useReplyToReview();
  const reviews: ReviewItem[] = reviewsData?.data?.reviews ?? [];
  const stats = reviewsData?.data?.stats;

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) return;

    replyMutation.mutate(
      { reviewId, reply: replyText.trim() },
      {
        onSuccess: () => {
          setReplyingTo(null);
          setReplyText("");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("reviews.title")}</h1>
        <p className="text-gray-500 mt-1">{t("reviews.subtitle")}</p>
      </div>

      {/* Event Selector */}
      <div className="flex items-center gap-4">
        <Select
          onValueChange={setSelectedEventId}
          value={selectedEventId || ""}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder={t("reviews.selectEvent")} />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.titleAr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedEventId ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {t("reviews.selectEventFirst")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          {stats && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">
                    {stats.averageRating.toFixed(1)}
                  </p>
                  <RatingDisplay
                    rating={stats.averageRating}
                    size="sm"
                    showValue={false}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t("reviews.averageRating")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">
                    {stats.totalReviews}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("reviews.totalReviews")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">
                    {stats.distribution[5] || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("reviews.fiveStarReviews")}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reviews List with Reply */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>{t("reviews.noReviews")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <ReviewCard
                      review={review}
                      showOrganizerReply={true}
                    />

                    {/* Reply Button / Form */}
                    <div className="mt-3 ps-13">
                      {!review.organizerReply && (
                        <>
                          {replyingTo === review.id ? (
                            <div className="flex gap-2 mt-2">
                              <Input
                                value={replyText}
                                onChange={(e) =>
                                  setReplyText(e.target.value)
                                }
                                placeholder={t(
                                  "reviews.replyPlaceholder"
                                )}
                                maxLength={500}
                              />
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleReply(review.id)
                                }
                                disabled={
                                  replyMutation.isPending ||
                                  !replyText.trim()
                                }
                              >
                                {replyMutation.isPending
                                  ? "..."
                                  : t("reviews.sendReply")}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                              >
                                {tReviews("cancel")}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReplyingTo(review.id);
                                setReplyText("");
                              }}
                            >
                              <Reply className="h-3.5 w-3.5 me-1.5" />
                              {t("reviews.reply")}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
