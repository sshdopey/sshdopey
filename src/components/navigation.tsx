"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useSidebar } from "./client-layout";

export function Navigation() {
  const { isOpen, toggle } = useSidebar();
  const pathname = usePathname();
  const isBlog = pathname.startsWith("/blog");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      }}
      className="fixed top-0 left-0 z-50 backdrop-blur-md bg-page/80 border-b border-line-faint transition-[right] duration-300 ease-in-out"
      style={{ right: isOpen && !isMobile ? "380px" : "0" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-[1.5px] border-accent p-0.5">
            <Image
              src="/sshdopey.jpeg"
              alt="Dopey"
              width={36}
              height={36}
              className="w-full h-full rounded-full object-cover"
              priority
            />
          </span>
          <span className="text-base sm:text-lg font-semibold tracking-tight text-primary">
            Dopey<span className="text-accent">_</span>
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/blog"
            className={`text-sm transition-colors ${
              isBlog ? "text-accent" : "text-muted hover:text-accent"
            }`}
          >
            Blog
          </Link>

          <button
            onClick={toggle}
            className="ask-ai-glow flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line-faint text-sm text-muted hover:text-accent transition-colors cursor-pointer"
          >
            <Sparkles size={14} className="text-accent" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          <ThemeToggle />
        </div>
      </div>
    </motion.nav>
  );
}
