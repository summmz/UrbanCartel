import { trpc } from "@/lib/trpc";
import { Package, ArrowRight, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { formatPrice } from "@/lib/currency";

const statusMap: Record<string, { label: string; cls: string; icon: any }> = {
  pending: { label: "Pending Review", cls: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
  approved: { label: "Approved", cls: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: CheckCircle },
  rejected: { label: "Rejected", cls: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  received: { label: "Item Received", cls: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Package },
  refunded: { label: "Refunded", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle },
};

export default function Returns() {
  const returnsQuery = trpc.returns.listMy.useQuery({ page: 0, limit: 10 });
  const ordersQuery = trpc.orders.list.useQuery({ page: 0, limit: 10 });

  const eligibleOrders = ordersQuery.data?.filter((o: any) => o.status === "delivered") || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-1">Returns & Exchanges</h1>
            <p className="text-muted-foreground text-sm">Track your return requests and initiate new ones.</p>
          </div>
          <Link href="/help#returns" className="text-xs font-bold text-primary hover:underline">
            View Return Policy
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              Your Return Requests
            </h2>

            {returnsQuery.isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
              </div>
            ) : returnsQuery.data && returnsQuery.data.length > 0 ? (
              <div className="space-y-4">
                {returnsQuery.data.map((ret: any) => {
                  const s = statusMap[ret.status] || { label: ret.status, cls: "", icon: Clock };
                  const Icon = s.icon;
                  return (
                    <div key={ret.id} className="glass-card rounded-2xl p-5 hover:border-primary/40 transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 pointer-events-none" />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Return #{ret.id}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${s.cls}`}>
                                <Icon className="w-2.5 h-2.5" />
                                {s.label}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-foreground">Order #{ret.orderId}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Requested on {new Date(ret.createdAt).toLocaleDateString()}</p>
                          </div>
                          {ret.totalRefundAmount && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Refunded</p>
                              <p className="text-lg font-black text-primary">{formatPrice(ret.totalRefundAmount)}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 mb-4 border border-white/5">
                          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Reason</p>
                          <p className="text-sm text-foreground italic">"{ret.reason}"</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Status updated {new Date(ret.updatedAt).toLocaleDateString()}</span>
                          <button className="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            View Details <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card rounded-2xl py-12 text-center border-dashed">
                <RefreshCw className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm mb-2">No return requests found.</p>
                <p className="text-xs text-muted-foreground/60">If you're not happy with a purchase, you can initiate a return below.</p>
              </div>
            )}
          </div>

          {/* Sidebar - Eligible Orders */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Eligible for Return
            </h2>
            
            <div className="glass-card rounded-3xl p-6">
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                Only orders with the status <span className="text-foreground font-bold">Delivered</span> placed in the last 30 days are eligible for return.
              </p>

              {ordersQuery.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
                </div>
              ) : eligibleOrders.length > 0 ? (
                <div className="space-y-3">
                  {eligibleOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 transition-colors backdrop-blur-sm">
                      <div>
                        <p className="text-sm font-bold text-foreground">Order #{order.id}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(order.totalPrice)}</p>
                      </div>
                      <Link href={`/returns/initiate/${order.id}`}>
                        <a className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all">
                          Return
                        </a>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-muted-foreground">No eligible orders found for return at this time.</p>
                </div>
              )}
            </div>

            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Need help?</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">Our support squad is available 24/7 for return assistance.</p>
              <Link href="/help" className="text-xs font-bold text-foreground hover:text-primary transition-colors">Contact Support &rarr;</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
