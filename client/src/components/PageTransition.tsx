import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "wouter";
import { useRef } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const [location] = useLocation();
  // Keep previous location so exit doesn't flash the new page
  const prevLocation = useRef(location);

  const isNewLocation = prevLocation.current !== location;
  if (isNewLocation) prevLocation.current = location;

  return (
    <div style={{ position: "relative", minHeight: "100%" }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 12 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
          exit={{
            opacity: 0,
            y: -8,
            transition: {
              duration: 0.18,
              ease: [0.4, 0, 1, 1],
            },
          }}
          style={{
            width: "100%",
            // During exit the element is absolute so it doesn't shift layout
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
