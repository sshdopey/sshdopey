"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-[8rem] sm:text-[10rem] font-bold tracking-tighter leading-none text-line select-none"
      >
        404
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
        className="text-lg text-muted mt-4 mb-2"
      >
        this page doesn&apos;t exist
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.35,
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
        className="text-sm text-ghost mb-8 font-mono"
      >
        but you do, and that&apos;s what matters ✨
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Link
          href="/"
          className="px-5 py-2.5 bg-accent text-inverse text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Take me home
        </Link>
      </motion.div>
    </div>
  );
}
