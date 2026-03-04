"use client";

import { useEffect, useState, useRef } from "react";

/* Use cursor:none — the CSS in <head> already sets this globally,
   but JS re-applies it as a safety net for dynamically added elements. */
const HIDDEN = "none";

function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const glowPos = useRef({ x: -100, y: -100 });
  const modeRef = useRef<"default" | "pointer" | "grab">("default");
  const shownOnce = useRef(false);
  const [visible, setVisible] = useState(false);
  const [cursorMode, setCursorMode] = useState<
    "default" | "pointer" | "grab"
  >("default");
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    /* ── Nuclear native-cursor kill ──
       The problem: when the mouse exits the viewport (especially at the
       top edge into browser chrome) and re-enters, the browser renders
       one or more frames with the default cursor before our CSS takes
       effect. We use a multi-layer defense:

       1. A <style> tag in <head> (in layout.tsx) applies cursor:none via
          CSS on *, so it's there before any JS runs.
       2. On pointerenter (fires the instant the pointer re-enters,
          BEFORE mousemove), we set cursor AND force a synchronous style
          recalc via offsetHeight so the change paints in the same frame.
       3. On every pointermove (high-frequency, passive) we re-apply.
       4. On every RAF tick we re-apply as ongoing enforcement.
       5. We also stamp every element that gets hovered via mouseover. */

    function ensureHidden() {
      const h = document.documentElement;
      const b = document.body;
      h.style.setProperty("cursor", HIDDEN, "important");
      b.style.setProperty("cursor", HIDDEN, "important");
    }

    function onPointerEnter() {
      ensureHidden();
      // Force synchronous style recalc — makes cursor change paint
      // within this frame instead of the next one
      void document.documentElement.offsetHeight;
    }

    /* Stamp any element the user hovers so it also has cursor hidden.
       This catches elements with inline cursor styles the CSS rule
       might not override. */
    function onMouseOver(e: MouseEvent) {
      const el = e.target as HTMLElement;
      if (el && el.style) {
        el.style.setProperty("cursor", HIDDEN, "important");
      }
    }

    function updateMode(target: Element | null) {
      if (!target) return;

      let mode: "default" | "pointer" | "grab" = "default";

      // Check pointer first so title bar buttons show pointer even inside terminal grab area
      if (
        target.closest(".video-embed:not([data-active])") ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']") ||
        target.closest('input[type="submit"]') ||
        target.closest('input[type="button"]') ||
        target.closest("[type='button']") ||
        target.closest("label[for]") ||
        target.closest("select") ||
        target.closest(".cursor-pointer") ||
        (target as HTMLElement)?.style?.cursor === "pointer"
      ) {
        mode = "pointer";
      } else if (target.closest("[data-cursor-grab]")) {
        mode = "grab";
      } else {
        try {
          const cs = window.getComputedStyle(target as HTMLElement);
          if (cs.cursor === "pointer") mode = "pointer";
        } catch {}
      }

      if (mode !== modeRef.current) {
        modeRef.current = mode;
        setCursorMode(mode);
      }
    }

    function onMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY };

      if (!shownOnce.current) {
        shownOnce.current = true;
        setVisible(true);
      }

      updateMode(document.elementFromPoint(e.clientX, e.clientY));
    }

    function onDown() {
      setClicking(true);
    }
    function onUp() {
      setClicking(false);
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        ensureHidden();
        void document.documentElement.offsetHeight;
      }
    }

    /* Video embed overlay toggle */
    function onDocClick(e: MouseEvent) {
      const target = e.target as Element;
      const embed = target.closest(".video-embed");

      if (embed && !embed.hasAttribute("data-active")) {
        embed.setAttribute("data-active", "");
        return;
      }

      document
        .querySelectorAll(".video-embed[data-active]")
        .forEach((el) => {
          if (!el.contains(target)) el.removeAttribute("data-active");
        });
    }

    ensureHidden();

    let raf: number;
    function tick() {
      ensureHidden();

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      if (glowRef.current) {
        const g = glowPos.current;
        const p = pos.current;
        glowPos.current = {
          x: g.x + (p.x - g.x) * 0.22,
          y: g.y + (p.y - g.y) * 0.22,
        };
        glowRef.current.style.transform = `translate(${glowPos.current.x}px, ${glowPos.current.y}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("pointerenter", onPointerEnter);
    window.addEventListener("pointermove", ensureHidden, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("click", onDocClick);
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
    }
    if (glowRef.current) {
      glowRef.current.style.transform = `translate(${glowPos.current.x}px, ${glowPos.current.y}px) translate(-50%, -50%)`;
    }
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointerenter", onPointerEnter);
      window.removeEventListener("pointermove", ensureHidden);
      document.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("click", onDocClick);
      cancelAnimationFrame(raf);
    };
  }, []);

  const size = clicking ? 20 : 22;
  const halo =
    "drop-shadow(0 0 1px var(--color-page)) drop-shadow(0 0 1px var(--color-page))";

  return (
    <>
      {/* Gradient glow that trails the cursor */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full cursor-glow"
        style={{
          width: 240,
          height: 240,
          opacity: visible ? 0.7 : 0,
          transition: "opacity 0.2s",
        }}
      />

      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.12s",
        }}
      >
        {cursorMode === "grab" ? (
          clicking ? (
            /* ── Lucide "hand-grab" — closed hand (outline) ── */
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
              style={{ filter: halo, transform: "translate(-50%, -50%)" }}
            >
              <path d="M18 11.5V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4" />
              <path d="M14 10V8a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
              <path d="M10 9.9V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v5" />
              <path d="M6 14a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
              <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8 2 2 0 1 1 4 0" />
            </svg>
          ) : (
            /* ── Lucide "hand" — open hand (outline) ── */
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
              style={{ filter: halo, transform: "translate(-50%, -50%)" }}
            >
              <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
              <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
          )
        ) : cursorMode === "pointer" ? (
          /* ── Lucide "pointer" — pointing hand (outline) ── */
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
            style={{ filter: halo, transform: "translate(-7px, -2px)" }}
          >
            <path d="M22 14a8 8 0 0 1-8 8" />
            <path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
            <path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" />
            <path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" />
            <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
        ) : (
          /* ── Lucide "mouse-pointer-2" — default arrow (filled) ── */
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
            className="text-accent"
            style={{ filter: halo, transform: "translate(-4px, -4px)" }}
          >
            <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
          </svg>
        )}
      </div>
    </>
  );
}

export function Magic() {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    const mq = window.matchMedia("(max-width: 768px)");
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);

  return <>{!isMobile && <CustomCursor />}</>;
}
