import Database from "better-sqlite3";
import path from "path";
import { seedIfEmpty } from "./seed";

export interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
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
    `);

    seedIfEmpty(_db);
  }
  return _db;
}

// --- Posts ---

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

export function getFeaturedPost(): Post | undefined {
  return getDb()
    .prepare("SELECT * FROM posts WHERE featured = 1 ORDER BY published_at DESC LIMIT 1")
    .get() as Post | undefined;
}

export function getLatestPosts(limit = 10): Post[] {
  return getDb()
    .prepare("SELECT * FROM posts ORDER BY published_at DESC LIMIT ?")
    .all(limit) as Post[];
}

export function createPost(
  title: string,
  slug: string,
  content: string,
  excerpt: string,
  featured: boolean,
) {
  const db = getDb();
  if (featured) {
    db.prepare("UPDATE posts SET featured = 0 WHERE featured = 1").run();
  }
  return db
    .prepare(
      "INSERT INTO posts (title, slug, content, excerpt, featured) VALUES (?, ?, ?, ?, ?)",
    )
    .run(title, slug, content, excerpt, featured ? 1 : 0);
}

// --- Likes ---

export function getLikeCount(postSlug: string): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) as count FROM likes WHERE post_slug = ?")
    .get(postSlug) as { count: number };
  return row.count;
}

export function addLike(postSlug: string): number {
  getDb().prepare("INSERT INTO likes (post_slug) VALUES (?)").run(postSlug);
  return getLikeCount(postSlug);
}

// --- Subscribers ---

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

// --- Comments ---

export function getComments(postSlug: string): Comment[] {
  return getDb()
    .prepare(
      `SELECT c.*, s.name as subscriber_name
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
