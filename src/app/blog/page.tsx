import type { Metadata } from "next";
import { getAllPostsMeta, getFeaturedPosts, getAllTags } from "@/lib/posts";
import { getLikeCounts } from "@/lib/db";
import { FadeIn } from "@/components/fade-in";
import { BlogContent } from "@/components/blog-content";

export const metadata: Metadata = {
  title: "Writing",
  description: "Thoughts on engineering, architecture, and building things that last.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Writing — Dopey",
    description: "Thoughts on engineering, architecture, and building things that last.",
    url: "/blog",
    images: [{ url: "/og/blog.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Writing — Dopey",
    description: "Thoughts on engineering, architecture, and building things that last.",
  },
};

export default function BlogIndex() {
  const posts = getAllPostsMeta();
  const featured = getFeaturedPosts(1);
  const allTags = getAllTags();
  const likeCounts = getLikeCounts();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-24">
      <FadeIn>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Writing<span className="text-accent animate-subtle-pulse">.</span>
        </h1>
        <p className="text-muted text-sm mb-10">
          Thoughts on engineering, architecture, and building things that last.
        </p>
      </FadeIn>

      <BlogContent
        posts={posts}
        featured={featured}
        allTags={allTags}
        likeCounts={likeCounts}
      />
    </div>
  );
}
