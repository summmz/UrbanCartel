import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, MapPin, Package, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { formatPrice } from "@/lib/currency";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const cartQuery = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated });
  const addressesQuery = trpc.shippingAddresses.list.useQuery(undefined, { enabled: isAuthenticated });
  const updateMutation = trpc.cart.update.useMutation({ onSuccess: () => cartQuery.refetch() });
  const removeMutation = trpc.cart.remove.useMutation({ onSuccess: () => { cartQuery.refetch(); toast.success("Removed from cart"); } });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
            <p className="text-xl font-bold text-foreground mb-6">Sign in to view your cart</p>
            <a href={getLoginUrl()} className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest glow-primary transition-all">Sign In</a>
          </div>
        </div>
      </div>
    );
  }

  const items = cartQuery.data || [];
  const total = items.reduce((sum, item) => sum + (item.product ? parseFloat(item.product.price) * item.quantity : 0), 0);
  const addresses = addressesQuery.data || [];

  const handleQty = async (cartItemId: number, qty: number) => {
    if (qty === 0) { await removeMutation.mutateAsync(cartItemId); return; }
    await updateMutation.mutateAsync({ cartItemId, quantity: qty });
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) { toast.error("Select a shipping address"); return; }
    navigate(`/checkout/new?addressId=${selectedAddressId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Your Cart</h1>
          <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">Ready to synchronize your streetwear selection</p>
        </div>

        {cartQuery.isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton rounded-3xl h-24" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <ShoppingCart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
            <p className="text-lg font-black text-foreground tracking-tight mb-8">Your cart is echoing. Fill it with culture.</p>
            <Link href="/"><a className="px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest glow-primary transition-all active:scale-95">Start Shopping</a></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="glass-card rounded-[2rem] p-6 flex gap-6 items-center hover:border-primary/40 transition-all relative group overflow-hidden">
                  <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="w-24 h-28 rounded-2xl bg-black/40 overflow-hidden flex-shrink-0 border border-white/10 group-hover:scale-105 transition-transform duration-500">
                    {item.product?.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[20%] group-hover:grayscale-0" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-white/5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <Link href={`/product/${item.productId}`}>
                      <a className="font-black text-lg text-foreground hover:text-primary transition-colors block mb-1 tracking-tight leading-none">{item.product?.name}</a>
                    </Link>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mb-4">{item.product?.category}</p>
                    <p className="text-xl font-black text-foreground tracking-tighter">{formatPrice(item.product ? item.product.price : 0)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 relative z-10">
                    <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-black/20 border border-white/5">
                      <button onClick={() => handleQty(item.id, item.quantity - 1)} className="w-8 h-8 rounded-[10px] bg-white/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-black text-sm text-foreground">{item.quantity}</span>
                      <button onClick={() => handleQty(item.id, item.quantity + 1)} className="w-8 h-8 rounded-[10px] bg-white/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => removeMutation.mutate(item.id)} className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all ml-1 border border-transparent hover:border-destructive/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-6">
              {/* Address picker */}
              <div className="glass-card rounded-[2rem] p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Courier Logistics</h3>
                </div>
                {addresses.length === 0 ? (
                  <div className="text-center py-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] relative z-10">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 opacity-40">No locations synchronized</p>
                    <Link href="/profile"><a className="text-[10px] font-black text-primary hover:underline flex items-center justify-center gap-2 uppercase tracking-widest">Create Profile Logistics <ChevronRight className="w-3 h-3" /></a></Link>
                  </div>
                ) : (
                  <div className="space-y-3 relative z-10 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {addresses.map(addr => (
                      <button
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`w-full text-left p-5 rounded-2xl border transition-all relative group/addr active:scale-[0.98] ${selectedAddressId === addr.id ? "border-primary glow-primary-sm bg-primary/10" : "border-white/5 bg-white/[0.02] hover:border-primary/40"}`}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-black text-sm text-foreground tracking-tight">{addr.fullName}</p>
                          {addr.isDefault && <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase tracking-[0.2em]">Default</span>}
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] opacity-60 leading-relaxed text-glow-xs">{addr.street}, {addr.city}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Order total */}
              <div className="glass-card rounded-[2.5rem] p-8 overflow-hidden relative">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-[60px] -ml-16 -mb-16 pointer-events-none" />
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-8 relative z-10">Transaction Summary</h3>
                <div className="space-y-4 mb-10 relative z-10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground/60 font-black uppercase tracking-widest">Subtotal ({items.length})</span>
                    <span className="font-black text-foreground tracking-tight">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground/60 font-black uppercase tracking-widest">Sync & Shipping</span>
                    <span className="font-black text-emerald-500 uppercase tracking-widest text-[10px]">Free Drop</span>
                  </div>
                  <div className="h-px bg-white/10 my-4 shadow-[0_1px_0_rgba(255,255,255,0.05)]" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-black text-xs text-foreground uppercase tracking-[0.2em] relative">
                      Total
                    </span>
                    <span className="text-3xl font-black text-primary tracking-tighter text-glow-primary shadow-primary/20">{formatPrice(total)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={!selectedAddressId || items.length === 0}
                  className="w-full py-5 rounded-[1.5rem] bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:translate-y-[-2px] active:translate-y-[0] transition-all glow-primary disabled:opacity-20 disabled:cursor-not-allowed group/btn"
                >
                  Confirm Shipment
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                {!selectedAddressId && addresses.length > 0 && (
                  <p className="text-[9px] font-black text-primary text-center mt-6 uppercase tracking-widest animate-pulse">Waiting for logistics selection</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
