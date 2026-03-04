/**
 * Full-screen confetti celebration.
 * Respects prefers-reduced-motion; no confetti if user prefers reduced motion.
 * Lasts ~3–4 seconds, colorful and premium-looking.
 */
export function fireSubscribeConfetti(): void {
  if (typeof window === "undefined") return;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  import("canvas-confetti").then((confettiModule) => {
    const confetti = confettiModule.default;

    const colors = ["#c8ff00", "#a8e000", "#88c000", "#f0b429", "#e8952e", "#6dd4e8", "#4ab8d4", "#e86dd4", "#d44ab8"];
    const scalar = 1.2;
    const count = 120;

    const fire = (origin: { x: number; y: number }, opts: { angle?: number; spread?: number; startVelocity?: number }) => {
      confetti({
        particleCount: count,
        spread: 70,
        origin,
        colors,
        scalar,
        ticks: 280,
        gravity: 0.9,
        drift: 0.3,
        ...opts,
      });
    };

    // Center burst
    fire({ x: 0.5, y: 0.5 }, { spread: 100, startVelocity: 35 });
    // Sides
    setTimeout(() => fire({ x: 0.2, y: 0.6 }, { angle: 60, spread: 55 }), 120);
    setTimeout(() => fire({ x: 0.8, y: 0.6 }, { angle: 120, spread: 55 }), 180);
    setTimeout(() => fire({ x: 0.5, y: 0.8 }, { angle: 270, spread: 50 }), 250);
    // Extra pops for premium feel
    setTimeout(() => fire({ x: 0.35, y: 0.4 }, { spread: 45, startVelocity: 28 }), 400);
    setTimeout(() => fire({ x: 0.65, y: 0.4 }, { spread: 45, startVelocity: 28 }), 450);
  });
}
