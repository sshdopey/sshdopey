"use client";

import { useEffect } from "react";

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
        header.innerHTML = `<span class="code-lang">${lang}</span><button class="copy-btn">Copy</button>`;
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
        btn.textContent = "Copied!";
        setTimeout(() => {
          btn.textContent = "Copy";
        }, 2000);
      });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
