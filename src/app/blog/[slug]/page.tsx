import { notFound } from "next/navigation";
import {
  getPostBySlug,
  getComments,
  getLikeCount,
  getLatestPosts,
} from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { ReadingProgress } from "@/components/reading-progress";
import { CodeCopy } from "@/components/code-copy";
import { AudioPlayer } from "@/components/audio-player";
import { FadeIn } from "@/components/fade-in";
import { PostInteractions } from "@/components/post-interactions";

function readingTime(content: string) {
  return Math.max(1, Math.round(content.split(/\s+/).length / 230));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} — Dopey`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const comments = getComments(slug);
  const likeCount = getLikeCount(slug);
  const recommended = getLatestPosts(10);
  const html = await renderMarkdown(post.content);

  const tags = post.tags ? post.tags.split(",").map((t) => t.trim()) : [];
  const mins = readingTime(post.content);
  const date = new Date(post.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <ReadingProgress />
      <CodeCopy />

      <article className="max-w-4xl mx-auto px-6 pt-14 sm:pt-20 pb-16">
        {post.cover_image && (
          <FadeIn>
            <div className="mb-10 -mx-6 sm:mx-0 overflow-hidden sm:rounded-xl">
              <img
                src={post.cover_image}
                alt=""
                className="w-full h-56 sm:h-80 object-cover"
              />
            </div>
          </FadeIn>
        )}

        <FadeIn>
          <header className="mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.15] mb-5">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm text-muted">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {mins} min read
                </span>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-muted px-2 py-0.5 rounded-full border border-line-faint"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <AudioPlayer />
                <time className="text-sm text-muted">{date}</time>
              </div>
            </div>
          </header>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </FadeIn>

        <PostInteractions
          post={post}
          likeCount={likeCount}
          initialComments={comments}
          recommended={recommended}
        />
      </article>
    </>
  );
}
