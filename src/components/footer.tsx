"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SocialLinks } from "./social-links";

export function Footer() {
  return (
    <footer className="border-t border-line-faint">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <motion.div whileHover={{ x: 2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Link
            href="/"
            className="text-sm font-medium text-accent tracking-tight"
          >
            @sshdopey
          </Link>
        </motion.div>

        <SocialLinks variant="inline" />
      </div>
    </footer>
  );
}
