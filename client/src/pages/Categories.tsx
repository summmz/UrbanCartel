import { trpc } from "@/lib/trpc";
import { Zap, TrendingUp, Sparkles, Tag, Ruler, LayoutGrid, ArrowRight, Footprints, HardHat, Waves, Sofa, ShoppingBag, Gem, Droplets } from "lucide-react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";

const CATEGORY_META: Record<string, { icon: any; desc: string; color: string; image: string }> = {
  "Hoodies": {
    icon: Zap,
    desc: "Heavyweight fleece, oversized silhouettes, and high-density detailing.",
    color: "from-amber-500/20 to-orange-500/10",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
  },
  "Tees": {
    icon: TrendingUp,
    desc: "Premium 240GSM cotton, dropped shoulders, and essential colorways.",
    color: "from-blue-500/20 to-cyan-500/10",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
  },
  "Outerwear": {
    icon: Sparkles,
    desc: "Engineered utility, water-resistant shells, and technical hardware.",
    color: "from-emerald-500/20 to-green-500/10",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
  },
  "Accessories": {
    icon: Tag,
    desc: "Refined essentials to complete the uniform.",
    color: "from-purple-500/20 to-pink-500/10",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800",
  },
  "Bottoms": {
    icon: Ruler,
    desc: "Tactical cargo, relaxed denim, and high-stretch joggers.",
    color: "from-rose-500/20 to-red-500/10",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800",
  },
  "Footwear": {
    icon: Footprints,
    desc: "Chunky soles, technical uppers, and collabs worth queuing for.",
    color: "from-sky-500/20 to-blue-500/10",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
  },
  "Headwear": {
    icon: HardHat,
    desc: "Caps, beanies, and bucket hats engineered for the streets.",
    color: "from-indigo-500/20 to-violet-500/10",
    image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=800",
  },
  "Knitwear": {
    icon: Waves,
    desc: "Chunky knits, open-weave textures, and premium yarns.",
    color: "from-teal-500/20 to-cyan-500/10",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
  },
  "Loungewear": {
    icon: Sofa,
    desc: "Cloud-soft sets built for staying in and still looking the part.",
    color: "from-pink-500/20 to-fuchsia-500/10",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
  },
  "Sale": {
    icon: Tag,
    desc: "Archive drops, sample surplus, and deadstock — heavily discounted.",
    color: "from-red-500/20 to-orange-500/10",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800",
  },
  "Bags": {
    icon: ShoppingBag,
    desc: "Technical packs, crossbody essentials, and everyday carry refined.",
    color: "from-stone-500/20 to-zinc-500/10",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
  },
  "Jewelry": {
    icon: Gem,
    desc: "Chains, rings, and layered pieces in gold-plated stainless steel.",
    color: "from-yellow-500/20 to-amber-500/10",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&q=80&w=800",
  },
  "Swimwear": {
    icon: Droplets,
    desc: "Quick-dry trunks, rash guards, and resort-ready layers.",
    color: "from-cyan-500/20 to-blue-500/10",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
  },
};

export default function Categories() {
  const [, setLocation] = useLocation();
  const categoriesQuery = trpc.products.categories.useQuery();

  const handleCategoryClick = (cat: string) => {
    setLocation(`/category/${encodeURIComponent(cat.toLowerCase())}`);
  };

  const allCats = categoriesQuery.data
    ? [
        ...Object.keys(CATEGORY_META).filter((k) => categoriesQuery.data!.includes(k)),
        ...categoriesQuery.data.filter((c) => !CATEGORY_META[c]),
      ]
    : Object.keys(CATEGORY_META);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground mb-6 uppercase">
            NAVIGATE<br />
            <span className="text-primary text-glow italic">COLLECTIONS</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto uppercase tracking-widest text-[10px] font-black opacity-40">
            Browse our core catalog by silhouette and utility
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {allCats.map((cat, i) => {
              const meta = CATEGORY_META[cat] || {
                icon: LayoutGrid,
                desc: "Discover the latest arrivals in our curated selection.",
                color: "from-white/10 to-transparent",
                image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
              };
              const Icon = meta.icon;

              return (
                <div
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  style={{ animationDelay: `${i * 100}ms` }}
                  className="glass-card group relative h-[400px] rounded-[3rem] overflow-hidden hover:border-primary/50 cursor-pointer transition-all duration-700 fade-up shadow-2xl"
                >
                  <div className="absolute inset-0 z-0">
                    <img
                      src={meta.image}
                      alt={cat}
                      className="w-full h-full object-cover opacity-60 grayscale-0 md:grayscale md:opacity-40 group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-60 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
                  </div>

                  <div className="absolute inset-0 z-20 p-10 flex flex-col justify-end">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground md:bg-primary/20 md:text-primary backdrop-blur-3xl border border-primary/40 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-xl group-hover:scale-110">
                        <Icon className="w-8 h-8" />
                      </div>
                      <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">{cat}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground/80 max-w-sm mb-8 leading-relaxed font-medium uppercase tracking-tight">
                      {meta.desc}
                    </p>
                    <div className="flex items-center gap-4 md:gap-2 text-primary text-[10px] font-black uppercase tracking-widest group-hover:gap-4 transition-all duration-500">
                      Explore Collection <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-0 group-hover:opacity-10 transition-opacity z-15 pointer-events-none`} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="py-20 text-center border-t border-white/5 bg-black/20">
        <Link href="/shop" className="text-xs text-primary font-black tracking-[0.4em] uppercase hover:underline">
          Visit the full armory
        </Link>
      </footer>
    </div>
  );
}
