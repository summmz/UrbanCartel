import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import {
  ShoppingCart,
  LayoutGrid,
  ArrowUpDown,
  ArrowLeft,
  Zap,
  TrendingUp,
  Sparkles,
  Tag,
  Ruler,
  Footprints,
  HardHat,
  Waves,
  Sofa,
  ShoppingBag,
  Gem,
  Droplets,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { formatPrice } from "@/lib/currency";

const CATEGORY_META: Record<
  string,
  { icon: any; desc: string; color: string; image: string; accent: string }
> = {
  hoodies: {
    icon: Zap,
    desc: "Heavyweight fleece, oversized silhouettes, and high-density detailing.",
    color: "from-amber-500/20 to-orange-500/10",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=1600",
    accent: "text-amber-400",
  },
  tees: {
    icon: TrendingUp,
    desc: "Premium 240GSM cotton, dropped shoulders, and essential colorways.",
    color: "from-blue-500/20 to-cyan-500/10",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1600",
    accent: "text-blue-400",
  },
  outerwear: {
    icon: Sparkles,
    desc: "Engineered utility, water-resistant shells, and technical hardware.",
    color: "from-emerald-500/20 to-green-500/10",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1600",
    accent: "text-emerald-400",
  },
  accessories: {
    icon: Tag,
    desc: "Refined essentials to complete the uniform.",
    color: "from-purple-500/20 to-pink-500/10",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1600",
    accent: "text-purple-400",
  },
  bottoms: {
    icon: Ruler,
    desc: "Tactical cargo, relaxed denim, and high-stretch joggers.",
    color: "from-rose-500/20 to-red-500/10",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=1600",
    accent: "text-rose-400",
  },
  footwear: {
    icon: Footprints,
    desc: "Chunky soles, technical uppers, and collabs worth queuing for.",
    color: "from-sky-500/20 to-blue-500/10",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1600",
    accent: "text-sky-400",
  },
  headwear: {
    icon: HardHat,
    desc: "Caps, beanies, and bucket hats engineered for the streets.",
    color: "from-indigo-500/20 to-violet-500/10",
    image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=1600",
    accent: "text-indigo-400",
  },
  knitwear: {
    icon: Waves,
    desc: "Chunky knits, open-weave textures, and premium yarns.",
    color: "from-teal-500/20 to-cyan-500/10",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=1600",
    accent: "text-teal-400",
  },
  loungewear: {
    icon: Sofa,
    desc: "Cloud-soft sets built for staying in and still looking the part.",
    color: "from-pink-500/20 to-fuchsia-500/10",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1600",
    accent: "text-pink-400",
  },
  sale: {
    icon: Tag,
    desc: "Archive drops, sample surplus, and deadstock — heavily discounted.",
    color: "from-red-500/20 to-orange-500/10",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1600",
    accent: "text-red-400",
  },
  bags: {
    icon: ShoppingBag,
    desc: "Technical packs, crossbody essentials, and everyday carry refined.",
    color: "from-stone-500/20 to-zinc-500/10",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=1600",
    accent: "text-stone-400",
  },
  jewelry: {
    icon: Gem,
    desc: "Chains, rings, and layered pieces in gold-plated stainless steel.",
    color: "from-yellow-500/20 to-amber-500/10",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&q=80&w=1600",
    accent: "text-yellow-400",
  },
  swimwear: {
    icon: Droplets,
    desc: "Quick-dry trunks, rash guards, and resort-ready layers.",
    color: "from-cyan-500/20 to-blue-500/10",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1600",
    accent: "text-cyan-400",
  },
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const [sort, setSort] = useState<"default" | "newest" | "price_asc" | "price_desc">("default");

  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();

  const meta = CATEGORY_META[slug.toLowerCase()] ?? {
    icon: LayoutGrid,
    desc: "Discover the latest arrivals in our curated selection.",
    color: "from-white/10 to-transparent",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600",
    accent: "text-primary",
  };
  const Icon = meta.icon;

  const productsQuery = trpc.products.list.useQuery({
    page: 0,
    limit: 60,
    category: categoryName,
    sort,
  });
  const addToCartMutation = trpc.cart.add.useMutation();

  const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    if (!isAuthenticated) { window.location.href = "/login"; return; }
    try {
      await addToCartMutation.mutateAsync({ productId, quantity: 1 });
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[340px] md:h-[420px] overflow-hidden">
        <img
          src={meta.image}
          alt={categoryName}
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-end container mx-auto px-4 pb-12">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-6 w-fit"
          >
            <ArrowLeft className="w-3 h-3" /> All Categories
          </Link>

          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center ${meta.accent} shadow-xl`}>
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.3em] text-muted-foreground mb-1">Collection</p>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight uppercase text-foreground">{categoryName}</h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground/70 uppercase tracking-widest font-medium max-w-md">
            {meta.desc}
          </p>
        </div>
      </section>

      {/* Toolbar */}
      <section className="py-6 border-b border-white/5 bg-black/10 backdrop-blur-3xl sticky top-16 z-30">
        <div className="container mx-auto px-4 flex items-center justify-between gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {productsQuery.isLoading ? "Loading…" : `${productsQuery.data?.length ?? 0} products`}
          </p>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="appearance-none pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-white/10 transition-all"
            >
              <option value="default" className="bg-background">Default</option>
              <option value="newest" className="bg-background">Newest</option>
              <option value="price_asc" className="bg-background">Price: Low → High</option>
              <option value="price_desc" className="bg-background">Price: High → Low</option>
            </select>
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {productsQuery.isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton rounded-3xl aspect-[3/4]" />
              ))}
            </div>
          ) : productsQuery.data?.length === 0 ? (
            <div className="text-center py-32 opacity-40">
              <LayoutGrid className="w-12 h-12 mx-auto mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">No products in this category yet</p>
              <Link href="/shop" className="mt-6 inline-block text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                Browse all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsQuery.data?.map((product, i) => (
                <ProductGridCard key={product.id} product={product} i={i} handleAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductGridCard({ product, i, handleAddToCart }: { product: any; i: number; handleAddToCart: any }) {
  return (
    <Link href={`/product/${product.id}`} style={{ animationDelay: `${i * 40}ms` }} className="group block product-card">
      <div className="glass-card rounded-[2rem] overflow-hidden hover:border-primary/50 transition-all duration-500 relative bg-black/20 backdrop-blur-3xl shadow-2xl h-full flex flex-col">
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sold Out</span>
            </div>
          )}
          {product.stock > 0 && (
            <button
              onClick={(e) => handleAddToCart(e, product.id)}
              className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-primary/90 backdrop-blur-md border border-white/10 text-primary-foreground text-[10px] font-black uppercase py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-primary shadow-xl"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Quick Add
            </button>
          )}
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <p className="text-[9px] uppercase tracking-widest text-primary/60 mb-1 font-black">{product.category}</p>
          <h3 className="text-sm font-bold text-foreground line-clamp-1 mb-2 tracking-tight flex-1">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-foreground tracking-tighter">{formatPrice(product.price)}</span>
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">
              {product.stock > 0 ? `${product.stock} left` : "Out of Stock"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
