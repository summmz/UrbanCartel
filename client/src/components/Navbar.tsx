import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Package, User, LayoutDashboard, LogOut, Menu, X, Sun, Moon, Zap } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme, switchable } = useTheme();

  const cartQuery = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated });
  const cartCount = cartQuery.data?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
  };

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-[80px]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group z-20"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-primary-sm group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Urban<span className="text-primary">Cartel</span>
            </span>
          </Link>

          {/* Desktop Nav - Centered */}
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2 z-10">
            <Link
              href="/"
              className={`nav-link text-[10px] font-black uppercase tracking-widest py-1 ${isActive("/") ? "active text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={`nav-link text-[10px] font-black uppercase tracking-widest py-1 ${isActive("/shop") ? "active text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Shop
            </Link>
            <Link
              href="/categories"
              className={`nav-link text-[10px] font-black uppercase tracking-widest py-1 ${isActive("/categories") ? "active text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Categories
            </Link>
            <Link
              href="/new-drops"
              className={`nav-link text-[10px] font-black uppercase tracking-widest py-1 ${isActive("/new-drops") ? "active text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Drops
            </Link>
            <Link
              href="/sale"
              className={`nav-link text-[10px] font-black uppercase tracking-widest py-1 ${isActive("/sale") ? "active text-destructive" : "text-destructive/60 hover:text-destructive transition-colors"}`}
            >
              Sale
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && (
              <div className="flex items-center border-r border-white/10 pr-4 mr-2 gap-4">
                <Link
                  href="/cart"
                  className={`relative p-2 rounded-lg hover:bg-white/5 transition-all ${isActive("/cart") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  title="Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/orders"
                  className={`p-2 rounded-lg hover:bg-white/5 transition-all ${location.startsWith("/orders") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  title="My Orders"
                >
                  <Package className="w-5 h-5" />
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className={`p-2 rounded-lg hover:bg-white/5 transition-all ${location.startsWith("/admin") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    title="Admin Dashboard"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                )}
              </div>
            )}

            {switchable && toggleTheme && (
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <User className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground font-black uppercase text-[10px] tracking-widest max-w-[100px] truncate">{user?.name || "Account"}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <a
                href={getLoginUrl()}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all glow-primary-sm"
              >
                Sign In
              </a>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/60 backdrop-blur-[80px]">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${isActive("/") ? "bg-primary text-primary-foreground" : "bg-white/5 text-foreground hover:bg-white/10"}`}
            >
              Home
            </Link>
            <Link
              href="/shop"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${isActive("/shop") ? "bg-primary text-primary-foreground" : "bg-white/5 text-foreground hover:bg-white/10"}`}
            >
              Shop
            </Link>
            <Link
              href="/categories"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${isActive("/categories") ? "bg-primary text-primary-foreground" : "bg-white/5 text-foreground hover:bg-white/10"}`}
            >
              Categories
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/new-drops"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-center px-4 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${isActive("/new-drops") ? "bg-primary text-primary-foreground" : "bg-white/5 text-foreground hover:bg-white/10"}`}
              >
                Drops
              </Link>
              <Link
                href="/sale"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-center px-4 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${isActive("/sale") ? "bg-destructive text-destructive-foreground" : "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"}`}
              >
                Sale
              </Link>
            </div>

            <div className="h-px bg-white/5 my-2" />

            {isAuthenticated ? (
              <>
                <Link
                  href="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-foreground hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider"
                >
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  Cart {cartCount > 0 && <span className="ml-auto bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">{cartCount}</span>}
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-foreground hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider"
                >
                  <Package className="w-4 h-4 text-primary" />
                  My Orders
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-foreground hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider"
                >
                  <User className="w-4 h-4 text-primary" />
                  Account Profile
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all text-xs font-bold uppercase tracking-wider"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Control
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all text-xs font-bold uppercase tracking-wider w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <a
                href={getLoginUrl()}
                className="mt-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest text-center shadow-lg"
              >
                Sign In to Shop
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
