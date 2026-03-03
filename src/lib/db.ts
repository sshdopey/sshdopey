import Database from "better-sqlite3";
import path from "path";
import { seedIfEmpty } from "./seed";
import { createId } from "./utils";

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_slug: string;
  subscriber_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
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
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_slug TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        post_slug TEXT NOT NULL,
        subscriber_id TEXT NOT NULL,
        parent_id TEXT,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (subscriber_id) REFERENCES subscribers(id)
      );

      CREATE TABLE IF NOT EXISTS comment_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        comment_id TEXT NOT NULL,
        subscriber_id TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(comment_id, subscriber_id)
      );
    `);

    seedIfEmpty(_db);
  }
  return _db;
}

// ── Likes ──

export function getLikeCounts(): Record<string, number> {
  const rows = getDb()
    .prepare("SELECT post_slug, COUNT(*) as c FROM likes GROUP BY post_slug")
    .all() as { post_slug: string; c: number }[];
  const map: Record<string, number> = {};
  for (const r of rows) map[r.post_slug] = r.c;
  return map;
}

export function getLikeCount(postSlug: string): number {
  const r = getDb().prepare("SELECT COUNT(*) as c FROM likes WHERE post_slug = ?").get(postSlug) as { c: number };
  return r.c;
}

export function addLike(postSlug: string): number {
  getDb().prepare("INSERT INTO likes (post_slug) VALUES (?)").run(postSlug);
  return getLikeCount(postSlug);
}

// ── Subscribers ──

export function getSubscriberByEmail(email: string): Subscriber | undefined {
  return getDb().prepare("SELECT * FROM subscribers WHERE email = ?").get(email) as Subscriber | undefined;
}

export function createSubscriber(id: string, email: string): Subscriber {
  const db = getDb();
  db.prepare("INSERT INTO subscribers (id, email) VALUES (?, ?)").run(id, email);
  return db.prepare("SELECT * FROM subscribers WHERE id = ?").get(id) as Subscriber;
}

// ── Comments ──

export function getComments(postSlug: string): Comment[] {
  return getDb()
    .prepare(
      `SELECT c.*,
        (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as like_count
       FROM comments c
       WHERE c.post_slug = ?
       ORDER BY c.created_at ASC`,
    )
    .all(postSlug) as Comment[];
}

export function addComment(
  postSlug: string,
  subscriberId: string,
  content: string,
  parentId: string | null,
): string {
  const id = createId();
  getDb()
    .prepare("INSERT INTO comments (id, post_slug, subscriber_id, content, parent_id) VALUES (?, ?, ?, ?, ?)")
    .run(id, postSlug, subscriberId, content, parentId);
  return id;
}

// ── Comment Likes ──

export function addCommentLike(commentId: string, subscriberId: string): void {
  getDb()
    .prepare("INSERT OR IGNORE INTO comment_likes (comment_id, subscriber_id) VALUES (?, ?)")
    .run(commentId, subscriberId);
}

export function getCommentLikeCount(commentId: string): number {
  const r = getDb().prepare("SELECT COUNT(*) as c FROM comment_likes WHERE comment_id = ?").get(commentId) as { c: number };
  return r.c;
}
