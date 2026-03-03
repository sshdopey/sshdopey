import Link from "next/link";
import { getFeaturedPost, getLatestPosts } from "@/lib/db";
import { FadeIn, FadeInOnScroll } from "@/components/fade-in";

export const dynamic = "force-dynamic";

function readingTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 250));
}

function formatDate(d: string): string {
  return new Date(d + "Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Home() {
  const featured = getFeaturedPost();
  const posts = getLatestPosts(10);
  const nonFeatured = posts.filter((p) => p.slug !== featured?.slug);

  return (
    <>
      {/* Hero */}
      <section className="pt-36 sm:pt-44 pb-20 sm:pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-none">
              Dopey
              <span className="inline-block w-[3px] h-[0.65em] bg-zinc-600 ml-2 animate-blink align-baseline" />
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="mt-4 text-base sm:text-lg text-zinc-500 font-mono">
              Software Engineer
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="px-6 pb-16">
          <div className="max-w-2xl mx-auto">
            <FadeInOnScroll>
              <p className="font-mono text-xs tracking-widest uppercase text-zinc-700 mb-5">
                Featured
              </p>
            </FadeInOnScroll>
            <FadeInOnScroll delay={0.05}>
              <Link
                href={`/blog/${featured.slug}`}
                className="group block border border-zinc-800/50 rounded-xl p-6 sm:p-8 hover:border-zinc-700/60 transition-colors duration-200"
              >
                <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 group-hover:text-white transition-colors duration-200 tracking-tight">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm sm:text-base text-zinc-500 leading-relaxed line-clamp-2">
                  {featured.excerpt}
                </p>
                <p className="mt-4 font-mono text-xs text-zinc-700">
                  {formatDate(featured.published_at)} ·{" "}
                  {readingTime(featured.content)} min read
                </p>
              </Link>
            </FadeInOnScroll>
          </div>
        </section>
      )}

      {/* Separator */}
      <div className="max-w-2xl mx-auto px-6">
        <div className="h-px bg-zinc-900/60" />
      </div>

      {/* Posts */}
      {nonFeatured.length > 0 && (
        <section className="px-6 pt-12 pb-28">
          <div className="max-w-2xl mx-auto">
            <FadeInOnScroll>
              <p className="font-mono text-xs tracking-widest uppercase text-zinc-700 mb-8">
                Writing
              </p>
            </FadeInOnScroll>

            {nonFeatured.map((post, i) => (
              <FadeInOnScroll key={post.slug} delay={i * 0.04}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block py-5 border-b border-zinc-900/50 first:pt-0"
                >
                  <h3 className="text-base sm:text-lg font-medium text-zinc-300 group-hover:text-white transition-colors duration-200 tracking-tight">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-1 text-sm text-zinc-600 line-clamp-1">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="mt-2 font-mono text-xs text-zinc-700">
                    {formatDate(post.published_at)} ·{" "}
                    {readingTime(post.content)} min
                  </p>
                </Link>
              </FadeInOnScroll>
            ))}

            <FadeInOnScroll>
              <Link
                href="/blog"
                className="inline-block mt-8 font-mono text-xs text-zinc-600 hover:text-zinc-300 transition-colors duration-200"
              >
                All posts →
              </Link>
            </FadeInOnScroll>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-900/50 py-12 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="font-mono text-xs text-zinc-800">
            sshdopey.com
          </span>
          <span className="font-mono text-xs text-zinc-800">
            {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </>
  );
}
