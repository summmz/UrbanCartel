import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Zap } from "lucide-react";

/**
 * Full-screen loader that covers page transitions.
 *
 * Timing model (no fade-IN — instant cover to prevent flash):
 *   0ms   → location changes → overlay goes to opacity:1 immediately
 *   350ms → start fade-out (opacity → 0 over 220ms)
 *   570ms → unmount
 *
 * This guarantees the new page is never visible before the loader.
 */
export default function PageLoader() {
  const [location] = useLocation();
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const prevLocation = useRef(location);
  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAll = () => {
    if (t1.current) clearTimeout(t1.current);
    if (t2.current) clearTimeout(t2.current);
  };

  useEffect(() => {
    if (location === prevLocation.current) return;
    prevLocation.current = location;

    clearAll();

    // 1. Show instantly — no delay, no fade-in
    setFadingOut(false);
    setVisible(true);

    // 2. After 350ms start fading out
    t1.current = setTimeout(() => setFadingOut(true), 350);

    // 3. After fade-out completes, unmount
    t2.current = setTimeout(() => {
      setVisible(false);
      setFadingOut(false);
    }, 580);

    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        // Instant on — only transition when fading OUT
        opacity: fadingOut ? 0 : 1,
        transition: fadingOut ? "opacity 0.22s ease-in" : "none",
        background: "oklch(0.04 0.006 260 / 88%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <style>{`
        @keyframes uc-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes uc-spin-rev {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes uc-pulse-glow {
          0%, 100% { box-shadow: 0 0 24px oklch(0.72 0.19 38 / 60%), 0 0 60px oklch(0.72 0.19 38 / 20%); }
          50%       { box-shadow: 0 0 36px oklch(0.72 0.19 38 / 90%), 0 0 90px oklch(0.72 0.19 38 / 35%); }
        }
        @keyframes uc-dot-orbit {
          from { transform: rotate(var(--start)) translateX(46px) rotate(calc(-1 * var(--start))); }
          to   { transform: rotate(calc(var(--start) + 360deg)) translateX(46px) rotate(calc(-1 * (var(--start) + 360deg))); }
        }
        @keyframes uc-shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>

        {/* ── Ring stack ── */}
        <div style={{ position: "relative", width: "100px", height: "100px" }}>

          {/* Outer slow ring */}
          <div style={{
            position: "absolute", inset: 0,
            borderRadius: "50%",
            border: "1.5px solid oklch(0.72 0.19 38 / 25%)",
            animation: "uc-spin 4s linear infinite",
          }} />

          {/* Mid fast arc */}
          <div style={{
            position: "absolute", inset: "8px",
            borderRadius: "50%",
            border: "2px solid transparent",
            borderTop: "2px solid oklch(0.82 0.22 55 / 85%)",
            borderRight: "2px solid oklch(0.72 0.19 38 / 40%)",
            animation: "uc-spin 1.1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }} />

          {/* Inner counter-spin */}
          <div style={{
            position: "absolute", inset: "18px",
            borderRadius: "50%",
            border: "1.5px solid transparent",
            borderBottom: "1.5px solid oklch(0.72 0.19 38 / 65%)",
            borderLeft: "1.5px solid oklch(0.82 0.22 55 / 30%)",
            animation: "uc-spin-rev 0.85s linear infinite",
          }} />

          {/* Orbiting dots */}
          {([0, 120, 240] as const).map((deg, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%", left: "50%",
                width: "5px", height: "5px",
                marginTop: "-2.5px", marginLeft: "-2.5px",
                borderRadius: "50%",
                background: i === 0
                  ? "oklch(0.72 0.19 38)"
                  : `oklch(0.72 0.19 38 / ${70 - i * 20}%)`,
                // @ts-expect-error custom CSS property
                "--start": `${deg}deg`,
                animation: `uc-dot-orbit ${1.1 + i * 0.15}s linear infinite`,
                boxShadow: i === 0 ? "0 0 6px oklch(0.72 0.19 38 / 80%)" : "none",
              }}
            />
          ))}

          {/* Zap badge centre */}
          <div style={{
            position: "absolute", inset: "26px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, oklch(0.15 0.01 260), oklch(0.10 0.008 260))",
            border: "1px solid oklch(0.72 0.19 38 / 35%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "uc-pulse-glow 2s ease-in-out infinite",
          }}>
            <Zap style={{
              width: "20px", height: "20px",
              color: "oklch(0.72 0.19 38)",
              filter: "drop-shadow(0 0 6px oklch(0.72 0.19 38 / 80%))",
            }} />
          </div>
        </div>

        {/* ── Brand text ── */}
        <div style={{ textAlign: "center", lineHeight: 1 }}>
          <div style={{
            fontFamily: "'Inter', 'system-ui', sans-serif",
            fontSize: "15px",
            fontWeight: 900,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            background: "linear-gradient(90deg, oklch(0.72 0.19 38), oklch(0.88 0.18 55), oklch(0.72 0.19 38))",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "uc-shimmer 2s linear infinite",
          }}>
            UrbanCartel
          </div>
          <div style={{
            marginTop: "5px",
            fontSize: "8px",
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            color: "oklch(0.45 0.01 260)",
            fontWeight: 600,
          }}>
            Loading
          </div>
        </div>

      </div>
    </div>
  );
}
