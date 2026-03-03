"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

function MagneticLetter({
  char,
  index,
  mouseX,
  mouseY,
  containerRect,
}: {
  char: string;
  index: number;
  mouseX: number | null;
  mouseY: number | null;
  containerRect: DOMRect | null;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [proximity, setProximity] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    if (mouseX === null || mouseY === null || !ref.current || !containerRect) {
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
    const p = Math.max(0, 1 - dist / 150);

    setProximity(p);
    setOffsetY(p * -18);
    setRotate(p * (dx > 0 ? -8 : 8) * (1 - p * 0.5));
  }, [mouseX, mouseY, containerRect]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={{
        opacity: 1,
        y: offsetY,
        rotate,
        scale: 1 + proximity * 0.12,
      }}
      transition={{
        opacity: { delay: index * 0.04, duration: 0.5, ease },
        y: { type: "spring", stiffness: 200, damping: 15, mass: 0.8 },
        rotate: { type: "spring", stiffness: 200, damping: 15 },
        scale: { type: "spring", stiffness: 300, damping: 20 },
      }}
      className="inline-block origin-bottom"
      style={{
        color: proximity > 0.05
          ? `color-mix(in srgb, var(--color-accent) ${Math.round(proximity * 100)}%, var(--color-primary))`
          : "var(--color-primary)",
        textShadow: proximity > 0.2
          ? `0 0 ${Math.round(proximity * 50)}px rgba(200, 255, 0, ${(proximity * 0.6).toFixed(2)}), 0 ${Math.round(proximity * 4)}px ${Math.round(proximity * 20)}px rgba(200, 255, 0, ${(proximity * 0.15).toFixed(2)})`
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
  const [rect, setRect] = useState<DOMRect | null>(null);
  const name = "Dopey";

  useEffect(() => {
    if (containerRef.current) {
      setRect(containerRef.current.getBoundingClientRect());
    }
  }, []);

  return (
    <span
      ref={containerRef}
      className="relative cursor-default select-none"
      onMouseMove={(e) => {
        setMouseX(e.clientX);
        setMouseY(e.clientY);
        if (containerRef.current) setRect(containerRef.current.getBoundingClientRect());
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
          containerRect={rect}
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.6, ease }}
      className="font-mono text-xl sm:text-3xl lg:text-4xl text-accent tracking-wide font-medium relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.span
        animate={{
          y: hovered ? -3 : 0,
          textShadow: hovered
            ? "0 0 30px rgba(200, 255, 0, 0.5), 0 0 60px rgba(200, 255, 0, 0.2), 0 4px 15px rgba(200, 255, 0, 0.1)"
            : "0 0 0px transparent",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-muted">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Visit my X profile →
          </motion.span>
        )}
      </AnimatePresence>
    </motion.a>
  );
}
