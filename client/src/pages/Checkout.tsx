import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Lock, CreditCard, Package, ArrowLeft, CheckCircle, ShieldCheck, Wallet } from "lucide-react";
import { useParams, useLocation, Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { formatPrice } from "@/lib/currency";

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const addressId = parseInt(searchParams.get("addressId") || "0");

  const [paymentMethod, setPaymentMethod] = useState<"mock_card" | "cod">("mock_card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({ cardNumber: "", expiry: "", cvc: "", name: "" });

  // Queries
  const isNew = id === "new";
  const orderId = parseInt(id || "");
  
  const orderQuery = trpc.orders.getById.useQuery(orderId, { enabled: isAuthenticated && !isNew && !isNaN(orderId) });
  const cartQuery = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated && isNew });
  const addressQuery = trpc.shippingAddresses.list.useQuery(undefined, { enabled: isAuthenticated && isNew });

  const createOrder = trpc.orders.create.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Lock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Sign in to complete checkout</p>
            <a href={getLoginUrl()} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Sign In</a>
          </div>
        </div>
      </div>
    );
  }

  if ((isNew && (cartQuery.isLoading || addressQuery.isLoading)) || (!isNew && orderQuery.isLoading)) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="container mx-auto px-4 py-10 space-y-4 max-w-2xl">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-20" />)}
        </div>
      </div>
    );
  }

  // --- Success State ---
  if (!isNew && orderQuery.data) {
    const order = orderQuery.data;
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center fade-up">
            <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6 glow-primary">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground mb-2">Order #{order.id} has been placed successfully.</p>
            <p className="text-xs text-muted-foreground mb-8">You'll receive an update when it ships.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/orders"><a className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">View Orders</a></Link>
              <Link href="/"><a className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground font-semibold text-sm hover:bg-muted transition-colors">Keep Shopping</a></Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- New Checkout State ---
  const cartItems = cartQuery.data || [];
  const addresses = addressQuery.data || [];
  const selectedAddress = addresses.find(a => a.id === addressId);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="flex items-center justify-center py-32 text-center text-muted-foreground">Cart is empty <Link href="/cart"><a className="text-primary hover:underline ml-2">Go back</a></Link></div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.product?.price || "0") * item.quantity), 0);
  const tax = subtotal * 0.1;
  const codFee = paymentMethod === "cod" ? (29 / 84) : 0; // standard equivalent
  const total = subtotal + tax + codFee;

  const handleCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedAddress) {
      toast.error("Invalid shipping address");
      return;
    }

    setIsProcessing(true);
    try {
      if (paymentMethod === "mock_card") {
        // Native Mock Loading Simulation
        await new Promise(r => setTimeout(r, 1800));
      }

      const order = await createOrder.mutateAsync({
         shippingAddressId: selectedAddress.id,
         paymentMethod: paymentMethod
      });
      
      toast.success("Order placed successfully! 🎉");
      navigate(`/checkout/${order.id}`);

    } catch (error: any) {
      toast.error(error.message || "Checkout failed");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/cart"><a className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"><ArrowLeft className="w-4 h-4" /></a></Link>
          <h1 className="text-2xl font-black text-foreground">Complete Order</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment form */}
          <div className="bg-card border border-border/60 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-foreground">Payment Method</h2>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Secure check
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 mb-2">
                <button 
                  onClick={() => setPaymentMethod("mock_card")}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${paymentMethod === 'mock_card' ? 'border-primary bg-primary/10' : 'border-border/60 hover:border-primary/50 bg-background'}`}
                >
                  <CreditCard className={`w-6 h-6 ${paymentMethod === 'mock_card' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-foreground">Pay with Card</h3>
                  </div>
                </button>

                <button 
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${paymentMethod === 'cod' ? 'border-primary bg-primary/10' : 'border-border/60 hover:border-primary/50 bg-background'}`}
                >
                  <Wallet className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-foreground">Cash on Delivery</h3>
                    <p className="text-[10px] text-muted-foreground">Pay ₹29 extra</p>
                  </div>
                </button>
              </div>

              {paymentMethod === "mock_card" ? (
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4 fade-in">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Cardholder Name</label>
                    <input
                      placeholder="John Doe"
                      value={cardData.name}
                      onChange={e => setCardData(d => ({ ...d, name: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Card Number</label>
                    <input
                      placeholder="1234 5678 9012 3456"
                      value={cardData.cardNumber}
                      onChange={e => {
                        const v = e.target.value.replace(/\s/g, "");
                        if (v.length <= 16) setCardData(d => ({ ...d, cardNumber: v.replace(/(\d{4})/g, "$1 ").trim() }));
                      }}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono tracking-wider transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Expiry</label>
                      <input
                        placeholder="MM/YY"
                        value={cardData.expiry}
                        onChange={e => {
                          let v = e.target.value.replace(/\D/g, "");
                          if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                          setCardData(d => ({ ...d, expiry: v }));
                        }}
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">CVC</label>
                      <input
                        placeholder="•••"
                        type="password"
                        value={cardData.cvc}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, "");
                          if (v.length <= 4) setCardData(d => ({ ...d, cvc: v }));
                        }}
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono transition-all"
                      />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/8 border border-primary/20 text-xs text-primary/80">
                    🧪 Demo mode — use test card: <span className="font-mono font-bold">4242 4242 4242 4242</span>
                  </div>
                </form>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-border/60 bg-white/[0.02] text-center fade-in">
                  <Wallet className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-foreground font-medium mb-1">Cash on Delivery selected.</p>
                  <p className="text-xs text-muted-foreground">Please have exact change available when the courier arrives.</p>
                </div>
              )}

              <button
                type="submit"
                form={paymentMethod === "mock_card" ? "checkout-form" : undefined}
                onClick={paymentMethod === "cod" ? () => handleCheckout() : undefined}
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all glow-primary disabled:opacity-50 mt-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <Lock className="w-4 h-4" />
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : `Place Order • ${formatPrice(total)}`}
              </button>
            </div>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="bg-card border border-border/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-foreground">Order Summary</h2>
              </div>
              <div className="space-y-2 mb-4 h-max max-h-[30vh] overflow-y-auto custom-scrollbar pr-2">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black/40 overflow-hidden flex-shrink-0">
                         {item.product?.imageUrl ? <img src={item.product.imageUrl} className="w-full h-full object-cover" alt="" /> : <Package className="w-4 h-4 text-muted-foreground/30 m-auto mt-3" />}
                       </div>
                       <span className="text-muted-foreground font-medium">{item.product?.name} <span className="opacity-50 px-1">×</span> {item.quantity}</span>
                    </div>
                    <span className="text-foreground font-medium">{formatPrice(parseFloat(item.product?.price || "0") * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/40 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Tax (10%)</span><span>{formatPrice(tax)}</span></div>
                {paymentMethod === "cod" && (
                  <div className="flex justify-between text-amber-500 font-medium"><span>COD Surcharge</span><span>{formatPrice(codFee)}</span></div>
                )}
                <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="text-emerald-500">Free</span></div>
                <div className="flex justify-between font-black text-lg text-foreground border-t border-border/40 pt-3 mt-2">
                  <span>Total</span>
                  <span className="text-primary glow-primary-sm">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {selectedAddress && (
              <div className="bg-card border border-border/60 rounded-2xl p-5">
                <h3 className="font-bold text-foreground text-sm mb-3">Shipping To</h3>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p className="text-foreground font-medium">{selectedAddress.fullName}</p>
                  <p>{selectedAddress.street}, {selectedAddress.postalCode}</p>
                  <p>{selectedAddress.city}, {selectedAddress.country}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
