"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CirclePlay, CirclePause, Locate, X } from "lucide-react";

type AudioState = "idle" | "playing" | "paused";

interface WordInfo {
  element: HTMLSpanElement;
  text: string;
}

export function AudioPlayer() {
  const [state, setState] = useState<AudioState>("idle");
  const [autoScroll, setAutoScroll] = useState(true);
  const stateRef = useRef<AudioState>("idle");
  const wordsRef = useRef<WordInfo[]>([]);
  const activeIdxRef = useRef(-1);
  const trailRef = useRef<number[]>([]);
  const autoScrollRef = useRef(true);
  const isAutoScrollingRef = useRef(false);
  const pausedAtRef = useRef(0);
  const seekingRef = useRef(false);

  const clearAllHighlights = useCallback(() => {
    const words = wordsRef.current;
    for (const idx of trailRef.current) {
      const w = words[idx];
      if (w) w.element.classList.remove(
        "audio-word-active", "audio-word-trail-1",
        "audio-word-trail-2", "audio-word-trail-3",
      );
    }
    trailRef.current = [];
    activeIdxRef.current = -1;
  }, []);

  const highlightWord = useCallback((globalIdx: number) => {
    const words = wordsRef.current;
    for (const idx of trailRef.current) {
      const w = words[idx];
      if (w) w.element.classList.remove(
        "audio-word-active", "audio-word-trail-1",
        "audio-word-trail-2", "audio-word-trail-3",
      );
    }

    const trail: number[] = [];
    const classes = ["audio-word-active", "audio-word-trail-1", "audio-word-trail-2", "audio-word-trail-3"];
    for (let i = 0; i < classes.length; i++) {
      const idx = globalIdx - i;
      if (idx >= 0 && idx < words.length) {
        words[idx].element.classList.add(classes[i]);
        trail.push(idx);
      }
    }

    trailRef.current = trail;
    activeIdxRef.current = globalIdx;

    if (autoScrollRef.current && globalIdx >= 0 && globalIdx < words.length) {
      isAutoScrollingRef.current = true;
      words[globalIdx].element.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => { isAutoScrollingRef.current = false; }, 500);
    }
  }, []);

  const wrapWords = useCallback((): WordInfo[] => {
    const existing = document.querySelectorAll(".prose .audio-word");
    if (existing.length > 0) {
      return Array.from(existing).map((el) => ({
        element: el as HTMLSpanElement,
        text: el.textContent || "",
      }));
    }

    const prose = document.querySelector(".prose");
    if (!prose) return [];

    const words: WordInfo[] = [];
    const walker = document.createTreeWalker(prose, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        let el = node.parentElement;
        while (el && el !== prose) {
          if (el.tagName === "PRE" || el.tagName === "FIGURE" || el.tagName === "CODE") {
            return NodeFilter.FILTER_REJECT;
          }
          el = el.parentElement;
        }
        return node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      },
    });

    const textNodes: Text[] = [];
    let n: Node | null;
    while ((n = walker.nextNode())) textNodes.push(n as Text);

    for (const textNode of textNodes) {
      const text = textNode.textContent || "";
      const parent = textNode.parentNode;
      if (!parent) continue;

      const fragment = document.createDocumentFragment();
      const parts = text.split(/(\s+)/);

      for (const part of parts) {
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
        } else if (part) {
          const span = document.createElement("span");
          span.className = "audio-word";
          span.dataset.wordIdx = String(words.length);
          span.textContent = part;
          fragment.appendChild(span);
          words.push({ element: span, text: part });
        }
      }

      parent.replaceChild(fragment, textNode);
    }

    return words;
  }, []);

  const speak = useCallback(
    (startIdx: number) => {
      const words = wordsRef.current;
      if (words.length === 0) return;

      const activeWords = words.slice(startIdx);
      const text = activeWords.map((w) => w.text).join(" ");
      if (!text.trim()) return;

      const charStarts: number[] = [];
      let pos = 0;
      for (const w of activeWords) {
        charStarts.push(pos);
        pos += w.text.length + 1;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          let idx = 0;
          for (let i = charStarts.length - 1; i >= 0; i--) {
            if (event.charIndex >= charStarts[i]) { idx = i; break; }
          }
          highlightWord(startIdx + idx);
        }
      };

      utterance.onend = () => {
        if (seekingRef.current) return;
        if (stateRef.current === "playing") {
          clearAllHighlights();
          stateRef.current = "idle";
          setState("idle");
          document.querySelector(".prose")?.classList.remove("audio-active");
        }
      };

      utterance.onerror = (event) => {
        if (seekingRef.current) return;
        if (event.error === "canceled") return;
        if (stateRef.current === "playing") {
          clearAllHighlights();
          stateRef.current = "idle";
          setState("idle");
          document.querySelector(".prose")?.classList.remove("audio-active");
        }
      };

      speechSynthesis.speak(utterance);
    },
    [highlightWord, clearAllHighlights],
  );

  const startPlaying = useCallback(() => {
    const words = wrapWords();
    wordsRef.current = words;
    if (words.length === 0) return;

    document.querySelector(".prose")?.classList.add("audio-active");
    stateRef.current = "playing";
    setState("playing");
    setAutoScroll(true);
    autoScrollRef.current = true;
    speak(0);
  }, [wrapWords, speak]);

  const pause = useCallback(() => {
    stateRef.current = "paused";
    setState("paused");
    seekingRef.current = true;
    speechSynthesis.cancel();
    seekingRef.current = false;
    pausedAtRef.current = activeIdxRef.current;
  }, []);

  const resume = useCallback(() => {
    stateRef.current = "playing";
    setState("playing");
    speak(Math.max(0, pausedAtRef.current));
  }, [speak]);

  const dismiss = useCallback(() => {
    seekingRef.current = true;
    speechSynthesis.cancel();
    seekingRef.current = false;
    clearAllHighlights();
    stateRef.current = "idle";
    setState("idle");
    setAutoScroll(true);
    autoScrollRef.current = true;
    document.querySelector(".prose")?.classList.remove("audio-active");
  }, [clearAllHighlights]);

  const toggle = useCallback(() => {
    if (state === "idle") startPlaying();
    else if (state === "playing") pause();
    else resume();
  }, [state, startPlaying, pause, resume]);

  const toggleAutoScroll = useCallback(() => {
    const next = !autoScrollRef.current;
    autoScrollRef.current = next;
    setAutoScroll(next);
    if (next && activeIdxRef.current >= 0) {
      const w = wordsRef.current[activeIdxRef.current];
      if (w) {
        isAutoScrollingRef.current = true;
        w.element.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => { isAutoScrollingRef.current = false; }, 500);
      }
    }
  }, []);

  useEffect(() => {
    function handleWordClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.classList.contains("audio-word")) return;
      if (stateRef.current !== "playing" && stateRef.current !== "paused") return;

      const idx = parseInt(target.dataset.wordIdx || "0");
      if (isNaN(idx)) return;

      seekingRef.current = true;
      speechSynthesis.cancel();
      seekingRef.current = false;

      stateRef.current = "playing";
      setState("playing");
      speak(idx);
    }

    document.addEventListener("click", handleWordClick);
    return () => document.removeEventListener("click", handleWordClick);
  }, [speak]);

  useEffect(() => {
    if (state !== "playing" && state !== "paused") return;

    function onInput() {
      autoScrollRef.current = false;
      setAutoScroll(false);
    }

    window.addEventListener("wheel", onInput, { passive: true });
    window.addEventListener("touchmove", onInput, { passive: true });
    return () => {
      window.removeEventListener("wheel", onInput);
      window.removeEventListener("touchmove", onInput);
    };
  }, [state]);

  useEffect(() => {
    function stop() { speechSynthesis.cancel(); }
    window.addEventListener("beforeunload", stop);
    return () => {
      stop();
      window.removeEventListener("beforeunload", stop);
      document.querySelector(".prose")?.classList.remove("audio-active");
    };
  }, []);

  return (
    <>
      <button
        onClick={toggle}
        className={`flex items-center gap-1.5 text-sm transition-colors cursor-pointer ${
          state !== "idle" ? "text-accent" : "text-muted hover:text-accent"
        }`}
      >
        {state === "playing" ? <CirclePause size={16} /> : <CirclePlay size={16} />}
        <span className="hidden sm:inline">
          {state === "idle" ? "Listen" : state === "playing" ? "Listening..." : "Paused"}
        </span>
      </button>

      <AnimatePresence>
        {state !== "idle" && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-surface/95 border border-line backdrop-blur-md shadow-lg max-w-[calc(100vw-2rem)]"
          >
            <button
              onClick={toggle}
              className="text-accent hover:opacity-80 transition-opacity cursor-pointer"
            >
              {state === "playing" ? <CirclePause size={20} /> : <CirclePlay size={20} />}
            </button>

            <div className="w-px h-5 bg-line-faint" />

            <span className="text-xs text-muted whitespace-nowrap">
              {state === "playing" ? "Listening" : "Paused"}
            </span>

            <div className="w-px h-5 bg-line-faint" />

            <button
              onClick={toggleAutoScroll}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                autoScroll ? "text-accent" : "text-muted hover:text-accent"
              }`}
            >
              <Locate size={13} />
              <span className="hidden sm:inline">Auto Scroll</span>
              <span className="sm:hidden">Sync</span>
            </button>

            <div className="w-px h-5 bg-line-faint" />

            <button
              onClick={dismiss}
              className="text-ghost hover:text-primary transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
