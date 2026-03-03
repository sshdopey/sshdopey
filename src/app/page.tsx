import Link from "next/link";
import { getFeaturedPosts } from "@/lib/db";
import { StaggerText } from "@/components/stagger-text";
import { FadeIn, FadeInOnScroll } from "@/components/fade-in";
import { SocialLinks } from "@/components/social-links";

function readingTime(content: string) {
  return Math.max(1, Math.round(content.split(/\s+/).length / 230));
}

export default function Home() {
  const featured = getFeaturedPosts(3);

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center relative px-6">
        <div className="max-w-5xl mx-auto w-full">
          <h1 className="text-7xl sm:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.85]">
            <StaggerText text="Dopey" />
          </h1>

          <FadeIn delay={0.35}>
            <p className="font-mono text-sm text-muted mt-5 tracking-wide">
              @sshdopey
            </p>
          </FadeIn>

          <FadeIn delay={0.55}>
            <p className="text-secondary text-lg sm:text-xl leading-relaxed mt-8 max-w-xl">
              I build AI systems and high-performance tools.
              <br className="hidden sm:block" />
              Python for the models. Rust for everything else.
            </p>
          </FadeIn>

          <FadeIn delay={0.7}>
            <p className="text-muted text-sm mt-5 max-w-xl">
              Currently building{" "}
              <a
                href="https://fairmeld.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 decoration-ghost hover:decoration-secondary transition-all"
              >
                Fairmeld
              </a>{" "}
              — an AI system everyone would trust.
            </p>
          </FadeIn>

          <FadeIn delay={0.85}>
            <SocialLinks variant="hero" className="mt-8" />
          </FadeIn>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <FadeIn delay={1.2}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-ghost"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </FadeIn>
        </div>
      </section>

      {/* ─── Featured Writing ─── */}
      {featured.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <FadeInOnScroll>
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xs text-muted uppercase tracking-[0.2em] font-medium">
                Featured Writing
              </h2>
              <Link
                href="/blog"
                className="text-xs text-ghost hover:text-muted transition-colors group"
              >
                All posts{" "}
                <span className="inline-block group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </Link>
            </div>
          </FadeInOnScroll>

          <div
            className={`grid gap-4 ${
              featured.length === 1
                ? "grid-cols-1"
                : featured.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {featured.map((post, i) => {
              const tags = post.tags
                ? post.tags.split(",").map((t) => t.trim())
                : [];

              return (
                <FadeInOnScroll key={post.id} delay={i * 0.1}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block rounded-xl border border-line-faint overflow-hidden hover:border-line bg-surface/50 hover:bg-surface-hover transition-all duration-300 hover:-translate-y-0.5"
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
                              className="text-[11px] text-muted px-2 py-0.5 rounded-full border border-line-faint"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <h3 className="text-primary font-semibold leading-snug mb-2 group-hover:text-secondary transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center gap-2.5 text-xs text-muted">
                        <time>
                          {new Date(post.published_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )}
                        </time>
                        <span className="text-dim">·</span>
                        <span>{readingTime(post.content)} min</span>
                      </div>
                    </div>
                  </Link>
                </FadeInOnScroll>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
