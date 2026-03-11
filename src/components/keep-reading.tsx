"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { TiltCard } from "@/components/tilt-card";
import { PostLikeBadge } from "@/components/liked-posts-provider";
import { useLikeCounts } from "@/hooks/use-like-counts";
import { formatDate } from "@/lib/utils";
import type { PostMeta } from "@/lib/posts";

function sharedTagCount(a: PostMeta, b: PostMeta): number {
  return a.tags.filter((t) => b.tags.includes(t)).length;
}

export function KeepReading({
  posts,
  currentSlug,
  currentPost,
  likeCounts: initialLikeCounts,
}: {
  posts: PostMeta[];
  currentSlug: string;
  currentPost?: PostMeta | null;
  likeCounts: Record<string, number>;
}) {
  const likeCounts = useLikeCounts(initialLikeCounts);
  const others = posts
    .filter((p) => p.slug !== currentSlug)
    .sort((a, b) => {
      if (currentPost) {
        const aShared = sharedTagCount(a, currentPost);
        const bShared = sharedTagCount(b, currentPost);
        if (bShared !== aShared) return bShared - aShared;
      }
      return (
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    })
    .slice(0, 3);

  if (others.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-14 border-t border-line-faint">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs text-muted uppercase tracking-[0.2em] font-medium">
          Keep Reading
        </h2>
        <Link
          href="/blog"
          className="text-xs text-muted hover:text-accent transition-colors group"
        >
          View all writing{" "}
          <span className="inline-block group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </Link>
      </div>

      <div className="grid gap-6 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((post) => {
          const likes = likeCounts[post.slug] ?? 0;
          return (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="h-full"
            >
              <TiltCard className="h-full">
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="h-full"
                >
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
                          {post.tags.slice(0, 3).map((tag) => (
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
                          <time>{formatDate(post.published_at)}</time>
                          <span className="text-dim">·</span>
                          <span>{post.reading_time} min</span>
                        </div>
                        <PostLikeBadge
                          slug={post.slug}
                          count={likes}
                          size={11}
                          className="flex items-center gap-1"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
