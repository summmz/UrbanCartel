import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { ArrowLeft, Star, ShoppingCart, ThumbsUp, CheckCircle, Tag, Hash, Minus, Plus, Ruler, Package } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { formatPrice } from "@/lib/currency";

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${cls} ${i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const productId = parseInt(id || "");
  const productQuery = trpc.products.getById.useQuery(productId, { enabled: !isNaN(productId) });
  const reviewsQuery = trpc.reviews.getByProduct.useQuery({ productId }, { enabled: !isNaN(productId) });
  const statsQuery = trpc.reviews.getStats.useQuery(productId, { enabled: !isNaN(productId) });
  const addToCartMutation = trpc.cart.add.useMutation();
  const createReviewMutation = trpc.reviews.create.useMutation();
  const voteHelpfulMutation = trpc.reviews.voteHelpful.useMutation();

  if (isNaN(productId)) return null;

  const handleAddToCart = async () => {
    if (!isAuthenticated) { window.location.href = "/login"; return; }
    if (!selectedSize) { toast.error("Please select a size"); return; }
    try {
      await addToCartMutation.mutateAsync({ productId, quantity });
      toast.success(`${quantity}x ${selectedSize} added to cart!`);
    } catch { toast.error("Failed to add to cart"); }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReviewMutation.mutateAsync({ productId, ...reviewForm });
      toast.success("Review submitted!");
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: "", comment: "" });
      reviewsQuery.refetch();
      statsQuery.refetch();
    } catch (err: any) { toast.error(err.message || "Failed to submit review"); }
  };

  if (productQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="skeleton rounded-2xl aspect-square" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-8 rounded-lg" style={{ width: `${80 - i*10}%` }} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!productQuery.data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Product not found</p>
            <Link href="/"><a className="text-primary hover:underline">Back to shop</a></Link>
          </div>
        </div>
      </div>
    );
  }

  const product = productQuery.data;
  const stats = statsQuery.data;
  const reviews = reviewsQuery.data?.reviews || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Shop</Link>
            <span>/</span>
            <Link href={`/category/${encodeURIComponent(product.category.toLowerCase())}`} className="hover:text-primary transition-colors">{product.category}</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="space-y-3">
              <div className="aspect-square rounded-2xl overflow-hidden bg-card border border-border/60">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground/20" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="fade-up">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
                <Tag className="w-3 h-3" />
                {product.category}
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-3">{product.name}</h1>

              {/* Rating bar */}
              {stats && stats.totalReviews > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <Stars rating={stats.averageRating} size="md" />
                  <span className="text-sm font-semibold text-foreground">{stats.averageRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({stats.totalReviews} reviews)</span>
                </div>
              )}

              <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

              {/* Price block */}
              <div className="bg-card border border-border/60 rounded-2xl p-6 mb-6 space-y-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-primary">{formatPrice(product.price)}</span>
                  <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full border ${product.stock > 0 ? "status-delivered" : "status-cancelled"}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                </div>

                {product.stock > 0 && (
                  <>
                    {/* Size selector */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Size</p>
                        <Link
                          href="/help#size-guide"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Ruler className="w-3 h-3" /> Size Guide
                        </Link>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`w-12 h-10 rounded-lg text-sm font-bold border transition-all ${
                              selectedSize === size
                                ? "bg-primary text-primary-foreground border-primary glow-primary-sm"
                                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      {!selectedSize && (
                        <p className="text-xs text-muted-foreground mt-1.5">Select a size to add to cart</p>
                      )}
                    </div>

                    {/* Qty */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quantity</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-bold text-lg text-foreground">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={addToCartMutation.isPending}
                      className="w-full py-4 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 hover:bg-primary/90 transition-all glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {addToCartMutation.isPending ? "Adding..." : `Add ${quantity > 1 ? `${quantity}x` : ""} to Cart${selectedSize ? ` — ${selectedSize}` : ""}`}
                    </button>
                  </>
                )}
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Hash, label: "Style No.", value: product.sku || "N/A" },
                  { icon: Tag, label: "Category", value: product.category },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-card border border-border/60 rounded-xl p-3 flex items-center gap-3">
                    <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium text-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-foreground">Customer Reviews</h2>
              {isAuthenticated && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 rounded-lg border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/10 transition-colors"
                >
                  {showReviewForm ? "Cancel" : "Write Review"}
                </button>
              )}
            </div>

            {/* Stats overview */}
            {stats && stats.totalReviews > 0 && (
              <div className="bg-card border border-border/60 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-6 items-start">
                <div className="text-center">
                  <p className="text-6xl font-black text-primary">{stats.averageRating.toFixed(1)}</p>
                  <Stars rating={stats.averageRating} size="md" />
                  <p className="text-sm text-muted-foreground mt-1">{stats.totalReviews} reviews</p>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  {[5,4,3,2,1].map(star => {
                    const count = (stats.ratingDistribution as any)?.[star] || 0;
                    const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-4 text-right">{star}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-6">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Review form */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="bg-card border border-primary/20 rounded-2xl p-6 mb-8 space-y-4">
                <h3 className="font-bold text-foreground">Your Review</h3>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Rating</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                        <Star className={`w-7 h-7 transition-colors ${s <= reviewForm.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30 hover:text-yellow-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  placeholder="Review title (optional)"
                  value={reviewForm.title}
                  onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
                <textarea
                  placeholder="Share your experience..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                />
                <button
                  type="submit"
                  disabled={createReviewMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}

            {/* Review list */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-card border border-border/60 rounded-2xl p-6 hover:border-border transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-foreground text-sm">{review.title || "Review"}</p>
                          {review.isVerifiedPurchase && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full status-delivered border flex items-center gap-1">
                              <CheckCircle className="w-2.5 h-2.5" />
                              Verified
                            </span>
                          )}
                        </div>
                        <Stars rating={review.rating} />
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{review.comment}</p>
                    <div className="flex items-center gap-2 pt-3 border-t border-border/40">
                      <button
                        onClick={() => { if (!isAuthenticated) { toast.error("Login to vote"); return; } voteHelpfulMutation.mutate(review.id); }}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Helpful ({review.helpfulVotes})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card/40 border border-border/40 rounded-2xl">
                <Star className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No reviews yet. Be the first!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
