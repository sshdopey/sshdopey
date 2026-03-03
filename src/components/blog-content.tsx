"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Search } from "lucide-react";
import { TiltCard } from "@/components/tilt-card";
import type { PostMeta } from "@/lib/posts";

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
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
      className="h-full"
    >
      <TiltCard className="h-full">
        <Link
          href={`/blog/${post.slug}`}
          className="group flex flex-col h-full rounded-xl border border-line-faint overflow-hidden hover:border-line bg-surface/50 hover:bg-surface-hover transition-all duration-300 hover:-translate-y-0.5"
        >
        {post.cover_image && (
          <div className="relative w-full h-36 overflow-hidden">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>
        )}

        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-primary font-semibold leading-snug mb-1.5 group-hover:text-secondary transition-colors">
            {post.title}
          </h3>

          <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-3 flex-1">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between text-xs text-muted mt-auto">
            <div className="flex items-center gap-2.5">
              <time>
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              <span className="text-dim">·</span>
              <span>{post.reading_time} min read</span>
            </div>
            {likes > 0 && (
              <span className="flex items-center gap-1 text-accent">
                <Heart size={11} />
                {likes}
              </span>
            )}
          </div>
        </div>
      </Link>
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
        className="group flex flex-col h-full rounded-xl border border-line overflow-hidden hover:border-ghost bg-surface/50 hover:bg-surface-hover transition-all duration-300 hover:-translate-y-0.5"
      >
      {post.cover_image && (
        <div className="relative w-full h-40 overflow-hidden">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg text-primary font-semibold leading-snug mb-2">
          {post.title}
        </h3>

        <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-3 flex-1">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-muted mt-auto">
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
          {likes > 0 && (
            <span className="flex items-center gap-1 text-accent">
              <Heart size={11} />
              {likes}
            </span>
          )}
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
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface/50 border border-line-faint rounded-lg text-primary placeholder:text-ghost focus:outline-none focus:border-accent/40"
        />
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
              activeTag === null
                ? "bg-accent/10 text-accent"
                : "bg-surface-hover text-muted hover:text-accent"
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
              className={`text-xs px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                activeTag === tag
                  ? "bg-accent/10 text-accent"
                  : "bg-surface-hover text-muted hover:text-accent"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

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
              <FeaturedCard
                key={p.slug}
                post={p}
                likes={likeCounts[p.slug] ?? 0}
              />
            ))}
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
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
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
