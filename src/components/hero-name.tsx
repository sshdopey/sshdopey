"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function MagneticLetter({
  char,
  index,
  mouseX,
  mouseY,
}: {
  char: string;
  index: number;
  mouseX: number | null;
  mouseY: number | null;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [proximity, setProximity] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    const run = () => {
      if (mouseX === null || mouseY === null || !ref.current) {
        setProximity(0);
        setOffsetY(0);
        setRotate(0);
        return;
      }
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const p = Math.max(0, 1 - dist / 160);
      setProximity(p);
      setOffsetY(p * -22);
      setRotate(p * (dx > 0 ? -12 : 12) * (1 - p * 0.4));
    };
    const id = setTimeout(run, 0);
    return () => clearTimeout(id);
  }, [mouseX, mouseY]);

  const wiggleDelay = index * 0.07;

  return (
    <motion.span
      ref={ref}
      initial={{
        opacity: 0,
        y: 60,
        rotate: index % 2 === 0 ? -15 : 15,
        scale: 0.5,
      }}
      animate={{
        opacity: 1,
        y: offsetY,
        rotate,
        scale: 1 + proximity * 0.15,
      }}
      transition={{
        opacity: { delay: wiggleDelay, duration: 0.4 },
        y:
          proximity > 0
            ? { type: "spring", stiffness: 180, damping: 12, mass: 0.8 }
            : {
                delay: wiggleDelay,
                type: "spring",
                stiffness: 200,
                damping: 10,
                mass: 1,
              },
        rotate:
          proximity > 0
            ? { type: "spring", stiffness: 180, damping: 12 }
            : {
                delay: wiggleDelay,
                type: "spring",
                stiffness: 200,
                damping: 8,
              },
        scale:
          proximity > 0
            ? { type: "spring", stiffness: 250, damping: 18 }
            : {
                delay: wiggleDelay,
                type: "spring",
                stiffness: 200,
                damping: 10,
              },
      }}
      className="inline-block origin-bottom"
      style={{
        color:
          proximity > 0.05
            ? `color-mix(in srgb, var(--color-accent) ${Math.round(proximity * 100)}%, var(--color-primary))`
            : "var(--color-primary)",
        textShadow:
          proximity > 0.15
            ? `0 0 ${Math.round(proximity * 50)}px rgba(200, 255, 0, ${(proximity * 0.6).toFixed(2)}), 0 ${Math.round(proximity * 6)}px ${Math.round(proximity * 25)}px rgba(200, 255, 0, ${(proximity * 0.15).toFixed(2)})`
            : "none",
      }}
    >
      {char}
    </motion.span>
  );
}

export function HeroName() {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState<number | null>(null);
  const name = "Dopey";

  return (
    <span
      ref={containerRef}
      className="relative cursor-default select-none"
      onMouseMove={(e) => {
        setMouseX(e.clientX);
        setMouseY(e.clientY);
      }}
      onMouseLeave={() => {
        setMouseX(null);
        setMouseY(null);
      }}
      aria-label={name}
    >
      {name.split("").map((char, i) => (
        <MagneticLetter
          key={i}
          char={char}
          index={i}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      ))}
    </span>
  );
}

export function HeroHandle() {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href="https://x.com/sshdopey"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
      className="font-mono text-xl sm:text-3xl lg:text-4xl text-accent tracking-wide font-medium relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.span
        animate={{
          y: hovered ? -4 : 0,
          scale: hovered ? 1.03 : 1,
          textShadow: hovered
            ? "0 0 30px rgba(200, 255, 0, 0.5), 0 0 60px rgba(200, 255, 0, 0.2), 0 4px 15px rgba(200, 255, 0, 0.1)"
            : "0 0 0px transparent",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="inline-block"
      >
        @sshdopey
      </motion.span>

      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="absolute -bottom-7 left-0 flex items-center gap-1.5 text-[10px] text-ghost font-sans tracking-normal font-normal whitespace-nowrap"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-muted"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Visit my X profile →
          </motion.span>
        )}
      </AnimatePresence>
    </motion.a>
  );
}
