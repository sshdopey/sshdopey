"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";

export function Navigation() {
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
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
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

        <div className="flex items-center gap-5">
          <Link
            href="/blog"
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            blog
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </motion.nav>
  );
}
