"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function ReadingProgress() {
  const raw = useMotionValue(0);
  const scaleX = useSpring(raw, {
    stiffness: 300,
    damping: 50,
    restDelta: 0.0001,
  });

  useEffect(() => {
    let raf: number;

    function update() {
      const prose = document.querySelector(".prose");
      if (prose) {
        const rect = prose.getBoundingClientRect();
        const navH = 56;
        const vh = window.innerHeight;
        const range = rect.height - (vh - navH);
        if (range <= 0) {
          raw.set(1);
        } else {
          raw.set(Math.min(1, Math.max(0, (navH - rect.top) / range)));
        }
      }
      raf = requestAnimationFrame(update);
    }

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [raw]);

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-accent origin-left z-[60]"
    />
  );
}
