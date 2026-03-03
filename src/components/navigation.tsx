"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Navigation() {
  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-10 bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-900/60"
    >
      <Link
        href="/"
        className="font-mono text-sm tracking-[0.12em] text-zinc-400 hover:text-white transition-colors duration-200"
      >
        dopey
      </Link>
      <Link
        href="/blog"
        className="font-mono text-sm tracking-[0.08em] text-zinc-600 hover:text-white transition-colors duration-200"
      >
        blog
      </Link>
    </motion.nav>
  );
}
