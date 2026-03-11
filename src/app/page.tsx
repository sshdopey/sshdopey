import type { Metadata } from "next";
import { ArrowDown } from "lucide-react";
import { getLatestPostsMeta } from "@/lib/posts";
import { getLikeCounts } from "@/lib/db";
import { HeroName, HeroHandle } from "@/components/hero-name";
import { LazyHeroVisual } from "@/components/lazy-hero-visual";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { SocialLinks } from "@/components/social-links";
import { PersonJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Dopey — Software Engineer",
  description:
    "Building AI systems and high-performance tools. Python for the models. Rust for everything else.",
  keywords: [
    "Dopey",
    "software engineer",
    "AI systems",
    "Rust developer",
    "Python developer",
    "Fairmeld",
  ],
  openGraph: {
    title: "Dopey — Software Engineer",
    description:
      "Building AI systems and high-performance tools. Python for the models. Rust for everything else.",
    images: [{ url: "/og/home.png", width: 1200, height: 630 }],
  },
};

export default function Home() {
  const recentPosts = getLatestPostsMeta(3);
  const likeCounts = getLikeCounts();

  return (
    <>
      <PersonJsonLd />
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

            <div className="hero-fade-1">
              <p className="text-secondary text-lg sm:text-xl leading-relaxed mt-8 max-w-xl">
                I build AI systems and high-performance tools.
                <br className="hidden sm:block" />
                Python for the models. Rust for everything else.
              </p>
            </div>

            <div className="hero-fade-2">
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
            </div>

            <div className="hero-fade-3">
              <SocialLinks variant="hero" className="mt-8" />
            </div>
          </div>

          <LazyHeroVisual />
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float hero-fade-4">
          <ArrowDown size={20} className="text-ghost" />
        </div>
      </section>

      {recentPosts.length > 0 && (
        <FeaturedCarousel posts={recentPosts} likeCounts={likeCounts} />
      )}
    </>
  );
}
