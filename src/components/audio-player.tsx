"use client";

import { useState, useCallback } from "react";

export function AudioPlayer() {
  const [playing, setPlaying] = useState(false);

  const toggle = useCallback(() => {
    if (playing) {
      speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    const prose = document.querySelector(".prose");
    if (!prose) return;

    const text = prose.textContent || "";
    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    speechSynthesis.speak(utterance);
    setPlaying(true);
  }, [playing]);

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors cursor-pointer"
    >
      {playing ? (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
          >
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
          <span>Listening...</span>
        </>
      ) : (
        <>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
          <span>Listen</span>
        </>
      )}
    </button>
  );
}
