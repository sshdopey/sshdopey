import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { TiltCard } from "@/components/tilt-card";
import type { PostMeta } from "@/lib/posts";

export function KeepReading({
  posts,
  currentSlug,
  likeCounts,
}: {
  posts: PostMeta[];
  currentSlug: string;
  likeCounts: Record<string, number>;
}) {
  const others = posts.filter((p) => p.slug !== currentSlug).slice(0, 3);

  if (others.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 border-t border-line-faint">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-primary">Keep Reading</h2>
        <Link
          href="/blog"
          className="text-xs text-muted hover:text-accent transition-colors"
        >
          View all writing →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {others.map((post) => {
          const likes = likeCounts[post.slug] ?? 0;

          return (
            <TiltCard key={post.slug} className="h-full">
            <Link
              href={`/blog/${post.slug}`}
              className="group flex flex-col h-full rounded-xl border border-line-faint overflow-hidden hover:border-line bg-surface/50 hover:bg-surface-hover transition-all"
            >
              {post.cover_image && (
                <div className="relative w-full h-32 overflow-hidden">
                  <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-medium text-primary leading-snug line-clamp-2 group-hover:text-secondary transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-xs text-muted mt-1.5 leading-relaxed line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-dim mt-2.5">
                  <div className="flex items-center gap-2">
                    <time>
                      {new Date(post.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    <span className="text-ghost">·</span>
                    <span>{post.reading_time} min</span>
                  </div>
                  {likes > 0 && (
                    <span className="flex items-center gap-1 text-accent">
                      <Heart size={10} />
                      {likes}
                    </span>
                  )}
                </div>
              </div>
            </Link>
            </TiltCard>
          );
        })}
      </div>
    </div>
  );
}
