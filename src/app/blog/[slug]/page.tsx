import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marked } from "marked";
import { getPostBySlug, getLikeCount, getComments } from "@/lib/db";
import { FadeIn } from "@/components/fade-in";
import { ReadingProgress } from "@/components/reading-progress";
import { LikeButton } from "@/components/like-button";
import { CommentSection } from "@/components/comments";

marked.setOptions({ gfm: true, breaks: true });

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return { title: post.title, description: post.excerpt || undefined };
}

function readingTime(content: string): string {
  return `${Math.max(1, Math.ceil(content.split(/\s+/).length / 250))} min read`;
}

function formatDate(d: string): string {
  return new Date(d + "Z").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPost({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = await marked.parse(post.content);
  const likes = getLikeCount(post.slug);
  const comments = getComments(post.slug);

  return (
    <>
      <ReadingProgress />

      <article className="min-h-svh pt-32 sm:pt-40 pb-32 px-6">
        <div className="max-w-[680px] mx-auto">
          {/* Header */}
          <FadeIn>
            <header className="mb-14">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.15] text-white">
                {post.title}
              </h1>
              <div className="flex items-center gap-3 mt-5">
                <span className="font-mono text-xs text-zinc-600">
                  {formatDate(post.published_at)}
                </span>
                <span className="text-zinc-800">·</span>
                <span className="font-mono text-xs text-zinc-600">
                  {readingTime(post.content)}
                </span>
              </div>
              <div className="h-px bg-zinc-800/50 mt-10" />
            </header>
          </FadeIn>

          {/* Content */}
          <FadeIn delay={0.1}>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </FadeIn>

          {/* Like */}
          <FadeIn delay={0.15}>
            <div className="mt-16 pt-10 border-t border-zinc-900/50 flex items-center gap-3">
              <LikeButton slug={post.slug} initialCount={likes} />
            </div>
          </FadeIn>

          {/* Comments */}
          <FadeIn delay={0.2}>
            <CommentSection slug={post.slug} initialComments={comments} />
          </FadeIn>
        </div>
      </article>
    </>
  );
}
