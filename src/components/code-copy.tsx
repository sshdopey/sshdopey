"use client";

import { useEffect } from "react";

export function CodeCopy() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const btn = (e.target as HTMLElement).closest(".copy-btn");
      if (!btn || !(btn instanceof HTMLElement)) return;

      const block = btn.closest(".code-block");
      const code = block?.querySelector("code")?.textContent;
      if (!code) return;

      navigator.clipboard.writeText(code).then(() => {
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
