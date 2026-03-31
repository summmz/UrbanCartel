import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Package, ChevronRight, Clock, ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { formatPrice } from "@/lib/currency";

const statusMap: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Pending",    cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  processing: { label: "Processing", cls: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  shipped:    { label: "Shipped",    cls: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  delivered:  { label: "Delivered",  cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  cancelled:  { label: "Cancelled",  cls: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const ordersQuery = trpc.orders.list.useQuery({ page: 0, limit: 50 }, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
            <p className="text-xl font-bold text-foreground mb-6">Sign in to view your orders</p>
            <a href={getLoginUrl()} className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest glow-primary transition-all">Sign In</a>
          </div>
        </div>
      </div>
    );
  }

  const orders = ordersQuery.data || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">My Orders</h1>
          <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">Full history of your streetwear acquisitions</p>
        </div>

        {ordersQuery.isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton rounded-3xl h-24" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Package className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
            <p className="text-lg font-black text-foreground tracking-tight mb-8">Your order history is a clean slate.</p>
            <Link href="/"><a className="px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest glow-primary transition-all active:scale-95">Start a New Drop</a></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const st = statusMap[order.status] || { label: order.status, cls: "" };
              return (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <a className="block glass-card rounded-[2rem] p-6 hover:border-primary/40 transition-all group relative overflow-hidden active:scale-[0.99] duration-200">
                    <div className="absolute inset-0 bg-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-500 shadow-2xl">
                          <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-black text-lg text-foreground tracking-tight group-hover:text-primary transition-colors">Order #{order.id}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 leading-none">
                              {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right flex flex-col items-end gap-2">
                          <p className="font-black text-xl text-foreground tracking-tighter leading-none">{formatPrice(order.totalPrice)}</p>
                          <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest leading-none shadow-sm ${st.cls}`}>{st.label}</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:translate-x-1 transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
