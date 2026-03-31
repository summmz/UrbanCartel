import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);

  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const ring = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // Do not render custom cursor on touch devices
  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    if (isTouchDevice) return;

    // Hide default cursor on mount
    document.documentElement.classList.add("hide-cursor");

    const resetCursor = () => {
      ringRef.current?.classList.remove("!w-16", "!h-16", "bg-primary/20", "border-transparent");
      dotRef.current?.classList.remove("!w-1", "!h-1", "bg-white", "shadow-none");
      dotRef.current?.classList.add("shadow-[0_0_10px_2px_rgba(255,87,34,0.5)]");
    };

    const UI_SCALE = 0.8;
 
    const onMouseMove = (e: MouseEvent) => {
      // Divide by UI_SCALE because clientX/Y are in viewport pixels, 
      // but the cursor's positioning is in zoomed space.
      mouse.current = { x: e.clientX / UI_SCALE, y: e.clientY / UI_SCALE };
    };
    
    // Add hover states to links/buttons
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a") || target.closest("input") || target.closest("select") || target.classList.contains("cursor-pointer")) {
        ringRef.current?.classList.add("!w-16", "!h-16", "bg-primary/20", "border-transparent");
        dotRef.current?.classList.add("!w-1", "!h-1", "bg-white", "shadow-none");
        dotRef.current?.classList.remove("shadow-[0_0_10px_2px_rgba(255,87,34,0.5)]");
      }
    };
    
    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a") || target.closest("input") || target.closest("select") || target.classList.contains("cursor-pointer")) {
        resetCursor();
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("blur", resetCursor);
    window.addEventListener("scroll", resetCursor, { passive: true });
    
    // Reset on navigation
    const observer = new MutationObserver(resetCursor);
    observer.observe(document.body, { childList: true, subtree: false });

    const animate = () => {
      // The dot perfectly follows the mouse
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0) translate(-50%, -50%)`;
      }

      // The ring smoothly interpolates towards the mouse position
      ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%)`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove("hide-cursor");
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("blur", resetCursor);
      window.removeEventListener("scroll", resetCursor);
      observer.disconnect();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Outer trailing ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-primary/50 pointer-events-none z-[9999] flex items-center justify-center mix-blend-screen will-change-transform"
        style={{ transition: "width 0.3s, height 0.3s, background-color 0.3s, border-color 0.3s" }}
      />
      
      {/* Inner precise dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-primary pointer-events-none z-[10000] mix-blend-screen shadow-[0_0_10px_2px_rgba(255,87,34,0.5)] will-change-transform"
        style={{ transition: "width 0.3s, height 0.3s, background-color 0.3s, box-shadow 0.3s" }}
      />
    </>
  );
}
