import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle, Package, RefreshCw, ShoppingCart, Star, XCircle } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

export default function InitiateReturn() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, navigate] = useLocation();
  const id = parseInt(orderId || "");

  const orderQuery = trpc.orders.getById.useQuery(id, { enabled: !isNaN(id) });
  const createReturnMutation = trpc.returns.create.useMutation();

  const [selectedItems, setSelectedItems] = useState<Record<number, { quantity: number; reason: string }>>({});
  const [generalReason, setGeneralReason] = useState("");
  const [step, setStep] = useState(1);

  if (isNaN(id)) return null;

  const handleToggleItem = (itemId: number, maxQty: number) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
      } else {
        next[itemId] = { quantity: 1, reason: "" };
      }
      return next;
    });
  };

  const handleUpdateQty = (itemId: number, qty: number, max: number) => {
    if (qty < 1 || qty > max) return;
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], quantity: qty }
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedItems).length === 0) {
      toast.error("Please select at least one item to return.");
      return;
    }
    if (!generalReason.trim()) {
      toast.error("Please provide a reason for the return.");
      return;
    }

    try {
      const items = Object.entries(selectedItems).map(([orderItemId, data]) => ({
        orderItemId: parseInt(orderItemId),
        quantity: data.quantity,
        reason: data.reason || generalReason,
      }));

      await createReturnMutation.mutateAsync({
        orderId: id,
        reason: generalReason,
        items,
      });

      toast.success("Return request submitted successfully!");
      navigate("/returns");
    } catch {
      toast.error("Failed to submit return request.");
    }
  };

  if (orderQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="skeleton h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  const order = orderQuery.data;
  if (!order || order.status !== "delivered") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">This order is not eligible for return.</p>
            <Link href="/returns"><a className="text-primary hover:underline">Back to returns</a></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/returns">
            <a className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors backdrop-blur-md">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </a>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Initiate Return</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Order #{order.id} &bull; Delivered {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Wizard Progress */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className={`p-1.5 rounded-full border-2 transition-all ${step >= 1 ? "border-primary bg-primary/20" : "border-white/10"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${step >= 1 ? "text-primary text-glow" : "text-muted-foreground"}`}>1</div>
          </div>
          <div className={`h-1 w-12 rounded-full ${step >= 2 ? "bg-primary glow-primary" : "bg-white/10"}`} />
          <div className={`p-1.5 rounded-full border-2 transition-all ${step >= 2 ? "border-primary bg-primary/20" : "border-white/10"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${step >= 2 ? "text-primary text-glow" : "text-muted-foreground"}`}>2</div>
          </div>
        </div>

        {step === 1 && (
          <div className="fade-up space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-foreground">Select Items</h2>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">{Object.keys(selectedItems).length} items selected</span>
            </div>
            
            <div className="grid gap-4">
              {order.items.map((item: any) => {
                const isSelected = !!selectedItems[item.id];
                return (
                  <div 
                    key={item.id} 
                    className={`glass-card rounded-2xl p-5 cursor-pointer transition-all duration-300 relative overflow-hidden group ${isSelected ? "border-primary glow-primary-sm ring-1 ring-primary/20" : "hover:border-primary/40"}`}
                    onClick={() => handleToggleItem(item.id, item.quantity)}
                  >
                    {isSelected && <div className="absolute inset-0 bg-primary/5 pointer-events-none" />}
                    <div className="relative z-10 flex items-center gap-5">
                      <div className="w-20 h-24 rounded-xl bg-background/60 overflow-hidden flex-shrink-0 border border-white/5">
                        {item.product?.imageUrl ? (
                          <img src={item.product?.imageUrl} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-7 h-7 text-white/10" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-foreground text-base leading-tight group-hover:text-primary transition-colors">{item.product?.name || `Product #${item.productId}`}</p>
                        <p className="text-xs font-black text-primary uppercase tracking-widest mt-1.5">${item.priceAtPurchase}</p>
                        
                        {isSelected && (
                          <div className="mt-4 flex items-center gap-4" onClick={e => e.stopPropagation()}>
                            <div className="bg-background/80 flex items-center gap-1.5 p-1 rounded-lg border border-white/10">
                              <button 
                                onClick={() => handleUpdateQty(item.id, selectedItems[item.id].quantity - 1, item.quantity)}
                                className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all font-black text-sm"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-black text-sm text-foreground">{selectedItems[item.id].quantity}</span>
                              <button 
                                onClick={() => handleUpdateQty(item.id, selectedItems[item.id].quantity + 1, item.quantity)}
                                className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all font-black text-sm"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Max {item.quantity} units</span>
                          </div>
                        )}
                      </div>
                      <div className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${isSelected ? "bg-primary border-primary glow-primary-sm" : "border-white/20 group-hover:border-primary/50"}`}>
                        {isSelected && <CheckCircle className="w-5 h-5 text-primary-foreground" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => { if (Object.keys(selectedItems).length > 0) setStep(2); else toast.error("Select at least one item"); }}
              className="w-full py-5 rounded-2xl bg-primary text-primary-foreground font-black text-sm tracking-widest uppercase hover:translate-y-[-2px] active:translate-y-[0px] hover:shadow-[0_0_40px_-10px_rgba(234,88,12,0.6)] transition-all glow-primary"
            >
              Continue to Reasons
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="fade-up space-y-6">
            <h2 className="text-xl font-black text-foreground">Why are you returning?</h2>
            <div className="space-y-6 glass-card rounded-3xl p-8">
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 opacity-70">Tell us what went wrong</p>
                <textarea 
                  placeholder="e.g. Sizing issue, damaged on arrival, color mismatch..."
                  value={generalReason}
                  onChange={e => setGeneralReason(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-black/40 border border-white/10 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none min-h-[160px] placeholder:text-white/20"
                />
              </div>

              <div className="bg-primary/5 p-5 rounded-2xl border border-primary/20 flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 fill-primary text-primary" />
                </div>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Your detailed feedback helps us drop better styles for the culture and optimize our fits.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-5 rounded-2xl border border-white/10 bg-white/5 text-foreground font-black text-sm tracking-widest uppercase hover:bg-white/10 active:scale-95 transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={createReturnMutation.isPending}
                className="flex-[2] py-5 rounded-2xl bg-primary text-primary-foreground font-black text-sm tracking-widest uppercase hover:translate-y-[-2px] active:translate-y-[0px] hover:shadow-[0_0_40px_-10px_rgba(234,88,12,0.6)] transition-all glow-primary disabled:opacity-50"
              >
                {createReturnMutation.isPending ? "Submitting..." : "Confirm Request"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
