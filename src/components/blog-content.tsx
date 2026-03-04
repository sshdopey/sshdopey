"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { TiltCard } from "@/components/tilt-card";
import { PostLikeBadge } from "@/components/liked-posts-provider";
import type { PostMeta } from "@/lib/posts";

const placeholders = [
  "Search posts...",
  'Try "Rust"...',
  'Try "AI agents"...',
  'Try "performance"...',
  "What are you curious about?",
];

function useTypewriter() {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const phraseIdx = useRef(0);
  const charIdx = useRef(0);
  const deleting = useRef(false);
  const pauseUntil = useRef(0);
  const started = useRef(false);

  useEffect(() => {
    if (focused) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now < pauseUntil.current) return;

      const phrase = placeholders[phraseIdx.current];

      if (!deleting.current) {
        if (!started.current) started.current = true;
        charIdx.current++;
        setText(phrase.slice(0, charIdx.current));
        if (charIdx.current >= phrase.length) {
          deleting.current = true;
          pauseUntil.current = now + 2200;
        }
      } else {
        charIdx.current--;
        setText(phrase.slice(0, charIdx.current));
        if (charIdx.current <= 0) {
          deleting.current = false;
          phraseIdx.current = (phraseIdx.current + 1) % placeholders.length;
          pauseUntil.current = now + 80;
        }
      }
    }, 55);

    return () => clearInterval(interval);
  }, [focused]);

  return { placeholder: text, setFocused };
}

function PostCard({
  post,
  index,
  likes,
}: {
  post: PostMeta;
  index: number;
  likes: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 260, damping: 24 }}
      className="h-full"
    >
      <TiltCard className="h-full">
        <motion.div whileHover={{ y: -6, scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="h-full">
          <Link
            href={`/blog/${post.slug}`}
            className="group flex flex-col h-full rounded-xl border border-line-faint overflow-hidden hover:border-line bg-surface/50 hover:bg-surface-hover transition-colors duration-300 shadow-sm hover:shadow-xl hover:shadow-black/10"
          >
            {post.cover_image && (
              <div className="relative w-full aspect-16/10 overflow-hidden bg-line-faint/30">
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            )}

            <div className="p-5 pt-5 pb-5 flex flex-col flex-1 min-h-0">
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold uppercase tracking-[0.12em] text-dim bg-line-faint/80 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <h3 className="text-primary font-semibold leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2">
                {post.title}
              </h3>

              <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-4 flex-1">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between text-xs text-muted mt-auto pt-3 border-t border-line-faint/50">
                <div className="flex items-center gap-2.5">
                  <time>
                    {new Date(post.published_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                  <span className="text-dim">·</span>
                  <span>{post.reading_time} min</span>
                </div>
                <PostLikeBadge slug={post.slug} count={likes} size={11} className="flex items-center gap-1" />
              </div>
            </div>
          </Link>
        </motion.div>
      </TiltCard>
    </motion.div>
  );
}

function FeaturedCard({
  post,
  likes,
}: {
  post: PostMeta;
  likes: number;
}) {
  return (
    <TiltCard className="h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="group flex flex-col sm:flex-row h-full rounded-xl border-2 border-line overflow-hidden hover:border-accent/40 bg-surface/50 hover:bg-surface-hover transition-all duration-300"
      >
        {post.cover_image && (
          <div className="relative w-full sm:w-[40%] min-h-[200px] sm:min-h-0 sm:shrink-0 overflow-hidden">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 40vw"
            />
          </div>
        )}
        <div className="p-6 sm:p-8 flex flex-col flex-1 justify-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-medium mb-2 block">Featured</span>
          <h3 className="text-xl sm:text-2xl font-bold text-primary leading-tight mb-3 group-hover:text-secondary transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-4">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted">
            <time>
              {new Date(post.published_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <span className="text-dim">·</span>
            <span>{post.reading_time} min read</span>
            <PostLikeBadge slug={post.slug} count={likes} size={11} className="flex items-center gap-1 ml-auto" />
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}

export function BlogContent({
  posts,
  featured,
  allTags,
  likeCounts,
}: {
  posts: PostMeta[];
  featured: PostMeta[];
  allTags: string[];
  likeCounts: Record<string, number>;
}) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { placeholder, setFocused } = useTypewriter();

  const filtered = posts.filter((post) => {
    const matchSearch =
      search === "" ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || post.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  const nonFeaturedFiltered = filtered.filter((p) => !p.featured);
  const showFeatured = !search && !activeTag && featured.length > 0;

  return (
    <>
      <div className="relative mb-6">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ghost"
        />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface/50 border border-line-faint rounded-lg text-primary placeholder:text-ghost focus:outline-none focus:border-accent/40 transition-all focus:shadow-[0_0_0_3px_rgba(200,255,0,0.06)]"
        />
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <motion.button
            onClick={() => setActiveTag(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`text-xs font-semibold uppercase tracking-[0.12em] px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
              activeTag === null
                ? "bg-accent/10 text-accent"
                : "bg-surface-hover text-muted hover:text-accent"
            }`}
          >
            All
          </motion.button>
          {allTags.map((tag) => (
            <motion.button
              key={tag}
              onClick={() =>
                setActiveTag(activeTag === tag ? null : tag)
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              className={`text-xs font-semibold uppercase tracking-[0.12em] px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                activeTag === tag
                  ? "bg-accent/10 text-accent"
                  : "bg-surface-hover text-muted hover:text-accent"
              }`}
            >
              {tag}
            </motion.button>
          ))}
        </div>
      )}

      {showFeatured && featured.length > 0 && (
        <section className="mb-14">
          <h2 className="text-xs text-muted uppercase tracking-[0.2em] font-medium mb-5">
            Featured
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <FeaturedCard
              key={featured[0].slug}
              post={featured[0]}
              likes={likeCounts[featured[0].slug] ?? 0}
            />
          </div>
        </section>
      )}

      <section>
        {(showFeatured || search || activeTag) && (
          <h2 className="text-xs text-muted uppercase tracking-[0.2em] font-medium mb-5">
            {search || activeTag ? "Results" : "All Posts"}
          </h2>
        )}
        <AnimatePresence mode="popLayout">
          <div className="grid gap-6 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {(showFeatured ? nonFeaturedFiltered : filtered).map(
              (post, idx) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  index={idx}
                  likes={likeCounts[post.slug] ?? 0}
                />
              ),
            )}
          </div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <p className="text-center text-muted py-20 text-sm">
            No posts found.
          </p>
        )}
      </section>
    </>
  );
}
