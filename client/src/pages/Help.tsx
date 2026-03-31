import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { Ruler, Undo2, Waves, Mail, ShieldCheck, Truck } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Help() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to section if hash is present
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  const sections = [
    {
      id: "size-guide",
      title: "Size Guide",
      icon: Ruler,
      content: (
        <div className="space-y-6">
          <p className="text-muted-foreground">Our streetwear is designed for a modern, relaxed fit. If you prefer a more tailored look, we recommend sizing down. If you want that classic oversized streetwear vibe, go true to size.</p>
          <div className="overflow-x-auto rounded-xl border border-border/60 bg-card/20">
            <table className="w-full text-sm text-left">
              <thead className="bg-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
                <tr>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Chest (in)</th>
                  <th className="px-4 py-3">Length (in)</th>
                  <th className="px-4 py-3">Shoulder (in)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {[
                  { s: "XS", c: "34-36", l: "26", sh: "16.5" },
                  { s: "S", c: "36-38", l: "27", sh: "17.5" },
                  { s: "M", c: "38-40", l: "28", sh: "18.5" },
                  { s: "L", c: "41-43", l: "29", sh: "19.5" },
                  { s: "XL", c: "44-46", l: "30", sh: "20.5" },
                  { s: "XXL", c: "47-49", l: "31", sh: "21.5" },
                ].map((row) => (
                  <tr key={row.s} className="hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3 font-bold text-foreground">{row.s}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.c}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.l}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.sh}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
            <p className="text-xs text-primary font-semibold flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Pro Tip: Standard streetwear fits are slightly larger than fast-fashion brands.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "returns",
      title: "Free Returns",
      icon: Undo2,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">Not the perfect fit? We've got you covered. UrbanCartel offers a <strong>30-day hassle-free return policy</strong> for all items in original condition.</p>
          <ul className="space-y-3">
            {[ 
              "Items must be unworn, unwashed, and have original tags.",
              "Return shipping is 100% free within India.",
              "Refunds are processed within 5-7 business days after we receive your package.",
              "Limited edition 'Drops' are eligible for exchange only, subject to stock."
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/returns">
              <a className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:translate-y-[-2px] transition-all glow-primary inline-block">
                Initiate a Return
              </a>
            </Link>
            <Link href="/returns">
              <a className="px-5 py-2.5 rounded-xl border border-border bg-card/40 text-foreground font-bold text-sm hover:bg-card/60 transition-all inline-block">
                Track Status
              </a>
            </Link>
          </div>
        </div>
      )
    },
    {
      id: "care-washing",
      title: "Care & Washing",
      icon: Waves,
      content: (
        <div className="space-y-6">
          <p className="text-muted-foreground">UrbanCartel pieces are crafted with premium heavyweight fabrics and high-density prints. To keep them looking fresh for years, follow these rules:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Wash Cold", desc: "Machine wash cold (30°C/85°F) with similar colors." },
              { title: "Inside Out", desc: "Turn garments inside out to protect high-density prints." },
              { title: "Air Dry", desc: "Hang dry or lay flat. Avoid high-heat tumble dryers." },
              { title: "Iron Low", desc: "If needed, iron on low. Never iron directly over graphics." }
            ].map((rule) => (
              <div key={rule.title} className="bg-card/20 border border-border/40 p-4 rounded-xl">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{rule.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{rule.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20">
            <p className="text-xs text-blue-400 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Quality Guarantee: Proper care extends the life of premium heavy-cotton fabrics by up to 3x.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground mb-6">
            HELP<br />
            <span className="text-primary text-glow">CENTER</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to know about size, returns, and maintaining your UrbanCartel pieces.</p>
        </div>
      </section>

      {/* Navigation shortcuts */}
      <section className="py-8 border-y border-border/40 bg-card/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 flex justify-center gap-4 flex-wrap">
          {sections.map(s => (
            <button 
              key={s.id}
              onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-2 rounded-full border border-border text-sm font-bold text-muted-foreground hover:border-primary hover:text-primary transition-all flex items-center gap-2"
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.title}
            </button>
          ))}
        </div>
      </section>

      {/* Sections */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl space-y-32">
          {sections.map((section) => (
            <div key={section.id} id={section.id} className="fade-up scroll-mt-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <section.icon className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-3xl font-black text-foreground">{section.title}</h2>
              </div>
              
              <div className="bg-card border border-border/60 rounded-3xl p-8 md:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Extra contact info */}
      <section className="py-20 bg-card/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-foreground mb-4">Still Have Questions?</h2>
          <p className="text-muted-foreground mb-8 text-sm">Our support squad is tactical. We reply to everything within 2 hours.</p>
          <div className="flex justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mb-1">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs font-bold text-foreground">Email Status</p>
              <p className="text-xs text-muted-foreground">support@urbancartel.pk</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mb-1">
                <Truck className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-xs font-bold text-foreground">Order Status</p>
              <p className="text-xs text-muted-foreground">Live 24/7 Tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer link back */}
      <footer className="py-10 text-center border-t border-border/30">
        <Link href="/" className="text-xs text-primary font-bold tracking-widest uppercase hover:underline">
          Back to storefront
        </Link>
      </footer>
    </div>
  );
}
