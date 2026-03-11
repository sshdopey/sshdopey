"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SocialLinks } from "./social-links";

const secrets = [
  "ship it or quit it",
  "zero-cost abstractions",
  "it compiles, ship it",
  "built different",
  "sleep is overrated",
  "cargo build --release",
  "trust the process",
];

export function Footer() {
  const [clickCount, setClickCount] = useState(0);
  const [secret, setSecret] = useState<string | null>(null);

  function handleClick() {
    const next = clickCount + 1;
    setClickCount(next);
    if (next % 3 === 0) {
      const msg = secrets[Math.floor(Math.random() * secrets.length)];
      setSecret(msg);
      setTimeout(() => setSecret(null), 2000);
    }
  }

  return (
    <footer className="border-t border-line-faint relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <motion.div
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Link
            href="/"
            onClick={handleClick}
            aria-label="sshdopey home"
            className="text-sm font-medium text-accent tracking-tight"
          >
            @sshdopey
          </Link>
        </motion.div>

        <SocialLinks variant="inline" />
      </div>

      <AnimatePresence>
        {secret && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-full bg-surface border border-line text-xs text-muted font-mono whitespace-nowrap"
          >
            {secret}
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
