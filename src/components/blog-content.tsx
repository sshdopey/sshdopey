"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Post } from "@/lib/db";

function readingTime(content: string) {
  return Math.max(1, Math.round(content.split(/\s+/).length / 230));
}

function PostCard({ post, index }: { post: Post; index: number }) {
  const tags = post.tags
    ? post.tags.split(",").map((t) => t.trim())
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group block rounded-xl border border-line-faint overflow-hidden hover:border-line bg-surface/50 hover:bg-surface-hover transition-all duration-300 hover:-translate-y-0.5"
      >
        {post.cover_image && (
          <img
            src={post.cover_image}
            alt=""
            className="w-full h-36 object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        )}

        <div className="p-5">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-dim px-2 py-0.5 rounded-full border border-line-faint"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 className="text-primary font-semibold leading-snug mb-1.5 group-hover:text-secondary transition-colors">
            {post.title}
          </h3>

          <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-3">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-2.5 text-xs text-dim">
            <time>
              {new Date(post.published_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <span className="text-ghost">·</span>
            <span>{readingTime(post.content)} min read</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function FeaturedCard({ post }: { post: Post }) {
  const tags = post.tags
    ? post.tags.split(",").map((t) => t.trim())
    : [];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl border border-line overflow-hidden hover:border-ghost bg-surface/50 hover:bg-surface-hover transition-all duration-300 hover:-translate-y-0.5"
    >
      {post.cover_image && (
        <img
          src={post.cover_image}
          alt=""
          className="w-full h-40 object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
      )}

      <div className="p-5">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] text-dim px-2 py-0.5 rounded-full border border-line-faint"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-lg text-primary font-semibold leading-snug mb-2">
          {post.title}
        </h3>

        <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-3">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-2.5 text-xs text-dim">
          <time>
            {new Date(post.published_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </time>
          <span className="text-ghost">·</span>
          <span>{readingTime(post.content)} min</span>
        </div>
      </div>
    </Link>
  );
}

export function BlogContent({
  posts,
  featured,
  allTags,
}: {
  posts: Post[];
  featured: Post[];
  allTags: string[];
}) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = posts.filter((post) => {
    const matchSearch =
      search === "" ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchTag =
      !activeTag ||
      (post.tags &&
        post.tags
          .split(",")
          .map((t) => t.trim())
          .includes(activeTag));
    return matchSearch && matchTag;
  });

  const nonFeaturedFiltered = filtered.filter((p) => p.featured !== 1);
  const showFeatured = !search && !activeTag && featured.length > 0;

  return (
    <>
      {/* Search */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ghost"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface/50 border border-line-faint rounded-lg text-primary placeholder:text-ghost focus:outline-none focus:border-line"
        />
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer ${
              activeTag === null
                ? "border-primary text-primary bg-primary/5"
                : "border-line-faint text-muted hover:text-primary hover:border-line"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                setActiveTag(activeTag === tag ? null : tag)
              }
              className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer ${
                activeTag === tag
                  ? "border-primary text-primary bg-primary/5"
                  : "border-line-faint text-muted hover:text-primary hover:border-line"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Featured */}
      {showFeatured && (
        <section className="mb-12">
          <h2 className="text-xs text-muted uppercase tracking-[0.2em] font-medium mb-5">
            Featured
          </h2>
          <div
            className={`grid gap-4 ${
              featured.length === 1
                ? "grid-cols-1"
                : featured.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {featured.map((p) => (
              <FeaturedCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      {/* All posts */}
      <section>
        {(showFeatured || search || activeTag) && (
          <h2 className="text-xs text-muted uppercase tracking-[0.2em] font-medium mb-5">
            {search || activeTag ? "Results" : "All Posts"}
          </h2>
        )}
        <AnimatePresence mode="popLayout">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {(showFeatured ? nonFeaturedFiltered : filtered).map(
              (post, idx) => (
                <PostCard key={post.id} post={post} index={idx} />
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
