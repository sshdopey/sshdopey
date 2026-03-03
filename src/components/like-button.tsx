"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { likePost } from "@/lib/actions";

export function LikeButton({
  slug,
  initialCount,
}: {
  slug: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [burst, setBurst] = useState(false);

  const handleLike = useCallback(async () => {
    if (liked) return;
    setLiked(true);
    setBurst(true);
    setCount((c) => c + 1);

    const result = await likePost(slug);
    setCount(result.count);
    setTimeout(() => setBurst(false), 500);
  }, [slug, liked]);

  return (
    <div className="flex items-center gap-3">
      <motion.button
        onClick={handleLike}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: liked ? 1 : 1.06 }}
        className={`relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-200 cursor-pointer ${
          liked
            ? "border-zinc-600 bg-white/5 text-white"
            : "border-zinc-800 text-zinc-600 hover:text-zinc-300 hover:border-zinc-700"
        }`}
        aria-label="Like this post"
      >
        <motion.svg
          animate={burst ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </motion.svg>
      </motion.button>

      <AnimatePresence mode="popLayout">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-sm font-mono text-zinc-500 tabular-nums"
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
