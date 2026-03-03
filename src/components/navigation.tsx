"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useSidebar } from "./client-layout";

export function Navigation() {
  const { isOpen, toggle } = useSidebar();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      }}
      className="fixed top-0 left-0 z-50 backdrop-blur-md bg-page/80 border-b border-line-faint transition-[right] duration-300 ease-in-out"
      style={{ right: isOpen ? "380px" : "0" }}
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line-faint text-sm text-muted hover:text-accent hover:border-accent/40 transition-all cursor-pointer"
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          <ThemeToggle />
        </div>
      </div>
    </motion.nav>
  );
}
