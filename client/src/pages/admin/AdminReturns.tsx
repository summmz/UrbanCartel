import { trpc } from "@/lib/trpc";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Eye, 
  MoreVertical,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  DollarSign
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { formatPrice } from "@/lib/currency";

const statusOptions = ["pending", "approved", "rejected", "received", "refunded"] as const;

const statusMap: Record<string, { label: string; cls: string; icon: any }> = {
  pending: { label: "Pending", cls: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
  approved: { label: "Approved", cls: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: CheckCircle },
  rejected: { label: "Rejected", cls: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  received: { label: "Received", cls: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Package },
  refunded: { label: "Refunded", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle },
};

export default function AdminReturns() {
  const [page] = useState(0);
  const returnsQuery = trpc.returns.adminListAll.useQuery({ page, limit: 20 });
  const updateStatusMutation = trpc.returns.adminUpdateStatus.useMutation();

  const [selectedReturnId, setSelectedReturnId] = useState<number | null>(null);
  const selectedReturnQuery = trpc.returns.getById.useQuery(selectedReturnId || 0, { enabled: !!selectedReturnId });
  const [refundAmount, setRefundAmount] = useState("");

  const handleUpdateStatus = async (returnId: number, status: typeof statusOptions[number]) => {
    try {
      await updateStatusMutation.mutateAsync({
        returnId,
        status,
        totalRefundAmount: status === "refunded" ? refundAmount : undefined,
      });
      toast.success(`Return #${returnId} status updated to ${status}`);
      returnsQuery.refetch();
      if (selectedReturnId === returnId) selectedReturnQuery.refetch();
    } catch {
      toast.error("Failed to update return status.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-1 text-xs font-bold text-primary uppercase tracking-widest">
          <TrendingDown className="w-3 h-3" />
          Admin Control
        </div>
        <h1 className="text-3xl font-black text-foreground mb-8">Returns Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Table */}
          <div className="lg:col-span-2 overflow-x-auto rounded-3xl border border-border/60 bg-card/20 backdrop-blur-xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-primary/5 text-[10px] font-bold uppercase tracking-widest text-primary border-b border-border/40">
                <tr>
                  <th className="px-6 py-4">ID / Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {returnsQuery.isLoading ? (
                  [1, 2, 3, 4].map(i => (
                    <tr key={i}><td colSpan={4} className="px-6 py-6"><div className="skeleton h-8 rounded-lg" /></td></tr>
                  ))
                ) : returnsQuery.data?.map((ret) => {
                  const s = statusMap[ret.status] || { label: ret.status, cls: "", icon: Clock };
                  const Icon = s.icon;
                  return (
                    <tr key={ret.id} className={`hover:bg-primary/5 transition-colors cursor-pointer ${selectedReturnId === ret.id ? "bg-primary/10" : ""}`} onClick={() => setSelectedReturnId(ret.id)}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground">#{ret.id}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(ret.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">User #{ret.userId}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Order #{ret.orderId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center w-fit gap-1 ${s.cls}`}>
                          <Icon className="w-2.5 h-2.5" />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Details Panel */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Return Details
            </h2>

            {selectedReturnId ? (
              selectedReturnQuery.isLoading ? (
                <div className="skeleton h-96 rounded-3xl" />
              ) : selectedReturnQuery.data ? (
                <div className="bg-card border border-border/60 rounded-3xl p-6 fade-up">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-foreground">Return #{selectedReturnQuery.data.id}</h3>
                    <Link href={`/orders/${selectedReturnQuery.data.orderId}`}>
                      <a className="text-[10px] font-bold text-primary uppercase hover:underline flex items-center gap-1">
                        Order Info <ExternalLink className="w-3 h-3" />
                      </a>
                    </Link>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Customer Reason</p>
                      <div className="bg-background/60 rounded-2xl p-4 border border-border/40">
                        <p className="text-sm text-foreground leading-relaxed">"{selectedReturnQuery.data.reason}"</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Items to Return</p>
                      <div className="space-y-2">
                        {selectedReturnQuery.data.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-border/40">
                            <span className="text-xs font-medium text-foreground">Item #{item.orderItemId}</span>
                            <span className="text-xs font-bold text-primary uppercase">Qty: {item.quantity}</span>
                          </div>
                      ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/40 space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Update Status</p>
                      <div className="grid grid-cols-2 gap-2">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            onClick={() => handleUpdateStatus(selectedReturnQuery.data!.id, status)}
                            className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                              selectedReturnQuery.data!.status === status
                                ? statusMap[status]?.cls + " border-primary glow-primary-sm"
                                : "border-border text-muted-foreground hover:border-primary/50"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>

                      {selectedReturnQuery.data.status === "refunded" && !selectedReturnQuery.data.totalRefundAmount ? (
                        <div className="mt-4 space-y-3">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Enter Refund Amount</p>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input 
                              placeholder="0.00"
                              value={refundAmount}
                              onChange={e => setRefundAmount(e.target.value)}
                              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          <button 
                            onClick={() => handleUpdateStatus(selectedReturnQuery.data!.id, "refunded")}
                            className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest"
                          >
                            Finalize Refund
                          </button>
                        </div>
                      ) : selectedReturnQuery.data.totalRefundAmount && (
                        <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Total Refunded</p>
                          <p className="text-2xl font-black text-emerald-500">{formatPrice(selectedReturnQuery.data.totalRefundAmount)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null
            ) : (
                <div className="bg-card/40 border border-dashed border-border/60 rounded-3xl py-20 text-center">
                <MoreVertical className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Select a return from the list<br />to view details and take action.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
