"use client";

import { useEffect } from "react";

const COPY_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
const CHECK_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`;

export function CodeCopy() {
  useEffect(() => {
    document
      .querySelectorAll("figure[data-rehype-pretty-code-figure]")
      .forEach((fig) => {
        if (fig.querySelector(".code-header")) return;

        const code = fig.querySelector("code");
        const pre = fig.querySelector("pre");
        if (!code || !pre) return;

        const lang = code.getAttribute("data-language") || "";

        const header = document.createElement("div");
        header.className = "code-header";
        header.innerHTML = `<span class="code-lang">${lang}</span><button class="copy-btn">${COPY_SVG}<span>Copy</span></button>`;
        fig.insertBefore(header, pre);
      });

    function handleClick(e: MouseEvent) {
      const btn = (e.target as HTMLElement).closest(".copy-btn");
      if (!btn || !(btn instanceof HTMLElement)) return;

      const fig = btn.closest("figure[data-rehype-pretty-code-figure]");
      const code = fig?.querySelector("code");
      if (!code) return;

      const lines = code.querySelectorAll("[data-line]");
      const text = Array.from(lines)
        .map((line) => line.textContent)
        .join("\n");

      navigator.clipboard.writeText(text).then(() => {
        btn.innerHTML = `${CHECK_SVG}<span>Copied!</span>`;
        setTimeout(() => {
          btn.innerHTML = `${COPY_SVG}<span>Copy</span>`;
        }, 2000);
      });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
