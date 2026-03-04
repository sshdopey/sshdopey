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
  liked_by_me?: boolean;
}

const DB_PATH = path.join(process.cwd(), "sshdopey.db");
let _db: import("better-sqlite3").Database | null = null;
let _dbUnavailable = false;

function loadDb(): import("better-sqlite3").Database | null {
  if (_dbUnavailable) return null;
  if (_db) return _db;
  try {
    const Database = require("better-sqlite3") as new (path: string) => import("better-sqlite3").Database;
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
        subscriber_id TEXT,
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

    // Migrate existing DBs: add subscriber_id to likes if missing, then create index
    const info = _db.prepare("PRAGMA table_info(likes)").all() as { name: string }[];
    if (!info.some((c) => c.name === "subscriber_id")) {
      _db.exec("ALTER TABLE likes ADD COLUMN subscriber_id TEXT");
    }
    _db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_post_subscriber ON likes(post_slug, subscriber_id)");

    seedIfEmpty(_db);
    return _db;
  } catch {
    _dbUnavailable = true;
    return null;
  }
}

function getDb(): import("better-sqlite3").Database {
  const db = loadDb();
  if (!db) throw new Error("Database unavailable (e.g. during build or missing native bindings)");
  return db;
}

// ── Likes ──

export function getLikeCounts(): Record<string, number> {
  const db = loadDb();
  if (!db) return {};
  const rows = db
    .prepare("SELECT post_slug, COUNT(*) as c FROM likes GROUP BY post_slug")
    .all() as { post_slug: string; c: number }[];
  const map: Record<string, number> = {};
  for (const r of rows) map[r.post_slug] = r.c;
  return map;
}

export function getLikeCount(postSlug: string): number {
  const db = loadDb();
  if (!db) return 0;
  const r = db.prepare("SELECT COUNT(*) as c FROM likes WHERE post_slug = ?").get(postSlug) as { c: number };
  return r.c;
}

export function hasUserLikedPost(postSlug: string, subscriberId: string): boolean {
  const r = getDb()
    .prepare("SELECT 1 FROM likes WHERE post_slug = ? AND subscriber_id = ?")
    .get(postSlug, subscriberId);
  return !!r;
}

export function addLike(postSlug: string, subscriberId?: string | null): number {
  const db = getDb();
  if (subscriberId != null) {
    db.prepare("INSERT OR IGNORE INTO likes (post_slug, subscriber_id) VALUES (?, ?)").run(postSlug, subscriberId);
  } else {
    db.prepare("INSERT INTO likes (post_slug, subscriber_id) VALUES (?, NULL)").run(postSlug);
  }
  return getLikeCount(postSlug);
}

export function removePostLike(postSlug: string, subscriberId: string): number {
  getDb().prepare("DELETE FROM likes WHERE post_slug = ? AND subscriber_id = ?").run(postSlug, subscriberId);
  return getLikeCount(postSlug);
}

export function getLikedPostSlugsForSubscriber(subscriberId: string): string[] {
  const rows = getDb()
    .prepare("SELECT post_slug FROM likes WHERE subscriber_id = ?")
    .all(subscriberId) as { post_slug: string }[];
  return rows.map((r) => r.post_slug);
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

export function getComments(postSlug: string, subscriberId?: string | null): Comment[] {
  const db = loadDb();
  if (!db) return [];
  const rows = db
    .prepare(
      `SELECT c.*,
        (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as like_count
       FROM comments c
       WHERE c.post_slug = ?
       ORDER BY c.created_at ASC`,
    )
    .all(postSlug) as Comment[];
  if (!subscriberId) return rows;
  const withLiked = db
    .prepare("SELECT comment_id FROM comment_likes WHERE subscriber_id = ?")
    .all(subscriberId) as { comment_id: string }[];
  const likedSet = new Set(withLiked.map((r) => r.comment_id));
  return rows.map((c) => ({ ...c, liked_by_me: likedSet.has(c.id) }));
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

export function removeCommentLike(commentId: string, subscriberId: string): void {
  getDb().prepare("DELETE FROM comment_likes WHERE comment_id = ? AND subscriber_id = ?").run(commentId, subscriberId);
}

export function getCommentLikedIdsForPost(postSlug: string, subscriberId: string): string[] {
  const rows = getDb()
    .prepare(
      `SELECT cl.comment_id FROM comment_likes cl
       JOIN comments c ON c.id = cl.comment_id AND c.post_slug = ?
       WHERE cl.subscriber_id = ?`,
    )
    .all(postSlug, subscriberId) as { comment_id: string }[];
  return rows.map((r) => r.comment_id);
}
