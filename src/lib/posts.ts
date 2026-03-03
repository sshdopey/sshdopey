import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { readingTime } from "./utils";

const postsDir = path.join(process.cwd(), "content/posts");

export interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  published_at: string;
  cover_image: string;
  tags: string[];
  featured: boolean;
  reading_time: number;
}

export interface Post extends PostMeta {
  content: string;
}

function parsePost(slug: string, raw: string): Post {
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? "",
    excerpt: data.excerpt ?? "",
    published_at: data.published_at ?? "",
    cover_image: data.cover_image ?? "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    featured: Boolean(data.featured),
    content,
    reading_time: readingTime(content),
  };
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(postsDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return parsePost(slug, fs.readFileSync(filePath, "utf-8"));
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDir)) return [];
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const slug = f.replace(/\.mdx$/, "");
      return parsePost(slug, fs.readFileSync(path.join(postsDir, f), "utf-8"));
    })
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );
}

export function getAllPostsMeta(): PostMeta[] {
  return getAllPosts().map(({ content: _, ...meta }) => meta);
}

export function getFeaturedPosts(limit = 3): PostMeta[] {
  return getAllPostsMeta()
    .filter((p) => p.featured)
    .slice(0, limit);
}

export function getLatestPostsMeta(limit = 20): PostMeta[] {
  return getAllPostsMeta().slice(0, limit);
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of getAllPosts()) {
    for (const t of post.tags) tags.add(t);
  }
  return Array.from(tags).sort();
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(postsDir)) return [];
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
