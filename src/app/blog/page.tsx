import { getAllPosts, getFeaturedPosts, getAllTags } from "@/lib/db";
import { FadeIn } from "@/components/fade-in";
import { BlogContent } from "@/components/blog-content";

export const metadata = {
  title: "Writing — Dopey",
  description: "Thoughts on engineering, architecture, and building things that last.",
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const featured = getFeaturedPosts(3);
  const allTags = getAllTags();

  return (
    <div className="max-w-5xl mx-auto px-6 pt-14 sm:pt-20 pb-24">
      <FadeIn>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Writing
        </h1>
        <p className="text-muted text-sm mb-10">
          Thoughts on engineering, architecture, and building things that last.
        </p>
      </FadeIn>

      <BlogContent posts={posts} featured={featured} allTags={allTags} />
    </div>
  );
}
