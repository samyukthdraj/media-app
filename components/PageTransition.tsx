"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function PageTransition() {
  const [isPresent, setIsPresent] = useState(true);

  useEffect(() => {
    // Start the opening animation shortly after the page renders
    const timer = setTimeout(() => setIsPresent(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Number of horizontal blinds
  // const blindsCount = typeof window !== 'undefined' ? Math.ceil(window.innerHeight / 40) : 25;
  const blinds = Array.from({ length: 25 }); // using fixed 25 to avoid hydration mismatch

  return (
    <AnimatePresence>
      {isPresent && (
        <div className="fixed inset-0 z-999 pointer-events-none flex flex-col">
          {blinds.map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.77, 0, 0.175, 1],
                delay: i * 0.03,
              }}
              style={{ originY: 0 }}
              className="flex-1 w-full bg-slate-50 border-b border-slate-200/50 shadow-sm"
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
