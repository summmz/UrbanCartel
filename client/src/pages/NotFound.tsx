import { Link } from "wouter";
import { Zap } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-32 px-4">
        <div className="text-center">
          <div className="text-8xl font-black text-primary/20 mb-4">404</div>
          <h1 className="text-2xl font-black text-foreground mb-2">Page not found</h1>
          <p className="text-muted-foreground mb-8 text-sm">The page you're looking for doesn't exist or has been moved.</p>
          <Link href="/">
            <a className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
              <Zap className="w-4 h-4" />
              Back to Shop
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
