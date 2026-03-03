import Link from "next/link";
import { Heart } from "lucide-react";
import type { Post } from "@/lib/db";
import { readingTime } from "@/lib/utils";

export function KeepReading({
  posts,
  currentSlug,
  likeCounts,
}: {
  posts: Post[];
  currentSlug: string;
  likeCounts: Record<string, number>;
}) {
  const others = posts.filter((p) => p.slug !== currentSlug).slice(0, 3);

  if (others.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 border-t border-line-faint">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-primary">Keep Reading</h2>
        <Link
          href="/blog"
          className="text-xs text-muted hover:text-accent transition-colors"
        >
          View all writing →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {others.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group block rounded-xl border border-line-faint overflow-hidden hover:border-line bg-surface/50 hover:bg-surface-hover transition-all"
          >
            {post.cover_image && (
              <img
                src={post.cover_image}
                alt=""
                className="w-full h-32 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-sm font-medium text-primary leading-snug line-clamp-2 group-hover:text-secondary transition-colors">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-xs text-muted mt-1.5 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-dim mt-2.5">
                <span>{readingTime(post.content)} min read</span>
                {(likeCounts[post.slug] ?? 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <Heart size={11} />
                    {likeCounts[post.slug]}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
