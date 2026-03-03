import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowDown } from "lucide-react";
import { getFeaturedPosts } from "@/lib/posts";
import { getLikeCounts } from "@/lib/db";
import { HeroName, HeroHandle } from "@/components/hero-name";
import { HeroVisual } from "@/components/hero-visual";
import { FadeIn, FadeInOnScroll } from "@/components/fade-in";
import { SocialLinks } from "@/components/social-links";

export default function Home() {
  const featured = getFeaturedPosts(3);
  const likeCounts = getLikeCounts();

  return (
    <>
      <section className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center relative px-4 sm:px-6 overflow-visible">
        <div className="absolute inset-0 hero-grid pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full relative">
          <div className="max-w-xl lg:max-w-2xl">
            <div className="flex items-baseline gap-3 sm:gap-6 flex-wrap">
              <h1 className="text-5xl sm:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.85]">
                <HeroName />
              </h1>
              <HeroHandle />
            </div>

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
                  className="text-accent underline underline-offset-4 decoration-accent/50 hover:decoration-accent transition-all"
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

          <HeroVisual />
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <FadeIn delay={1.2}>
            <ArrowDown size={20} className="text-ghost" />
          </FadeIn>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
          <FadeInOnScroll>
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xs text-muted uppercase tracking-[0.2em] font-medium">
                Featured Writing
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
              const likes = likeCounts[post.slug] ?? 0;

              return (
                <FadeInOnScroll key={post.slug} delay={i * 0.1}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col h-full rounded-xl border border-line-faint overflow-hidden hover:border-line bg-surface/50 hover:bg-surface-hover transition-all duration-300 hover:-translate-y-0.5"
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
                      <h3 className="text-primary font-semibold leading-snug mb-2 group-hover:text-secondary transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-3 flex-1">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted mt-auto">
                        <div className="flex items-center gap-2.5">
                          <time>
                            {new Date(post.published_at).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" },
                            )}
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
                </FadeInOnScroll>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
