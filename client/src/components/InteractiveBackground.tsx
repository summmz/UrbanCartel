import { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const BLOB_COUNT = 14;

const BLOB_COLORS = [
  "bg-primary/33",
  "bg-purple-500/33",
  "bg-blue-500/33",
  "bg-orange-500/22",
  "bg-emerald-500/22",
  "bg-indigo-500/22",
  "bg-rose-500/22",
  "bg-amber-500/33",
  "bg-violet-500/28",
  "bg-cyan-500/22",
  "bg-pink-500/28",
  "bg-teal-500/22",
  "bg-fuchsia-500/22",
  "bg-sky-500/28",
  "bg-lime-500/17",
  "bg-red-500/22",
  "bg-yellow-500/22",
  "bg-green-500/17",
];

type MotionGroup = "lissajous" | "diagonal" | "corner" | "edge" | "freeRoam";

interface BlobState {
  x: number;
  y: number;
  size: string;
  color: string;
  blur: string;
  speed: number;
  offset: number;
  group: MotionGroup;
  frequency: { x: number; y: number };
  drift: { x: number; y: number; angle: number; radius: number };
  lane: number;
  phase: number;
}

function assignGroup(i: number): MotionGroup {
  if (i % 5 === 0) return "corner";
  if (i % 5 === 1) return "edge";
  if (i % 5 === 2) return "diagonal";
  if (i % 5 === 3) return "freeRoam";
  return "lissajous";
}

export default function InteractiveBackground() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);
  const requestRef = useRef<number | undefined>(undefined);
  const time = useRef(0);

  const blobs = useRef<BlobState[]>(
    Array.from({ length: BLOB_COUNT }).map((_, i) => {
      const group = assignGroup(i);
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: `${10 + Math.random() * 22}vw`,
        color: BLOB_COLORS[i % BLOB_COLORS.length],
        blur: `${30 + Math.random() * 45}px`,
        speed: 0.002 + Math.random() * 0.009,
        offset: (i / BLOB_COUNT) * Math.PI * 2 + Math.random() * 0.5,
        group,
        frequency: {
          x: 0.2 + Math.random() * 0.7,
          y: 0.2 + Math.random() * 0.7,
        },
        drift: {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          angle: Math.random() * Math.PI * 2,
          radius: 120 + Math.random() * 280,
        },
        lane: i % 4,
        phase: Math.random() * Math.PI * 2,
      };
    })
  );

  useEffect(() => {
    const animate = () => {
      time.current += 0.0018;
      const W = window.innerWidth;
      const H = window.innerHeight;

      blobs.current.forEach((blob, i) => {
        const ref = blobRefs.current[i];
        if (!ref) return;

        const t = time.current + blob.offset;
        let targetX = blob.x;
        let targetY = blob.y;

        switch (blob.group) {
          case "lissajous": {
            // Anchored at different quadrants so blobs spread across full canvas
            const anchorX = W * (0.2 + (i % 3) * 0.3);
            const anchorY = H * (0.2 + (i % 4) * 0.2);
            targetX = anchorX + Math.sin(t * blob.frequency.x) * (W * 0.48);
            targetY = anchorY + Math.cos(t * blob.frequency.y) * (H * 0.46);
            break;
          }

          case "diagonal": {
            const diag = (i % 2 === 0);
            const progress = (Math.sin(t * blob.speed * 60 + blob.phase) + 1) / 2;
            if (diag) {
              targetX = progress * W * 1.05 - W * 0.025;
              targetY = progress * H * 1.05 - H * 0.025;
            } else {
              targetX = (1 - progress) * W * 1.05 - W * 0.025;
              targetY = progress * H * 1.05 - H * 0.025;
            }
            break;
          }

          case "corner": {
            const corners = [
              { x: 0, y: 0 },
              { x: W, y: 0 },
              { x: W, y: H },
              { x: 0, y: H },
            ];
            const c = corners[blob.lane];
            blob.drift.angle += blob.speed * 0.5;
            targetX = c.x + Math.cos(blob.drift.angle) * blob.drift.radius;
            targetY = c.y + Math.sin(blob.drift.angle) * blob.drift.radius;
            break;
          }

          case "edge": {
            const sweep = Math.sin(t * blob.frequency.x * 0.6 + blob.phase);
            if (blob.lane === 0) {
              targetX = W * 0.5 + sweep * W * 0.52;
              targetY = H * 0.05 + Math.cos(t * 0.4 + blob.offset) * H * 0.12;
            } else if (blob.lane === 1) {
              targetX = W * 0.95 + Math.cos(t * 0.4 + blob.offset) * W * 0.1;
              targetY = H * 0.5 + sweep * H * 0.52;
            } else if (blob.lane === 2) {
              targetX = W * 0.5 + sweep * W * 0.52;
              targetY = H * 0.95 + Math.cos(t * 0.4 + blob.offset) * H * 0.1;
            } else {
              targetX = W * 0.05 + Math.cos(t * 0.4 + blob.offset) * W * 0.12;
              targetY = H * 0.5 + sweep * H * 0.52;
            }
            break;
          }

          case "freeRoam": {
            blob.drift.angle += blob.speed * 0.3;
            blob.drift.x += Math.sin(t * 0.13 + blob.offset) * 0.6;
            blob.drift.y += Math.cos(t * 0.11 + blob.offset) * 0.6;
            // Gentle pull toward mid-page — not center, so they still roam
            blob.drift.x += (W * 0.5 - blob.drift.x) * 0.0002;
            blob.drift.y += (H * 0.5 - blob.drift.y) * 0.0002;
            targetX = blob.drift.x + Math.cos(blob.drift.angle) * blob.drift.radius;
            targetY = blob.drift.y + Math.sin(blob.drift.angle) * blob.drift.radius;
            break;
          }
        }

        blob.x += (targetX - blob.x) * blob.speed;
        blob.y += (targetY - blob.y) * blob.speed;

        const pulse = 1 + Math.sin(t * 0.55 + blob.offset) * 0.1;
        ref.style.transform = `translate3d(${blob.x}px, ${blob.y}px, 0) translate(-50%, -50%) scale(${pulse})`;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      blobs.current.forEach(blob => {
        blob.x = Math.random() * W;
        blob.y = Math.random() * H;
        blob.drift.x = Math.random() * W;
        blob.drift.y = Math.random() * H;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[-1] pointer-events-none overflow-hidden transition-colors duration-700 ${
        theme === "dark" ? "bg-black" : "bg-slate-50"
      }`}
    >
      {/* Subtle depth gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/4 to-transparent opacity-40" />

      {/* Dynamic Blobs */}
      {blobs.current.map((blob, i) => (
        <div
          key={i}
          ref={el => { blobRefs.current[i] = el; }}
          className={`absolute top-0 left-0 rounded-full mix-blend-multiply dark:mix-blend-screen will-change-transform ${blob.color} opacity-70 dark:opacity-100 transition-opacity duration-700`}
          style={{
            width: blob.size,
            height: blob.size,
            maxWidth: "650px",
            maxHeight: "650px",
            filter: `blur(${blob.blur})`,
          }}
        />
      ))}

      {/* Thinned frosted veil — reduced so blobs stay visible */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          theme === "dark"
            ? "bg-black/30 backdrop-blur-[24px]"
            : "bg-white/20 backdrop-blur-[20px]"
        }`}
      />

      {/* Subtle Noise Grain — uses a local data URI for stability */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3F%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]" />
    </div>
  );
}
