import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

/**
 * Slim top-of-page progress bar that fires on every route change.
 * Entirely CSS-animated — no layout/paint cost on the page content.
 */
export default function RouteProgressBar() {
  const [location] = useLocation();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevLocation = useRef(location);

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const start = () => {
    clear();
    setWidth(0);
    setVisible(true);

    // Quickly advance to ~70% then stall, simulating a real load
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setWidth(72);
      });
    });

    // Auto-complete after 350 ms regardless (in case page is fast)
    timerRef.current = setTimeout(finish, 350);
  };

  const finish = () => {
    clear();
    setWidth(100);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 300); // let bar disappear after reaching 100%
  };

  useEffect(() => {
    if (location !== prevLocation.current) {
      prevLocation.current = location;
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "2.5px",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background:
            "linear-gradient(90deg, oklch(0.72 0.19 38), oklch(0.82 0.22 55), oklch(0.72 0.19 38))",
          backgroundSize: "200% 100%",
          transition:
            width === 100
              ? "width 0.2s ease-out"
              : "width 0.35s cubic-bezier(0.1, 0.6, 0.4, 1)",
          borderRadius: "0 2px 2px 0",
          boxShadow: "0 0 10px oklch(0.72 0.19 38 / 80%), 0 0 4px oklch(0.82 0.22 55 / 60%)",
          animation: "progressShimmer 1.2s linear infinite",
        }}
      />
      <style>{`
        @keyframes progressShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
