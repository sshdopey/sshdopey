"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share, Link2, Check, Linkedin } from "lucide-react";

export function HeaderShareBtn({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/blog/${slug}`
      : "";

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1200);
  }

  function shareOnX() {
    const text = `Just read "${title}" by @sshdopey — absolutely worth your time 🔥`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
    );
    setOpen(false);
  }

  function shareOnLinkedIn() {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
    );
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-muted hover:text-accent transition-colors cursor-pointer"
        aria-label="Share this post"
      >
        <Share size={15} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              role="button"
              aria-label="Close share menu"
              tabIndex={0}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(false); }}
            />
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-2 z-50 bg-surface border border-line rounded-xl overflow-hidden min-w-[200px] shadow-lg"
            >
              <button
                onClick={copyLink}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-secondary hover:text-accent hover:bg-surface-hover transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check size={14} className="text-accent" />
                ) : (
                  <Link2 size={14} />
                )}
                {copied ? "Copied!" : "Copy link"}
              </button>
              <button
                onClick={shareOnX}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-secondary hover:text-accent hover:bg-surface-hover transition-colors border-t border-line-faint cursor-pointer"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Post to X
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-secondary hover:text-accent hover:bg-surface-hover transition-colors border-t border-line-faint cursor-pointer"
              >
                <Linkedin size={14} />
                Share on LinkedIn
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
