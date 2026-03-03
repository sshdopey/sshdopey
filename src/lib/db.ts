import Database from "better-sqlite3";
import path from "path";
import { seedIfEmpty } from "./seed";

export interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  cover_image: string;
  tags: string;
  featured: number;
  published_at: string;
  updated_at: string;
}

export interface Subscriber {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Comment {
  id: number;
  post_slug: string;
  subscriber_id: number;
  parent_id: number | null;
  content: string;
  created_at: string;
  subscriber_name: string;
  like_count: number;
}

const DB_PATH = path.join(process.cwd(), "sshdopey.db");
let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");

    _db.exec(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT DEFAULT '',
        cover_image TEXT DEFAULT '',
        tags TEXT DEFAULT '',
        featured INTEGER DEFAULT 0,
        published_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_slug TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_slug TEXT NOT NULL,
        subscriber_id INTEGER NOT NULL,
        parent_id INTEGER,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (subscriber_id) REFERENCES subscribers(id)
      );

      CREATE TABLE IF NOT EXISTS comment_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        comment_id INTEGER NOT NULL,
        subscriber_id INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(comment_id, subscriber_id),
        FOREIGN KEY (comment_id) REFERENCES comments(id),
        FOREIGN KEY (subscriber_id) REFERENCES subscribers(id)
      );
    `);

    seedIfEmpty(_db);
  }
  return _db;
}

// ── Posts ──

export function getAllPosts(): Post[] {
  return getDb()
    .prepare("SELECT * FROM posts ORDER BY published_at DESC")
    .all() as Post[];
}

export function getPostBySlug(slug: string): Post | undefined {
  return getDb()
    .prepare("SELECT * FROM posts WHERE slug = ?")
    .get(slug) as Post | undefined;
}

export function getFeaturedPosts(limit = 3): Post[] {
  return getDb()
    .prepare(
      "SELECT * FROM posts WHERE featured = 1 ORDER BY published_at DESC LIMIT ?",
    )
    .all(limit) as Post[];
}

export function getLatestPosts(limit = 20): Post[] {
  return getDb()
    .prepare("SELECT * FROM posts ORDER BY published_at DESC LIMIT ?")
    .all(limit) as Post[];
}

export function getAdjacentPosts(
  publishedAt: string,
): { prev?: Post; next?: Post } {
  const db = getDb();
  const prev = db
    .prepare(
      "SELECT * FROM posts WHERE published_at < ? ORDER BY published_at DESC LIMIT 1",
    )
    .get(publishedAt) as Post | undefined;
  const next = db
    .prepare(
      "SELECT * FROM posts WHERE published_at > ? ORDER BY published_at ASC LIMIT 1",
    )
    .get(publishedAt) as Post | undefined;
  return { prev, next };
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagSet = new Set<string>();
  for (const p of posts) {
    if (p.tags) p.tags.split(",").forEach((t) => tagSet.add(t.trim()));
  }
  return Array.from(tagSet).sort();
}

export function createPost(
  title: string,
  slug: string,
  content: string,
  excerpt: string,
  featured: boolean,
  tags: string,
  coverImage: string,
) {
  const db = getDb();
  if (featured) {
    const count = db
      .prepare("SELECT COUNT(*) as c FROM posts WHERE featured = 1")
      .get() as { c: number };
    if (count.c >= 3) {
      db.prepare(
        "UPDATE posts SET featured = 0 WHERE id = (SELECT id FROM posts WHERE featured = 1 ORDER BY published_at ASC LIMIT 1)",
      ).run();
    }
  }
  return db
    .prepare(
      "INSERT INTO posts (title, slug, content, excerpt, featured, tags, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(title, slug, content, excerpt, featured ? 1 : 0, tags, coverImage);
}

// ── Likes ──

export function getLikeCount(postSlug: string): number {
  const r = getDb()
    .prepare("SELECT COUNT(*) as c FROM likes WHERE post_slug = ?")
    .get(postSlug) as { c: number };
  return r.c;
}

export function addLike(postSlug: string): number {
  getDb().prepare("INSERT INTO likes (post_slug) VALUES (?)").run(postSlug);
  return getLikeCount(postSlug);
}

// ── Subscribers ──

export function getSubscriberByEmail(email: string): Subscriber | undefined {
  return getDb()
    .prepare("SELECT * FROM subscribers WHERE email = ?")
    .get(email) as Subscriber | undefined;
}

export function createSubscriber(name: string, email: string): Subscriber {
  const db = getDb();
  db.prepare("INSERT INTO subscribers (name, email) VALUES (?, ?)").run(
    name,
    email,
  );
  return db
    .prepare("SELECT * FROM subscribers WHERE email = ?")
    .get(email) as Subscriber;
}

// ── Comments ──

export function getComments(postSlug: string): Comment[] {
  return getDb()
    .prepare(
      `SELECT c.*, s.name as subscriber_name,
        (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as like_count
       FROM comments c
       JOIN subscribers s ON c.subscriber_id = s.id
       WHERE c.post_slug = ?
       ORDER BY c.created_at ASC`,
    )
    .all(postSlug) as Comment[];
}

export function addComment(
  postSlug: string,
  subscriberId: number,
  content: string,
  parentId: number | null,
): void {
  getDb()
    .prepare(
      "INSERT INTO comments (post_slug, subscriber_id, content, parent_id) VALUES (?, ?, ?, ?)",
    )
    .run(postSlug, subscriberId, content, parentId);
}

// ── Comment Likes ──

export function addCommentLike(commentId: number, subscriberId: number): void {
  getDb()
    .prepare(
      "INSERT OR IGNORE INTO comment_likes (comment_id, subscriber_id) VALUES (?, ?)",
    )
    .run(commentId, subscriberId);
}

export function getCommentLikeCount(commentId: number): number {
  const r = getDb()
    .prepare("SELECT COUNT(*) as c FROM comment_likes WHERE comment_id = ?")
    .get(commentId) as { c: number };
  return r.c;
}
