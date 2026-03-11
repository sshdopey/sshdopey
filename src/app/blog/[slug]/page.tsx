import { notFound } from "next/navigation";
import Image from "next/image";
import { Clock } from "lucide-react";
import { getPostBySlug, getAllSlugs } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import { getComments, getLikeCount, getLikeCounts } from "@/lib/db";
import { getLatestPostsMeta } from "@/lib/posts";
import { ReadingProgress } from "@/components/reading-progress";
import { CodeCopy } from "@/components/code-copy";
import { AudioPlayer } from "@/components/audio-player";
import { HeaderShareBtn } from "@/components/header-share";
import { FadeIn } from "@/components/fade-in";
import { PostInteractions } from "@/components/post-interactions";
import { KeepReading } from "@/components/keep-reading";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/json-ld";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };

  const ogImage = `/og/${slug}.png`;

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${slug}`,
      publishedTime: post.published_at,
      authors: ["Dopey"],
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
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
  const recommended = getLatestPostsMeta(10);
  const likeCounts = getLikeCounts();
  const html = await renderMarkdown(post.content);

  const date = formatDate(post.published_at);

  return (
    <>
      <ArticleJsonLd
        title={post.title}
        excerpt={post.excerpt}
        slug={post.slug}
        publishedAt={post.published_at}
        coverImage={post.cover_image}
        tags={post.tags}
        wordCount={post.content.split(/\s+/).length}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://sshdopey.com" },
          { name: "Blog", url: "https://sshdopey.com/blog" },
          { name: post.title, url: `https://sshdopey.com/blog/${post.slug}` },
        ]}
      />
      <ReadingProgress />
      <CodeCopy />

      {post.cover_image && (
        <FadeIn>
          <div className="relative w-full h-56 sm:h-72 lg:h-96 overflow-hidden">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-page" />
          </div>
        </FadeIn>
      )}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <FadeIn>
          <header className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.15] mb-4 sm:mb-5">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-y-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="flex items-center gap-1.5 text-xs sm:text-sm text-muted">
                  <Clock size={14} />
                  {post.reading_time} min read
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-semibold uppercase tracking-[0.12em] text-dim bg-surface-hover px-1.5 py-0.5 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <AudioPlayer />
                <HeaderShareBtn slug={post.slug} title={post.title} />
                <time className="text-xs sm:text-sm text-muted">{date}</time>
              </div>
            </div>
          </header>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        </FadeIn>

        <PostInteractions
          postSlug={post.slug}
          postTitle={post.title}
          likeCount={likeCount}
          initialComments={comments}
        />
      </article>

      <KeepReading
        posts={recommended}
        currentSlug={slug}
        currentPost={post}
        likeCounts={likeCounts}
      />
    </>
  );
}
