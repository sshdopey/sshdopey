import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts, getFeaturedPost } from "@/lib/db";
import { FadeIn, FadeInOnScroll } from "@/components/fade-in";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on software, engineering, and building things.",
};

function readingTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 250));
}

function formatDate(d: string): string {
  return new Date(d + "Z").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogIndex() {
  const posts = getAllPosts();
  const featured = getFeaturedPost();
  const rest = posts.filter((p) => p.slug !== featured?.slug);

  return (
    <main className="min-h-svh pt-28 sm:pt-36 pb-32 px-6">
      <div className="max-w-2xl mx-auto">
        <FadeIn>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 mb-2">
            Writing
          </h1>
          <p className="text-base text-zinc-600 leading-relaxed">
            Long-form thinking on engineering and the craft of building.
          </p>
        </FadeIn>

        {posts.length === 0 ? (
          <FadeIn delay={0.15}>
            <p className="mt-16 text-sm text-zinc-700 font-mono">
              Nothing here yet.
            </p>
          </FadeIn>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <FadeIn delay={0.1}>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group block border border-zinc-800/50 rounded-xl p-6 sm:p-8 mt-12 hover:border-zinc-700/60 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-xs text-zinc-600 tracking-wide uppercase">
                      Featured
                    </span>
                    <span className="font-mono text-xs text-zinc-700">
                      · {readingTime(featured.content)} min read
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 group-hover:text-white transition-colors duration-200 tracking-tight">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-zinc-500 leading-relaxed">
                    {featured.excerpt}
                  </p>
                  <p className="mt-4 font-mono text-xs text-zinc-700">
                    {formatDate(featured.published_at)}
                  </p>
                </Link>
              </FadeIn>
            )}

            {/* Separator */}
            <div className="h-px bg-zinc-900/50 mt-10 mb-2" />

            {/* All posts */}
            {rest.map((post, i) => (
              <FadeInOnScroll key={post.slug} delay={i * 0.04}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block py-6 border-b border-zinc-900/40"
                >
                  <h3 className="text-base sm:text-lg font-medium text-zinc-300 group-hover:text-white transition-colors duration-200 tracking-tight">
                    {post.title}
                    {post.featured === 1 && (
                      <span className="ml-2 text-xs text-zinc-700 font-mono">
                        ★
                      </span>
                    )}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed line-clamp-1">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="mt-2 font-mono text-xs text-zinc-700">
                    {formatDate(post.published_at)} ·{" "}
                    {readingTime(post.content)} min read
                  </p>
                </Link>
              </FadeInOnScroll>
            ))}
          </>
        )}
      </div>
    </main>
  );
}
