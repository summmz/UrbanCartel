import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Package, MapPin, CreditCard, Calendar, ArrowLeft, CheckCircle, Clock, Truck, XCircle, ChevronRight } from "lucide-react";
import { useParams, Link } from "wouter";
import Navbar from "@/components/Navbar";
import { formatPrice } from "@/lib/currency";

const statusMap: Record<string, { label: string; cls: string; icon: any }> = {
  pending:    { label: "Pending",    cls: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
  processing: { label: "Processing", cls: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Package },
  shipped:    { label: "Shipped",    cls: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Truck },
  delivered:  { label: "Delivered",  cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle },
  cancelled:  { label: "Cancelled",  cls: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const steps = ["pending","processing","shipped","delivered"];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const orderId = parseInt(id || "");
  const orderQuery = trpc.orders.getById.useQuery(orderId, { enabled: isAuthenticated && !isNaN(orderId) });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4 font-medium">Sign in to view order details</p>
            <a href={getLoginUrl()} className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest glow-primary transition-all">Sign In</a>
          </div>
        </div>
      </div>
    );
  }

  if (orderQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="container mx-auto px-4 py-10 space-y-6">
          <div className="skeleton rounded-3xl h-16 w-1/3" />
          <div className="skeleton rounded-3xl h-48" />
          <div className="grid grid-cols-3 gap-6">
            <div className="skeleton rounded-3xl h-64 col-span-2" />
            <div className="skeleton rounded-3xl h-64" />
          </div>
        </div>
      </div>
    );
  }

  const order = orderQuery.data as any;
  if (!order) return (
    <div className="min-h-screen bg-background"><Navbar />
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-destructive/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4 font-medium text-lg">Order not found</p>
          <Link href="/profile"><a className="text-primary hover:underline font-bold flex items-center gap-2 justify-center">Back to Profile <ChevronRight className="w-4 h-4" /></a></Link>
        </div>
      </div>
    </div>
  );

  const st = statusMap[order.status] || { label: order.status, cls: "", icon: Package };
  const StatusIcon = st.icon;
  const currentStep = steps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <Link href="/profile">
              <a className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all backdrop-blur-md">
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </a>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">Order #{order.id}</h1>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">
                {new Date(order.createdAt).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
          <div>
            <span className={`text-[10px] font-black px-4 py-2 rounded-full border uppercase tracking-widest flex items-center gap-2 shadow-lg ${st.cls}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {st.label}
            </span>
          </div>
        </div>

        {/* Progress tracker */}
        {order.status !== "cancelled" && (
          <div className="glass-card rounded-[2rem] p-8 mb-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-10 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Order Progress
            </h3>
            <div className="flex items-center relative h-16 px-4 mb-8">
              {/* Connecting Background Line Layer */}
              <div className="absolute top-[24px] left-[calc(1/8*100%)] right-[calc(1/8*100%)] h-1 bg-white/[0.03] rounded-full overflow-hidden -translate-y-1/2 pointer-events-none">
                <div 
                  className="h-full bg-primary transition-all duration-[1500ms] ease-out shadow-[0_0_15px_rgba(234,88,12,0.5)]" 
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {/* Steps Layer */}
              <div className="flex items-center justify-between w-full relative z-10">
                {steps.map((step, i) => {
                  const done = currentStep >= i;
                  const StepIcon = statusMap[step].icon;
                  return (
                    <div key={step} className="flex-1 flex flex-col items-center">
                      <div className="relative group">
                        <div 
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                            done ? "bg-primary border-primary glow-primary-sm shadow-[0_0_20px_rgba(234,88,12,0.3)]" : "bg-black/40 border-white/10 backdrop-blur-md"
                          } group-hover:scale-110 shadow-xl`}
                        >
                          <StepIcon className={`w-5 h-5 ${done ? "text-primary-foreground" : "text-muted-foreground"}`} />
                        </div>
                        
                        {/* Label */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-max text-center">
                          <p className={`text-[10px] font-black uppercase tracking-[0.12em] transition-colors ${done ? "text-primary text-glow-xs" : "text-muted-foreground/30"}`}>
                            {statusMap[step].label}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="h-6" /> {/* Extra padding for the bottom labels */}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 glass-card rounded-[2rem] p-8 overflow-hidden relative">
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 blur-[80px] -ml-24 -mb-24 pointer-events-none" />
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-8 flex items-center gap-2 relative z-10">
              <Package className="w-4 h-4 text-primary" />
              Items Ordered
            </h3>
            <div className="space-y-4 relative z-10">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-6 p-4 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-primary/30 transition-all group overflow-hidden relative">
                   <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="w-16 h-20 rounded-2xl bg-black/40 overflow-hidden flex-shrink-0 border border-white/10">
                    {item.product?.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-white/5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Link href={`/product/${item.productId}`}>
                      <a className="font-bold text-base text-foreground hover:text-primary transition-colors block mb-1">{item.product?.name || `Product #${item.productId}`}</a>
                    </Link>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Quantity: {item.quantity}</p>
                  </div>
                  <span className="font-black text-lg text-foreground tracking-tight px-4">{formatPrice(parseFloat(item.priceAtPurchase) * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side info */}
          <div className="space-y-6">
            {/* Total */}
            <div className="glass-card rounded-[2rem] p-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] -mr-16 -mt-16 pointer-events-none" />
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="font-black text-xs text-muted-foreground uppercase tracking-widest">Payment Summary</h3>
              </div>
              <div className="space-y-4 text-sm relative z-10">
                <div className="flex justify-between items-center"><span className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Subtotal</span><span className="font-bold text-foreground tracking-tight">{formatPrice(order.totalPrice)}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Shipping</span><span className="font-bold text-emerald-500 uppercase tracking-widest text-[10px]">Free</span></div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-foreground font-black uppercase tracking-widest text-xs">Total Amount</span>
                  <span className="text-2xl font-black text-primary tracking-tighter text-glow-primary">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Shipping */}
            {order.shippingAddress && (
              <div className="glass-card rounded-[2rem] p-8 overflow-hidden relative">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-[60px] -ml-16 -mb-16 pointer-events-none" />
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-black text-xs text-muted-foreground uppercase tracking-widest">Delivery Address</h3>
                </div>
                <div className="space-y-2 relative z-10">
                  <p className="text-foreground font-bold text-base leading-tight mb-4">{order.shippingAddress.fullName}</p>
                  <div className="space-y-1 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium uppercase tracking-wider">{order.shippingAddress.street}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium uppercase tracking-wider">{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                    {order.shippingAddress.phoneNumber && (
                      <div className="h-px bg-white/[0.03] my-2" />
                    )}
                    {order.shippingAddress.phoneNumber && (
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest">{order.shippingAddress.phoneNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
