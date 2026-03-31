import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface ReviewsSectionProps {
  productId: number;
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">("recent");
  const [filterRating, setFilterRating] = useState<number | undefined>();
  const [page, setPage] = useState(0);

  // Fetch reviews and stats
  const statsQuery = trpc.reviews.getStats.useQuery(productId);
  const reviewsQuery = trpc.reviews.getByProduct.useQuery({
    productId,
    page,
    limit: 10,
    sortBy,
    filterRating,
  });

  const markHelpfulMutation = trpc.reviews.markHelpful.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your feedback!");
    },
    onError: () => {
      toast.error("Failed to mark review as helpful");
    },
  });

  const stats = statsQuery.data;
  const reviews = reviewsQuery.data;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      {stats && stats.totalReviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
            <CardDescription>
              Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Rating */}
            <div className="flex items-start gap-8">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-foreground">
                  {stats.averageRating}
                </div>
                <div className="flex gap-1 mt-2">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
                <p className="text-sm text-foreground/60 mt-2">
                  Average rating
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="flex-1 space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-3">
                    <button
                      onClick={() => setFilterRating(filterRating === rating ? undefined : rating)}
                      className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                    >
                      <span className="w-12">{rating} star{rating !== 1 ? "s" : ""}</span>
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{
                            width: `${stats.percentByRating[rating as keyof typeof stats.percentByRating]}%`,
                          }}
                        />
                      </div>
                    </button>
                    <span className="text-sm text-foreground/60 w-12 text-right">
                      {stats.percentByRating[rating as keyof typeof stats.percentByRating]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-foreground">
            {reviews?.reviews.length === 0 ? "No reviews yet" : "Customer Reviews"}
          </h3>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as any);
              setPage(0);
            }}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>

        {reviews?.reviews && reviews.reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.reviews.map((review) => (
              <Card key={review.id} className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {/* Review Header */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm font-medium text-foreground">
                            {review.title}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/60">
                          By {review.userId === user?.id ? "You" : "Customer"} •{" "}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {review.isVerifiedPurchase && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>

                    {/* Review Comment */}
                    {review.comment && (
                      <p className="text-foreground/80 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    )}

                    {/* Helpful/Unhelpful */}
                    <div className="flex gap-4 pt-3 border-t border-border">
                      <button
                        onClick={() => markHelpfulMutation.mutate({ reviewId: review.id })}
                        disabled={markHelpfulMutation.isPending}
                        className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Helpful</span>
                      </button>
                      <button
                        onClick={() => markHelpfulMutation.mutate({ reviewId: review.id })}
                        disabled={markHelpfulMutation.isPending}
                        className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>Not Helpful</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {reviews.hasMore && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setPage(page + 1)}
              >
                Load More Reviews
              </Button>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-foreground/60 mb-4">
                No reviews yet. Be the first to review this product!
              </p>
              {isAuthenticated ? (
                <p className="text-sm text-foreground/40">
                  Scroll down to write a review
                </p>
              ) : (
                <Button asChild>
                  <a href={getLoginUrl()}>Sign in to write a review</a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
