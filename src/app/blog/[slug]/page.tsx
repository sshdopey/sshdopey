import { notFound } from "next/navigation";
import { marked } from "marked";
import hljs from "highlight.js";
import {
  getPostBySlug,
  getComments,
  getLikeCount,
  getLatestPosts,
} from "@/lib/db";
import { ReadingProgress } from "@/components/reading-progress";
import { CodeCopy } from "@/components/code-copy";
import { FadeIn } from "@/components/fade-in";
import { PostInteractions } from "@/components/post-interactions";

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readingTime(content: string) {
  return Math.max(1, Math.round(content.split(/\s+/).length / 230));
}

function renderMarkdown(content: string): string {
  const renderer = new marked.Renderer();

  renderer.code = function (
    this: unknown,
    token: { text: string; lang?: string },
  ): string {
    const text = token.text;
    const lang = token.lang || "";
    const language = lang && hljs.getLanguage(lang) ? lang : undefined;
    const highlighted = language
      ? hljs.highlight(text, { language }).value
      : escapeHtml(text);
    const displayLang = lang || "text";

    return `<div class="code-block"><div class="code-header"><span class="code-lang">${displayLang}</span><button class="copy-btn">Copy</button></div><pre><code class="hljs">${highlighted}</code></pre></div>`;
  };

  marked.setOptions({ renderer, gfm: true, breaks: false });
  return marked.parse(content) as string;
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
  const html = renderMarkdown(post.content);

  const tags = post.tags
    ? post.tags.split(",").map((t) => t.trim())
    : [];

  return (
    <>
      <ReadingProgress />
      <CodeCopy />

      <article className="max-w-5xl mx-auto px-6 pt-14 sm:pt-20 pb-16">
        {/* Cover image */}
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

        {/* Header */}
        <FadeIn>
          <header className="mb-12 max-w-4xl">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.15] mb-5">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
              <time>
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              <span className="text-ghost">·</span>
              <span>{readingTime(post.content)} min read</span>
              {tags.length > 0 && (
                <>
                  <span className="text-ghost">·</span>
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-dim px-2 py-0.5 rounded-full border border-line-faint"
                    >
                      {tag}
                    </span>
                  ))}
                </>
              )}
            </div>
          </header>
        </FadeIn>

        {/* Content */}
        <FadeIn delay={0.15}>
          <div
            className="prose max-w-4xl"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </FadeIn>

        {/* Interactive sections */}
        <div className="max-w-4xl">
          <PostInteractions
            post={post}
            likeCount={likeCount}
            initialComments={comments}
            recommended={recommended}
          />
        </div>
      </article>
    </>
  );
}
