"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCreateReview } from "@/hooks/use-reviews";
import { RatingInput } from "@/components/features/reviews/rating-input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";

interface ReviewFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ eventId, onSuccess }: ReviewFormProps) {
  const t = useTranslations("reviews");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createReview = useCreateReview(eventId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError(t("ratingRequired"));
      return;
    }

    createReview.mutate(
      { rating, comment: comment || undefined },
      {
        onSuccess: () => {
          setRating(0);
          setComment("");
          onSuccess?.();
        },
        onError: (err: Error) => {
          setError(err.message || t("submitError"));
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("writeReview")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t("yourRating")}
            </label>
            <RatingInput value={rating} onChange={setRating} />
            {rating > 0 && (
              <p className="text-xs text-gray-500 mt-1 ms-1">
                {t(`ratingLabels.${rating}`)}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t("yourComment")}
              <span className="text-gray-400 font-normal">
                {" "}
                ({t("optional")})
              </span>
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("commentPlaceholder")}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 mt-1 text-end" dir="ltr">
              {comment.length}/1000
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={createReview.isPending || rating === 0}
            className="w-full sm:w-auto"
          >
            {createReview.isPending ? (
              <Loader2 className="h-4 w-4 me-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 me-2" />
            )}
            {t("submitReview")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
