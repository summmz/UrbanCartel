import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart2,
  Plus, Trash2, Edit2, Save, X, AlertCircle, TrendingUp,
  DollarSign, Shield, ShieldOff, AlertTriangle, Check, ChevronDown
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { formatPrice } from "@/lib/currency";

type Tab = "overview" | "products" | "orders" | "inventory" | "users";

const statusOptions = ["pending","processing","shipped","delivered","cancelled"] as const;
const statusMap: Record<string, string> = {
  pending:"status-pending", processing:"status-processing",
  shipped:"status-shipped", delivered:"status-delivered", cancelled:"status-cancelled",
};

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: any; sub?: string }) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <p className="text-2xl font-black text-foreground">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-xs text-primary mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ name:"", description:"", price:"", category:"", stock:"0", sku:"", imageUrl:"" });

  const productsQuery = trpc.products.list.useQuery({ page: 0, limit: 100 });
  const ordersQuery = trpc.orders.list.useQuery({ page: 0, limit: 100 });
  const lowStockQuery = trpc.inventory.getLowStock.useQuery();
  const statsQuery = trpc.analytics.dashboard.useQuery(undefined, { enabled: activeTab === "overview" });
  const usersQuery = trpc.users.list.useQuery({ page: 0, limit: 100 }, { enabled: activeTab === "users" });

  const createProductMutation = trpc.products.create.useMutation();
  const deleteProductMutation = trpc.products.delete.useMutation();
  const updateProductMutation = trpc.products.update.useMutation();
  const updateOrderStatusMutation = trpc.orders.updateStatus.useMutation();
  const updateRoleMutation = trpc.users.updateRole.useMutation();

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-destructive/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Admin access required</p>
            <Link href="/"><a className="text-primary hover:underline text-sm">Back to Shop</a></Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProductMutation.mutateAsync({ ...productForm, stock: parseInt(productForm.stock) || 0 });
      toast.success("Product added!");
      setProductForm({ name:"", description:"", price:"", category:"", stock:"0", sku:"", imageUrl:"" });
      setShowAddProduct(false);
      productsQuery.refetch();
    } catch (err: any) { toast.error(err.message || "Failed"); }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await updateProductMutation.mutateAsync({ id: editingProduct.id, ...editingProduct, stock: parseInt(editingProduct.stock) || 0 });
      toast.success("Product updated!");
      setEditingProduct(null);
      productsQuery.refetch();
    } catch (err: any) { toast.error(err.message || "Failed"); }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProductMutation.mutateAsync(id);
      toast.success("Deleted"); productsQuery.refetch();
    } catch { toast.error("Failed to delete"); }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await updateOrderStatusMutation.mutateAsync({ orderId, status: status as any });
      toast.success("Status updated"); ordersQuery.refetch();
    } catch { toast.error("Failed to update"); }
  };

  const handleUpdateRole = async (userId: number, role: "user" | "admin") => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role });
      toast.success(`Role updated to ${role}`); usersQuery.refetch();
    } catch { toast.error("Failed"); }
  };

  const productFields = [
    { label:"Name", key:"name", required:true, span:2 },
    { label:"Price (₹)", key:"price", required:true, span:1 },
    { label:"Category", key:"category", required:true, span:1 },
    { label:"Stock", key:"stock", required:false, span:1 },
    { label:"SKU", key:"sku", required:false, span:1 },
    { label:"Image URL", key:"imageUrl", required:false, span:2 },
    { label:"Description", key:"description", required:false, span:2, textarea:true },
  ];

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id:"overview", label:"Overview", icon:LayoutDashboard },
    { id:"products", label:"Clothing", icon:Package },
    { id:"orders", label:"Orders", icon:ShoppingBag },
    { id:"inventory", label:"Inventory", icon:AlertTriangle },
    { id:"users", label:"Users", icon:Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Manage your store</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border/60 rounded-xl p-1 mb-8 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex-1 justify-center ${
                activeTab === id
                  ? "bg-primary text-primary-foreground glow-primary-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Revenue" value={statsQuery.data ? formatPrice(statsQuery.data.totalRevenue || "0", 0) : "—"} icon={DollarSign} />
              <StatCard label="Total Orders" value={statsQuery.data?.totalOrders ?? "—"} icon={ShoppingBag} />
              <StatCard label="Total Clothing" value={productsQuery.data?.length ?? "—"} icon={Package} />
              <StatCard label="Low Stock" value={lowStockQuery.data?.length ?? 0} icon={AlertTriangle} sub={lowStockQuery.data && lowStockQuery.data.length > 0 ? "Needs attention" : "All good"} />
            </div>

            {/* Recent orders preview */}
            <div className="bg-card border border-border/60 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Recent Orders</h3>
                <button onClick={() => setActiveTab("orders")} className="text-xs text-primary hover:underline">View all →</button>
              </div>
              <div className="space-y-2">
                {(ordersQuery.data || []).slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{formatPrice(order.totalPrice)}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${statusMap[order.status] || ""}`}>{order.status}</span>
                    </div>
                  </div>
                ))}
                {(ordersQuery.data || []).length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>}
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">{productsQuery.data?.length || 0} items</p>
              <button onClick={() => setShowAddProduct(!showAddProduct)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
                {showAddProduct ? <><X className="w-4 h-4" />Cancel</> : <><Plus className="w-4 h-4" />Add Item</>}
              </button>
            </div>

            {/* Add form */}
            {showAddProduct && (
              <form onSubmit={handleAddProduct} className="bg-card border border-primary/20 rounded-2xl p-5 mb-6 space-y-3">
                <h3 className="font-bold text-foreground mb-2">New Item</h3>
                <div className="grid grid-cols-2 gap-3">
                  {productFields.map(({ label, key, required, span, textarea }) => (
                    <div key={key} className={span === 2 ? "col-span-2" : ""}>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}{required && " *"}</label>
                      {textarea ? (
                        <textarea value={(productForm as any)[key]} onChange={e => setProductForm(f => ({ ...f, [key]: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                      ) : (
                        <input required={required} value={(productForm as any)[key]} onChange={e => setProductForm(f => ({ ...f, [key]: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      )}
                    </div>
                  ))}
                </div>
                <button type="submit" disabled={createProductMutation.isPending} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50">
                  {createProductMutation.isPending ? "Adding..." : "Add Item"}
                </button>
              </form>
            )}

            <div className="space-y-3">
              {productsQuery.isLoading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-20" />) :
              (productsQuery.data || []).map(product => (
                <div key={product.id}>
                  {editingProduct?.id === product.id ? (
                    <form onSubmit={handleSaveProduct} className="bg-card border border-primary/30 rounded-2xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {productFields.map(({ label, key, required, span, textarea }) => (
                          <div key={key} className={span === 2 ? "col-span-2" : ""}>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
                            {textarea ? (
                              <textarea value={editingProduct[key] || ""} onChange={e => setEditingProduct((p: any) => ({ ...p, [key]: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                            ) : (
                              <input value={editingProduct[key] || ""} onChange={e => setEditingProduct((p: any) => ({ ...p, [key]: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={updateProductMutation.isPending} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50">
                          <Save className="w-3.5 h-3.5" />{updateProductMutation.isPending ? "Saving..." : "Save"}
                        </button>
                        <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-2 rounded-xl border border-border text-muted-foreground text-sm hover:bg-muted flex items-center gap-2">
                          <X className="w-3.5 h-3.5" />Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-4 hover:border-border transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-muted-foreground/30" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{product.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-muted-foreground">{product.category}</span>
                          <span className="text-xs font-bold text-primary">{formatPrice(product.price)}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${product.stock <= 5 ? "status-cancelled" : "status-delivered"}`}>{product.stock} in stock</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => setEditingProduct({ ...product, stock: String(product.stock), price: product.price })} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div className="space-y-3">
            {ordersQuery.isLoading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-20" />) :
            (ordersQuery.data || []).map(order => (
              <div key={order.id} className="bg-card border border-border/60 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground text-sm">Order #{order.id}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${statusMap[order.status] || ""}`}>{order.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.createdAt).toLocaleDateString()} · {formatPrice(order.totalPrice)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    <Link href={`/orders/${order.id}`}>
                      <a className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">View</a>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {(ordersQuery.data || []).length === 0 && !ordersQuery.isLoading && (
              <div className="text-center py-12 bg-card/40 border border-border/40 rounded-2xl text-muted-foreground text-sm">No orders yet</div>
            )}
          </div>
        )}

        {/* Inventory */}
        {activeTab === "inventory" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <div className="bg-card border border-border/60 rounded-2xl p-5">
                <p className="text-2xl font-black text-foreground">{lowStockQuery.data?.length || 0}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Low stock items</p>
              </div>
              <div className="bg-card border border-border/60 rounded-2xl p-5">
                <p className="text-2xl font-black text-foreground">{(productsQuery.data || []).filter(p => p.stock === 0).length}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Out of stock</p>
              </div>
            </div>

            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" /> Low Stock Alerts
            </h3>
            <div className="space-y-2">
              {lowStockQuery.isLoading ? [...Array(3)].map((_, i) => <div key={i} className="skeleton rounded-xl h-14" />) :
              (lowStockQuery.data || []).length === 0 ? (
                <div className="text-center py-10 bg-card/40 border border-border/40 rounded-2xl">
                  <Check className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">All items are well stocked</p>
                </div>
              ) : (lowStockQuery.data || []).map((item: any) => (
                <div key={item.id} className="bg-card border border-destructive/20 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{item.product?.name || `Item #${item.productId}`}</p>
                    <p className="text-xs text-muted-foreground">SKU: {item.product?.sku || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black ${item.quantity <= 0 ? "text-destructive" : "text-yellow-500"}`}>{item.quantity}</span>
                    <p className="text-[10px] text-muted-foreground">units left</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="space-y-3">
            {usersQuery.isLoading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-16" />) :
            (usersQuery.data?.users || []).map((u: any) => (
              <div key={u.id} className="bg-card border border-border/60 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{(u.name || u.email || "?")[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{u.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${u.role === "admin" ? "status-processing" : "border-border text-muted-foreground"}`}>
                    {u.role}
                  </span>
                  {u.id !== user?.id && (
                    <button
                      onClick={() => handleUpdateRole(u.id, u.role === "admin" ? "user" : "admin")}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                    >
                      {u.role === "admin" ? <><ShieldOff className="w-3 h-3" />Demote</> : <><Shield className="w-3 h-3" />Promote</>}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {(usersQuery.data?.users || []).length === 0 && !usersQuery.isLoading && (
              <div className="text-center py-12 text-muted-foreground text-sm">No users found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
