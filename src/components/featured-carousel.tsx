"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { TiltCard } from "@/components/tilt-card";
import { PostLikeBadge } from "@/components/liked-posts-provider";
import { FadeInOnScroll } from "@/components/fade-in";
import type { PostMeta } from "@/lib/posts";

function PostGridCard({
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        type: "spring",
        stiffness: 260,
        damping: 24,
      }}
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
                  priority={index === 0}
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
}

export function FeaturedCarousel({
  posts,
  likeCounts,
}: {
  posts: PostMeta[];
  likeCounts: Record<string, number>;
}) {
  if (posts.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 w-full">
      <FadeInOnScroll>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs text-muted uppercase tracking-[0.2em] font-medium">
            Recent Writing
          </h2>
          <Link
            href="/blog"
            className="text-xs text-muted hover:text-accent transition-colors group"
          >
            All posts{" "}
            <span className="inline-block group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </Link>
        </div>
      </FadeInOnScroll>

      <div className="grid gap-6 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <PostGridCard
            key={post.slug}
            post={post}
            index={index}
            likes={likeCounts[post.slug] ?? 0}
          />
        ))}
      </div>
    </section>
  );
}
