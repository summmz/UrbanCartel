import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Search, ShoppingCart, LayoutGrid, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatPrice } from "@/lib/currency";

export default function Shop() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [sort, setSort] = useState<'default' | 'newest' | 'price_asc' | 'price_desc'>('default');

  // Queries
  const productsQuery = trpc.products.list.useQuery({ 
    page: 0, 
    limit: 40, 
    search: search || undefined, 
    category: selectedCategory,
    sort: sort
  });
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="py-12 border-b border-white/5 bg-black/10 backdrop-blur-3xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight uppercase mb-2">The <span className="text-primary">Shop</span></h1>
              <p className="text-sm text-muted-foreground/60 uppercase tracking-widest font-black">Full Inventory Access</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select 
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="w-full appearance-none pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-white/10 transition-all"
                >
                  <option value="default" className="bg-background">Default</option>
                  <option value="newest" className="bg-background">Newest</option>
                  <option value="price_asc" className="bg-background">Price: Low to High</option>
                  <option value="price_desc" className="bg-background">Price: High to Low</option>
                </select>
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-48 flex-shrink-0">
              <div className="sticky top-24">
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[.2em]">Filters</span>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setSelectedCategory(undefined)}
                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left ${
                      selectedCategory === undefined
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 translate-x-2"
                        : "hover:bg-white/5 text-muted-foreground"
                    }`}
                  >
                    All Categories
                  </button>
                  {categoriesQuery.data?.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 translate-x-2"
                          : "hover:bg-white/5 text-muted-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsQuery.isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="skeleton rounded-3xl aspect-[3/4]" />
                  ))
                ) : productsQuery.data?.map((product, i) => (
                  <ProductGridCard 
                    key={product.id} 
                    product={product} 
                    i={i} 
                    handleAddToCart={handleAddToCart} 
                  />
                ))}
              </div>

              {!productsQuery.isLoading && productsQuery.data?.length === 0 && (
                <div className="text-center py-20 opacity-40">
                  <LayoutGrid className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">No products found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductGridCard({ product, i, handleAddToCart }: { product: any, i: number, handleAddToCart: any }) {
  return (
    <Link href={`/product/${product.id}`} style={{ animationDelay: `${i * 40}ms` }} className="group block product-card">
      <div className="glass-card rounded-[2rem] overflow-hidden hover:border-primary/50 transition-all duration-500 relative bg-black/20 backdrop-blur-3xl shadow-2xl h-full flex flex-col">
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
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
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{product.stock > 0 ? `${product.stock} left` : "Out of Stock"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
