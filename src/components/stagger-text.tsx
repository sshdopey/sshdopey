"use client";

import { motion } from "framer-motion";

export function StaggerText({
  text,
  className = "",
  staggerDelay = 0.04,
  initialDelay = 0,
}: {
  text: string;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: initialDelay + i * staggerDelay,
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
          }}
          className="inline-block"
          style={char === " " ? { width: "0.3em" } : undefined}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
