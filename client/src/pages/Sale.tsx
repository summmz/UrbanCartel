import { trpc } from "@/lib/trpc";
import { ShoppingCart, Tag, LayoutGrid } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatPrice } from "@/lib/currency";

export default function Sale() {
  const { isAuthenticated } = useAuth();
  
  // Queries
  const saleQuery = trpc.products.list.useQuery({ 
    page: 0, 
    limit: 40, 
    category: 'Sale'
  });
  
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

      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-destructive/10 to-transparent">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-destructive/20 bg-destructive/5 text-destructive text-[10px] font-black tracking-[0.2em] uppercase mb-10 shadow-lg pulse-ring">
            <Tag className="w-3.5 h-3.5" />
            End of SZN Liquidation
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-foreground mb-6 uppercase">
            THE<br />
            <span className="text-destructive text-glow italic">ARCHIVE</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto uppercase tracking-widest text-[11px] font-black opacity-40 leading-relaxed">
            Final quantities of our core tactical collections. Once synchronized, they will not return.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {saleQuery.isLoading ? (
              Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="skeleton rounded-3xl aspect-[3/4]" />
              ))
            ) : saleQuery.data?.map((product, i) => (
              <ProductGridCard 
                key={product.id} 
                product={product} 
                i={i} 
                handleAddToCart={handleAddToCart} 
              />
            ))}
          </div>

          {!saleQuery.isLoading && saleQuery.data?.length === 0 && (
            <div className="text-center py-20 opacity-40">
              <LayoutGrid className="w-12 h-12 mx-auto mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">The archive is currently empty</p>
            </div>
          )}
        </div>
      </section>

      <footer className="py-20 text-center border-t border-white/5 bg-black/20">
        <Link href="/shop" className="text-xs text-primary font-black tracking-[0.4em] uppercase hover:underline">
          Return to standard inventory
        </Link>
      </footer>
    </div>
  );
}

function ProductGridCard({ product, i, handleAddToCart }: { product: any, i: number, handleAddToCart: any }) {
  return (
    <Link href={`/product/${product.id}`} style={{ animationDelay: `${i * 40}ms` }} className="group block product-card">
      <div className="glass-card rounded-[2rem] overflow-hidden hover:border-destructive/50 transition-all duration-500 relative bg-black/20 backdrop-blur-3xl shadow-2xl h-full flex flex-col">
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-[8px] font-black uppercase tracking-[.2em] px-3 py-1 rounded-full shadow-lg">
            Final Sale
          </div>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sold Out</span>
            </div>
          )}
          {product.stock > 0 && (
            <button
              onClick={(e) => handleAddToCart(e, product.id)}
              className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-destructive/90 backdrop-blur-md border border-white/10 text-destructive-foreground text-[10px] font-black uppercase py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-destructive shadow-xl"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Quick Add
            </button>
          )}
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <p className="text-[9px] uppercase tracking-widest text-destructive/60 mb-1 font-black">{product.category}</p>
          <h3 className="text-sm font-bold text-foreground line-clamp-1 mb-2 tracking-tight flex-1">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-foreground tracking-tighter">{formatPrice(product.price)}</span>
            <span className="text-[9px] font-black uppercase text-destructive tracking-widest">{product.stock > 0 ? `${product.stock} left` : "Out of Stock"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
