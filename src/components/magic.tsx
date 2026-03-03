"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const VISITED_KEY = "dopey-visited";
const quotes = [
  "ship it or quit it ⚡",
  "zero-cost abstractions loaded 🦀",
  "it compiles, ship it",
  "built different, built to last",
  "sleep is overrated when you're shipping",
  "cargo build --release 🚀",
  "trust the process, trust the compiler",
  "Python for the models. Rust for everything else.",
  "the best code is no code",
  "make it work, make it fast, make it beautiful",
];

function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<HTMLDivElement[]>([]);
  const pos = useRef({ x: -100, y: -100 });
  const trailPositions = useRef(
    Array.from({ length: 5 }, () => ({ x: -100, y: -100 })),
  );
  const [visible, setVisible] = useState(false);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    }
    function onLeave() { setVisible(false); }
    function onDown() { setClicking(true); }
    function onUp() { setClicking(false); }

    let raf: number;
    function tick() {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      for (let i = 0; i < trailPositions.current.length; i++) {
        const prev = i === 0 ? pos.current : trailPositions.current[i - 1];
        const lerp = 0.25 - i * 0.03;
        trailPositions.current[i] = {
          x: trailPositions.current[i].x + (prev.x - trailPositions.current[i].x) * lerp,
          y: trailPositions.current[i].y + (prev.y - trailPositions.current[i].y) * lerp,
        };
        if (trailRefs.current[i]) {
          trailRefs.current[i].style.transform = `translate(${trailPositions.current[i].x}px, ${trailPositions.current[i].y}px)`;
        }
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf);
    };
  }, [visible]);

  return (
    <>
      <style>{`
        * { cursor: none !important; }
        a, button, [role="button"], input, textarea, select, label { cursor: none !important; }
      `}</style>

      {trailPositions.current.map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) trailRefs.current[i] = el; }}
          className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
          style={{
            width: 4 - i * 0.5,
            height: 4 - i * 0.5,
            marginLeft: -(4 - i * 0.5) / 2,
            marginTop: -(4 - i * 0.5) / 2,
            background: `var(--color-accent)`,
            opacity: visible ? 0.3 - i * 0.05 : 0,
            transition: "opacity 0.2s",
          }}
        />
      ))}

      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.15s" }}
      >
        <div
          className="rounded-full border-[1.5px] border-accent"
          style={{
            width: clicking ? 14 : 18,
            height: clicking ? 14 : 18,
            marginLeft: clicking ? -7 : -9,
            marginTop: clicking ? -7 : -9,
            transition: "width 0.1s, height 0.1s, margin 0.1s",
            background: clicking ? "var(--color-accent)" : "transparent",
            opacity: clicking ? 0.3 : 1,
          }}
        />
      </div>
    </>
  );
}

function FirstVisitConfetti() {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; emoji: string; delay: number }[]
  >([]);

  useEffect(() => {
    const visited = localStorage.getItem(VISITED_KEY);
    if (visited) return;

    localStorage.setItem(VISITED_KEY, "true");

    const emojis = ["🎉", "🚀", "⚡", "🦀", "🐍", "✨", "💻", "🔥", "⭐", "💜"];
    const w = window.innerWidth;
    const h = window.innerHeight;
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * w,
      y: h + 50,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      delay: Math.random() * 0.8,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 4000);
  }, []);

  return (
    <AnimatePresence>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, y: p.y, x: p.x, scale: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            y: [p.y, p.y - 400 - Math.random() * 400],
            x: [p.x, p.x + (Math.random() - 0.5) * 300],
            scale: [0, 1.2 + Math.random() * 0.5, 0.8],
            rotate: [0, (Math.random() - 0.5) * 360],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 2.5 + Math.random(),
            delay: p.delay,
            ease: "easeOut",
          }}
          className="fixed pointer-events-none z-[9999] text-2xl sm:text-3xl"
        >
          {p.emoji}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

function HomeReloadQuote() {
  const pathname = usePathname();
  const [quote, setQuote] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== "/") return;
    const visited = localStorage.getItem(VISITED_KEY);
    if (!visited) return;

    const msg = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(msg);
    const timer = setTimeout(() => setQuote(null), 3500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {quote && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 250, damping: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-2.5 rounded-full bg-surface border border-line text-sm text-muted font-mono shadow-lg backdrop-blur-md whitespace-nowrap max-w-[90vw] truncate"
        >
          {quote}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Magic() {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const mq = window.matchMedia("(max-width: 768px)");
    const h = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  return (
    <>
      {!isMobile && <CustomCursor />}
      <FirstVisitConfetti />
      <HomeReloadQuote />
    </>
  );
}
