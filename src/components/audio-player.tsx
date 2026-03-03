"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CirclePlay, CirclePause } from "lucide-react";

interface WordInfo {
  element: HTMLSpanElement;
  text: string;
}

export function AudioPlayer() {
  const [playing, setPlaying] = useState(false);
  const wordsRef = useRef<WordInfo[]>([]);
  const activeIdxRef = useRef(-1);
  const seekBaseRef = useRef(0);

  const clearHighlight = useCallback(() => {
    if (activeIdxRef.current >= 0 && activeIdxRef.current < wordsRef.current.length) {
      wordsRef.current[activeIdxRef.current].element.classList.remove("audio-word-active");
    }
    activeIdxRef.current = -1;
  }, []);

  const highlightWord = useCallback((globalIdx: number) => {
    clearHighlight();
    const words = wordsRef.current;
    if (globalIdx >= 0 && globalIdx < words.length) {
      words[globalIdx].element.classList.add("audio-word-active");
      words[globalIdx].element.scrollIntoView({ behavior: "smooth", block: "center" });
      activeIdxRef.current = globalIdx;
    }
  }, [clearHighlight]);

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

      seekBaseRef.current = startIdx;

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
            if (event.charIndex >= charStarts[i]) {
              idx = i;
              break;
            }
          }
          highlightWord(startIdx + idx);
        }
      };

      utterance.onend = () => {
        clearHighlight();
        setPlaying(false);
        document.querySelector(".prose")?.classList.remove("audio-active");
      };

      utterance.onerror = () => {
        clearHighlight();
        setPlaying(false);
        document.querySelector(".prose")?.classList.remove("audio-active");
      };

      speechSynthesis.speak(utterance);
    },
    [highlightWord, clearHighlight],
  );

  const toggle = useCallback(() => {
    if (playing) {
      speechSynthesis.cancel();
      clearHighlight();
      setPlaying(false);
      document.querySelector(".prose")?.classList.remove("audio-active");
      return;
    }

    const words = wrapWords();
    wordsRef.current = words;
    if (words.length === 0) return;

    document.querySelector(".prose")?.classList.add("audio-active");
    setPlaying(true);
    speak(0);
  }, [playing, wrapWords, speak, clearHighlight]);

  useEffect(() => {
    function handleWordClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.classList.contains("audio-word") || !playing) return;

      const idx = parseInt(target.dataset.wordIdx || "0");
      if (isNaN(idx)) return;

      speechSynthesis.cancel();
      speak(idx);
    }

    document.addEventListener("click", handleWordClick);
    return () => document.removeEventListener("click", handleWordClick);
  }, [playing, speak]);

  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      document.querySelector(".prose")?.classList.remove("audio-active");
    };
  }, []);

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 text-sm transition-colors cursor-pointer ${
        playing ? "text-accent" : "text-muted hover:text-accent"
      }`}
    >
      {playing ? <CirclePause size={16} /> : <CirclePlay size={16} />}
      <span>{playing ? "Listening..." : "Listen"}</span>
    </button>
  );
}
