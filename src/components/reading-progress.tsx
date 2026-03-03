"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function ReadingProgress() {
  const progress = useMotionValue(0);
  const scaleX = useSpring(progress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    function handleScroll() {
      const prose = document.querySelector(".prose");
      if (!prose) return;

      const rect = prose.getBoundingClientRect();
      const navHeight = 56;
      const viewportHeight = window.innerHeight;
      const scrollableRange = rect.height - (viewportHeight - navHeight);

      if (scrollableRange <= 0) {
        progress.set(1);
        return;
      }

      const scrolled = navHeight - rect.top;
      progress.set(Math.min(1, Math.max(0, scrolled / scrollableRange)));
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [progress]);

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-accent origin-left z-[60]"
    />
  );
}
