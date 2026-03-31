import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface ReviewStatsProps {
  stats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
    percentByRating: Record<number, number>;
  };
}

export function ReviewStats({ stats }: ReviewStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-12 bg-card p-6 rounded-lg border border-border">
      <div className="text-center">
        <p className="text-5xl font-bold text-foreground mb-2">{stats.averageRating}</p>
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= Math.round(stats.averageRating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/20"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{stats.totalReviews} reviews</p>
      </div>

      <div className="md:col-span-2 space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center gap-4">
            <div className="flex items-center gap-1 w-12">
              <span className="text-sm font-medium">{rating}</span>
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            </div>
            <Progress value={stats.percentByRating[rating]} className="h-2 flex-1" />
            <span className="text-sm text-muted-foreground w-12 text-right">
              {stats.percentByRating[rating]}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
