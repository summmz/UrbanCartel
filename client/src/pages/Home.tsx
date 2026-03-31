import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Search, Undo2, ArrowRight, TrendingUp, ShoppingCart, PackageCheck, Ruler, Zap, Tag, Sparkles, LayoutGrid, Waves, Footprints, HardHat, Sofa, ShoppingBag, Gem, Droplets } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { formatPrice } from "@/lib/currency";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const productsRef = useRef<HTMLElement>(null);

  // Queries
  const productsQuery = trpc.products.list.useQuery({ page: 0, limit: 12, search: search || undefined, category: selectedCategory });
  const newDropsQuery = trpc.products.list.useQuery({ page: 0, limit: 12, sort: 'newest' });
  const saleQuery = trpc.products.list.useQuery({ page: 0, limit: 12, category: 'Sale' });
  const categoriesQuery = trpc.products.categories.useQuery();
  
  const addToCartMutation = trpc.cart.add.useMutation();

  const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    if (!isAuthenticated) { window.location.href = "/login"; return; }
    try {
      await addToCartMutation.mutateAsync({ productId, quantity: 1 });
      toast.success("Added to cart!");
    } catch { toast.error("Failed to add to cart"); }
  };

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") scrollToProducts();
  };

  const CATEGORY_ICONS: Record<string, any> = {
    "Hoodies": Zap,
    "Tees": TrendingUp,
    "Outerwear": Sparkles,
    "Accessories": Tag,
    "Bottoms": Ruler,
    "Footwear": Footprints,
    "Headwear": HardHat,
    "Knitwear": Waves,
    "Loungewear": Sofa,
    "Bags": ShoppingBag,
    "Jewelry": Gem,
    "Swimwear": Droplets,
    "Sale": Tag
  };

  const features = [
    { icon: Zap, label: "Exclusive Drops", desc: "Limited edition styles", color: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/20", iconColor: "text-amber-400", iconBg: "bg-amber-500/15" },
    { icon: Undo2, label: "Free Returns", desc: "30-day hassle-free returns", color: "from-blue-500/20 to-cyan-500/10", border: "border-blue-500/20", iconColor: "text-blue-400", iconBg: "bg-blue-500/15" },
    { icon: Ruler, label: "Size Guide", desc: "Perfect fit, every time", color: "from-emerald-500/20 to-green-500/10", border: "border-emerald-500/20", iconColor: "text-emerald-400", iconBg: "bg-emerald-500/15" },
    { icon: Waves, label: "Care & Wash", desc: "Keep it fresh forever", color: "from-blue-500/20 to-indigo-500/10", border: "border-blue-500/20", iconColor: "text-blue-400", iconBg: "bg-blue-500/15" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-6">
              <TrendingUp className="w-3 h-3" />
              New collection dropped
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-none mb-6 uppercase">
              DRESS THE<br />
              <span className="text-primary text-glow">STREETS</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Premium streetwear built for those who move differently. Curated drops, limited runs, zero compromise.
            </p>

            {/* Search bar */}
            <div className="relative max-w-lg mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search tees, hoodies, jackets, brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-11 pr-32 py-3.5 rounded-xl bg-black/20 backdrop-blur-xl border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
              />
              <button
                onClick={() => { setSearch(search); scrollToProducts(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-primary/80 backdrop-blur-md text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 border border-white/10"
              >
                Search <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={scrollToProducts} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/80 backdrop-blur-md text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all glow-primary border border-white/10">
                Shop Now <ArrowRight className="w-4 h-4" />
              </button>
              {isAuthenticated ? (
                <Link href="/orders" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-foreground font-semibold text-sm hover:bg-white/10 transition-all"><PackageCheck className="w-4 h-4" /> My Orders</Link>
              ) : (
                <Link href="/login" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-foreground font-semibold text-sm hover:bg-white/10 transition-all">Sign In to Shop</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature cards ────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-black/10 backdrop-blur-xl py-6 relative z-10 box-shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, label, desc, color, border, iconColor, iconBg }) => (
              <div key={label} className={`flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-br ${color} border border-white/10 backdrop-blur-2xl transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]`}>
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}><Icon className={`w-5 h-5 ${iconColor}`} /></div>
                <div><p className="text-sm font-bold text-foreground">{label}</p><p className="text-xs text-muted-foreground mt-0.5">{desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 1. Categories Section ────────────────────────────── */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 ml-1">Featured Categories</h2>
            <Link href="/categories" className="text-[9px] font-black uppercase text-primary tracking-widest hover:underline">View All Collections</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {(categoriesQuery.data || ["Hoodies", "Tees", "Outerwear", "Accessories", "Bottoms"]).map((cat) => {
              const Icon = CATEGORY_ICONS[cat] || LayoutGrid;
              return (
                <button
                  key={cat}
                  onClick={() => navigate(`/shop?category=${encodeURIComponent(cat)}`)}
                  className="glass-card aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 group hover:border-primary/40 transition-all relative overflow-hidden p-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/50">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 2. New Drops ────────────────────────────────────── */}
      <section className="py-12 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 ml-1">New Drops</h2>
            <Link href="/new-drops"><a className="text-[9px] font-black uppercase text-primary tracking-widest hover:underline">View All Drops</a></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {newDropsQuery.isLoading ? (
              [...Array(5)].map((_, i) => <div key={i} className="skeleton rounded-2xl aspect-[3/4]" />)
            ) : newDropsQuery.data?.slice(0, 5).map((product, i) => (
              <ProductGridCard key={product.id} product={product} i={i} handleAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Sale Selection ────────────────────────────────── */}
      {(saleQuery.data?.length || 0) > 0 && (
        <section className="py-12 border-t border-white/5 bg-destructive/[0.01]">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-destructive/40 ml-1">Sale</h2>
              <Link href="/sale"><a className="text-[9px] font-black uppercase text-destructive tracking-widest hover:underline">Explore Archive</a></Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {saleQuery.data?.slice(0, 5).map((product, i) => (
                <ProductGridCard key={product.id} product={product} i={i} handleAddToCart={handleAddToCart} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. All Clothing (Main Hub) ───────────────────────── */}
      <section className="py-12 border-t border-white/5 scroll-mt-20" ref={productsRef}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">
              {selectedCategory ? selectedCategory : "All Clothing"}
              {productsQuery.data && <span className="ml-2 text-sm font-normal text-muted-foreground">({productsQuery.data.length})</span>}
            </h2>
            <Link href="/shop"><a className="text-[9px] font-black uppercase text-primary tracking-widest hover:underline">Full Shop Experience</a></Link>
          </div>

          <div className="flex gap-2 flex-wrap mb-8">
            <button onClick={() => setSelectedCategory(undefined)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${selectedCategory === undefined ? "bg-primary text-primary-foreground shadow-lg" : "border border-border text-muted-foreground hover:border-primary/50"}`}>All</button>
            {categoriesQuery.data?.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${selectedCategory === cat ? "bg-primary text-primary-foreground shadow-lg" : "border border-border text-muted-foreground hover:border-primary/50"}`}>{cat}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {productsQuery.isLoading ? (
              [...Array(10)].map((_, i) => <div key={i} className="skeleton rounded-2xl aspect-[3/4]" />)
            ) : productsQuery.data?.map((product, i) => (
              <ProductGridCard key={product.id} product={product} i={i} handleAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-black/20 backdrop-blur-xl py-12 relative z-10 shadow-[0_-8px_32px_0_rgba(0,0,0,0.1)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center"><Zap className="w-3.5 h-3.5 text-primary-foreground" /></div>
                <span className="font-bold text-foreground">Urban<span className="text-primary">Cartel</span></span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">Premium streetwear for those who set the pace.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Shop</h4>
              <ul className="space-y-2">
                <li><Link href="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors text-left font-medium">Full Shop</Link></li>
                <li><Link href="/categories" className="text-sm text-muted-foreground hover:text-primary transition-colors text-left font-medium">Categories</Link></li>
                <li><Link href="/new-drops" className="text-sm text-muted-foreground hover:text-primary transition-colors text-left font-medium">New Drops</Link></li>
                <li><Link href="/sale" className="text-sm text-muted-foreground hover:text-primary transition-colors text-left font-medium">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Account</h4>
              <ul className="space-y-2">
                <li><Link href="/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors">My Orders</Link></li>
                <li><Link href="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">Help</h4>
              <ul className="space-y-2">
                <li><Link href="/help#size-guide" className="text-sm text-muted-foreground hover:text-primary transition-colors">Size Guide</Link></li>
                <li><Link href="/help#returns" className="text-sm text-muted-foreground hover:text-primary transition-colors">Returns</Link></li>
                <li><Link href="/help#care-washing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Care & Washing</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/60 pt-6 text-center text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em]">
            © 2026 UrbanCartel &bull; Built for the culture
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductGridCard({ product, i, handleAddToCart }: { product: any, i: number, handleAddToCart: any }) {
  return (
    <Link href={`/product/${product.id}`} style={{ animationDelay: `${i * 40}ms` }} className="group block product-card">
      <div className="bg-card/20 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><ShoppingCart className="w-8 h-8 text-muted-foreground/30" /></div>
          )}
          {product.stock === 0 && <div className="absolute inset-0 bg-background/70 flex items-center justify-center"><span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sold Out</span></div>}
          {product.stock > 0 && (
            <button onClick={(e) => handleAddToCart(e, product.id)} className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-primary/80 backdrop-blur-md border border-white/10 text-primary-foreground text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-primary/90">
              <ShoppingCart className="w-3 h-3" /> Quick Add
            </button>
          )}
        </div>
        <div className="p-4">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1 font-medium">{product.category}</p>
          <h3 className="text-xs font-semibold text-foreground line-clamp-1 mb-1">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
            <span className="text-[9px] text-muted-foreground">{product.stock > 0 ? `${product.stock} left` : ""}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
