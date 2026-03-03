"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";
import { useSidebar } from "./client-layout";

export function Navigation() {
  const { toggle } = useSidebar();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-page/80 border-b border-line-faint"
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/sshdopey.jpeg"
            alt="Dopey"
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="text-sm font-semibold tracking-tight text-primary">
            Dopey
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/blog"
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            Blog
          </Link>

          <button
            onClick={toggle}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors cursor-pointer"
          >
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
              <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
              <path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
            </svg>
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          <ThemeToggle />
        </div>
      </div>
    </motion.nav>
  );
}
