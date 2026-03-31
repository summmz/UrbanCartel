import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { User, MapPin, Plus, Trash2, Edit2, Save, X, LogOut, Shield, Mail, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [addressForm, setAddressForm] = useState({ fullName: "", street: "", city: "", state: "", postalCode: "", country: "India", phoneNumber: "", isDefault: false });

  const PINCODE_MAP: Record<string, string> = {
    "11": "Delhi", "12": "Haryana", "13": "Haryana", "14": "Punjab", "15": "Punjab",
    "20": "Uttar Pradesh", "21": "Uttar Pradesh", "22": "Uttar Pradesh", "23": "Uttar Pradesh",
    "24": "Uttar Pradesh", "25": "Uttar Pradesh", "26": "Uttar Pradesh", "27": "Uttar Pradesh", "28": "Uttar Pradesh",
    "30": "Rajasthan", "31": "Rajasthan", "32": "Rajasthan", "33": "Rajasthan", "34": "Rajasthan",
    "36": "Gujarat", "37": "Gujarat", "38": "Gujarat", "39": "Gujarat",
    "40": "Maharashtra", "41": "Maharashtra", "42": "Maharashtra", "43": "Maharashtra", "44": "Maharashtra",
    "45": "Madhya Pradesh", "46": "Madhya Pradesh", "47": "Madhya Pradesh", "48": "Madhya Pradesh",
    "50": "Telangana", "51": "Andhra Pradesh", "52": "Andhra Pradesh", "53": "Andhra Pradesh",
    "56": "Karnataka", "57": "Karnataka", "58": "Karnataka", "59": "Karnataka",
    "60": "Tamil Nadu", "61": "Tamil Nadu", "62": "Tamil Nadu", "63": "Tamil Nadu", "64": "Tamil Nadu",
    "67": "Kerala", "68": "Kerala", "69": "Kerala",
    "70": "West Bengal", "71": "West Bengal", "72": "West Bengal", "73": "West Bengal", "74": "West Bengal",
    "80": "Bihar", "81": "Bihar", "82": "Bihar", "83": "Jharkhand", "84": "Bihar", "85": "Bihar"
  };

  const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", 
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", 
    "Lakshadweep", "Puducherry"
  ];

  const COUNTRIES = ["India", "USA", "UK", "Canada", "Australia", "UAE"];

  const addressesQuery = trpc.shippingAddresses.list.useQuery(undefined, { enabled: isAuthenticated });
  const createAddressMutation = trpc.shippingAddresses.create.useMutation();
  const deleteAddressMutation = trpc.shippingAddresses.delete.useMutation();
  const updateProfileMutation = trpc.profile.updateProfile.useMutation({
    onSuccess: () => { toast.success("Profile updated!"); setIsEditingProfile(false); },
    onError: (e) => toast.error(e.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <User className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Sign in to view your profile</p>
            <a href={getLoginUrl()} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Sign In</a>
          </div>
        </div>
      </div>
    );
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAddressMutation.mutateAsync(addressForm);
      toast.success("Address added!");
      setShowAddAddress(false);
      setAddressForm({ fullName: "", street: "", city: "", state: "", postalCode: "", country: "India", phoneNumber: "", isDefault: false });
      addressesQuery.refetch();
    } catch { toast.error("Failed to add address"); }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await deleteAddressMutation.mutateAsync(id);
      toast.success("Address removed");
      addressesQuery.refetch();
    } catch { toast.error("Failed to remove address"); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-black text-foreground mb-8 tracking-tight">Profile</h1>

        {/* Profile Card */}
        <div className="glass-card rounded-3xl p-8 mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />
          
          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shadow-xl">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground leading-tight tracking-tight">{user?.name || "User"}</p>
                <p className="text-sm text-muted-foreground font-medium opacity-60 tracking-wider uppercase text-[10px] mt-1">{user?.email}</p>
                {user?.role === "admin" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 mt-3 shadow-lg">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all backdrop-blur-md group/btn"
            >
              {isEditingProfile ? <X className="w-4 h-4 text-foreground" /> : <Edit2 className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />}
            </button>
          </div>

          {isEditingProfile && (
            <div className="border-t border-white/5 pt-8 space-y-6 fade-up relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Name", key: "name", type: "text", icon: User },
                  { label: "Email", key: "email", type: "email", icon: Mail },
                ].map(({ label, key, type, icon: Icon }) => (
                  <div key={key}>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block ml-1">{label}</label>
                    <div className="relative group/input">
                      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                      <input
                        type={type}
                        value={(profileForm as any)[key]}
                        onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/20 border border-white/10 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => updateProfileMutation.mutate(profileForm)}
                disabled={updateProfileMutation.isPending}
                className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest hover:translate-y-[-2px] active:translate-y-[0] transition-all glow-primary disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? "Syncing..." : "Save Identity"}
              </button>
            </div>
          )}
        </div>

        {/* Shipping Addresses */}
        <div className="glass-card rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mb-32 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Shipping Addresses</h2>
            </div>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition-all shadow-lg"
            >
              {showAddAddress ? <><X className="w-3.5 h-3.5" />Cancel</> : <><Plus className="w-3.5 h-3.5" />Add New</>}
            </button>
          </div>

          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 mb-8 space-y-4 fade-up relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase mb-2 ml-1 block tracking-wider">Full Name *</label>
                  <input
                    value={addressForm.fullName}
                    onChange={e => setAddressForm(f => ({ ...f, fullName: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-black/20 border border-white/10 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase mb-2 ml-1 block tracking-wider">Street *</label>
                  <input
                    value={addressForm.street}
                    onChange={e => setAddressForm(f => ({ ...f, street: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-black/20 border border-white/10 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase mb-2 ml-1 block tracking-wider">City *</label>
                  <input
                    value={addressForm.city}
                    onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-black/20 border border-white/10 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase mb-2 ml-1 block tracking-wider">Postal Code *</label>
                  <input
                    value={addressForm.postalCode}
                    onChange={e => {
                      const val = e.target.value;
                      setAddressForm(f => {
                        const next = { ...f, postalCode: val };
                        if (val.length >= 2 && PINCODE_MAP[val.substring(0, 2)]) {
                          next.state = PINCODE_MAP[val.substring(0, 2)];
                        }
                        return next;
                      });
                    }}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-black/20 border border-white/10 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase mb-2 ml-1 block tracking-wider">State *</label>
                  <select
                    value={addressForm.state}
                    onChange={e => setAddressForm(f => ({ ...f, state: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-black/20 border border-white/10 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-muted-foreground uppercase mb-2 ml-1 block tracking-wider">Country *</label>
                  <select
                    value={addressForm.country}
                    onChange={e => setAddressForm(f => ({ ...f, country: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-black/20 border border-white/10 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                  >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase mb-2 ml-1 block tracking-wider">Phone</label>
                  <input
                    value={addressForm.phoneNumber}
                    onChange={e => setAddressForm(f => ({ ...f, phoneNumber: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl bg-black/20 border border-white/10 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 text-xs font-bold text-foreground cursor-pointer group w-fit mt-2">
                <div className={`w-5 h-5 rounded-md border border-white/20 flex items-center justify-center transition-all ${addressForm.isDefault ? "bg-primary border-primary shadow-lg" : "group-hover:border-primary/50"}`}>
                  {addressForm.isDefault && <Save className="w-3 h-3 text-primary-foreground" />}
                  <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm(f => ({ ...f, isDefault: e.target.checked }))} className="hidden" />
                </div>
                Set as default address
              </label>
              <button type="submit" disabled={createAddressMutation.isPending} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest glow-primary hover:translate-y-[-2px] transition-all">
                {createAddressMutation.isPending ? "Validating..." : "Synchronize Address"}
              </button>
            </form>
          )}

          <div className="space-y-4 relative z-10">
            {addressesQuery.isLoading ? (
              <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="skeleton rounded-2xl h-24" />)}</div>
            ) : (addressesQuery.data || []).length === 0 ? (
              <div className="text-center py-12 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                <MapPin className="w-12 h-12 text-white/5 mx-auto mb-4" />
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest opacity-40">No logistics synced</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {(addressesQuery.data || []).map(addr => (
                  <div key={addr.id} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 group hover:border-primary/40 transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="flex items-start gap-5 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${addr.isDefault ? "bg-primary/10 border-primary/30 shadow-lg" : "bg-black/20 border-white/10"}`}>
                        <MapPin className={`w-6 h-6 ${addr.isDefault ? "text-primary" : "text-muted-foreground/20"}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <p className="font-black text-base text-foreground tracking-tight leading-none">{addr.fullName}</p>
                          {addr.isDefault && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-primary text-primary-foreground uppercase tracking-widest">Primary</span>}
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60 leading-relaxed">{addr.street}, {addr.city}</p>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 opacity-80">{addr.country} &bull; {addr.phoneNumber}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteAddress(addr.id)} 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all flex-shrink-0 relative z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <Link href="/orders">
            <a className="glass-card rounded-3xl p-8 flex items-center justify-between group hover:border-primary/40 transition-all overflow-hidden relative active:scale-95 duration-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -mr-16 -mt-16 pointer-events-none" />
              <div>
                <p className="text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors">My Orders</p>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1.5 opacity-60">View order history</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </Link>
          <button
            onClick={logout}
            className="glass-card rounded-3xl p-8 flex items-center justify-between group hover:border-destructive/40 transition-all overflow-hidden relative text-left active:scale-95 duration-200"
          >
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-destructive/5 blur-[50px] -mr-16 -mb-16 pointer-events-none" />
            <div>
              <p className="text-lg font-black text-foreground tracking-tight group-hover:text-destructive transition-colors">Sign Out</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1.5 opacity-60">End Terminal Session</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-destructive group-hover:text-white transition-all">
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
