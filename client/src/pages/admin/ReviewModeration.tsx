import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Star, CheckCircle, XCircle, AlertCircle, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

export default function ReviewModeration() {
  const { user, isAuthenticated } = useAuth();
  const reviewsQuery = trpc.reviews.getPending.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const moderateMutation = trpc.reviews.moderate.useMutation({
    onSuccess: () => { reviewsQuery.refetch(); },
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-destructive/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Admin access required</p>
            <Link href="/"><a className="text-primary hover:underline text-sm">Back to Shop</a></Link>
          </div>
        </div>
      </div>
    );
  }

  const handleModerate = async (reviewId: number, action: "approve" | "reject") => {
    try {
      await moderateMutation.mutateAsync({ reviewId, action });
      toast.success(`Review ${action === "approve" ? "approved" : "rejected"}`);
    } catch (err: any) { toast.error(err.message || "Failed"); }
  };

  const reviews = reviewsQuery.data || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Review Moderation</h1>
            <p className="text-xs text-muted-foreground">{reviews.length} pending reviews</p>
          </div>
          <Link href="/admin"><a className="ml-auto text-xs text-primary hover:underline">← Back to Dashboard</a></Link>
        </div>

        {reviewsQuery.isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-28" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-card/40 border border-border/40 rounded-2xl">
            <CheckCircle className="w-12 h-12 text-primary/40 mx-auto mb-4" />
            <p className="text-muted-foreground">No pending reviews — you're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <div key={review.id} className="bg-card border border-border/60 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-foreground text-sm">{review.title || "Untitled Review"}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border status-pending">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">· Item #{review.productId}</span>
                      <span className="text-xs text-muted-foreground">· {new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleModerate(review.id, "approve")}
                      disabled={moderateMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/30 text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleModerate(review.id, "reject")}
                      disabled={moderateMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/30 text-xs font-semibold hover:bg-destructive/20 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed bg-background/60 rounded-xl p-3 border border-border/40">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
