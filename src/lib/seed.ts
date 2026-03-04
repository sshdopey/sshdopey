import type Database from "better-sqlite3";

const subscribers = [
  { id: "k7m2p9x4n1q8", email: "alex@example.com" },
  { id: "j3f6b8w2t5v0", email: "sarah@example.com" },
  { id: "r1d4g7y9s2h5", email: "jordan@example.com" },
  { id: "q8c3e6n0w4z1", email: "priya@example.com" },
  { id: "v5a9i2l7o0u3", email: "marcus@example.com" },
  { id: "x6t1f4h8m3p7", email: "lena@example.com" },
  { id: "b0w5y2d9g4j6", email: "devon@example.com" },
  { id: "n3s8u1c6e0r4", email: "nina@example.com" },
  { id: "z7l2o5a9i4t1", email: "kai@example.com" },
  { id: "f0p3v6x1b8h4", email: "sam@example.com" },
];

const commentIds = [
  "cm01a2b3c4d5",
  "cm06e7f8g9h0",
  "cm11i2j3k4l5",
  "cm16m7n8o9p0",
  "cm21q2r3s4t5",
  "cm26u7v8w9x0",
  "cm31y2z3a4b5",
  "cm36c7d8e9f0",
  "cm41g2h3i4j5",
  "cm46k7l8m9n0",
  "cm51o2p3q4r5",
  "cm56s7t8u9v0",
  "cm61w2x3y4z5",
  "cm66a7b8c9d0",
  "cm71e2f3g4h5",
  "cm76i7j8k9l0",
  "cm81m2n3o4p5",
  "cm86q7r8s9t0",
  "cm91u2v3w4x5",
  "cm96y7z8a9b0",
  "cma1c2d3e4f5",
  "cma6g7h8i9j0",
  "cmb1k2l3m4n5",
  "cmb6o7p8q9r0",
  "cmc1s2t3u4v5",
];

const comments = [
  {
    id: commentIds[0],
    post_slug: "the-architecture-of-longevity",
    subscriber_id: subscribers[0].id,
    parent_id: null,
    content:
      "The 'data over process' insight changed how I think about schema design. I've been rebuilding apps around bad data models for years.",
    created_at: "2025-11-11 08:30:00",
  },
  {
    id: commentIds[1],
    post_slug: "the-architecture-of-longevity",
    subscriber_id: subscribers[1].id,
    parent_id: commentIds[0],
    content:
      "Agreed. Model the data right and everything else follows. We rewrote our billing service 3 times but the tables are still the same.",
    created_at: "2025-11-11 12:15:00",
  },
  {
    id: commentIds[2],
    post_slug: "the-architecture-of-longevity",
    subscriber_id: subscribers[4].id,
    parent_id: commentIds[0],
    content:
      "Counterpoint: what about event sourcing? The data model IS the process in that paradigm.",
    created_at: "2025-11-12 09:00:00",
  },
  {
    id: commentIds[3],
    post_slug: "the-architecture-of-longevity",
    subscriber_id: subscribers[0].id,
    parent_id: commentIds[2],
    content:
      "Fair, but this is about most systems. 90% of apps are CRUD and event sourcing adds complexity they don't need.",
    created_at: "2025-11-12 11:30:00",
  },
  {
    id: commentIds[4],
    post_slug: "why-sqlite-is-the-only-database-you-need",
    subscriber_id: subscribers[9].id,
    parent_id: null,
    content:
      "We moved from Postgres to SQLite for our internal tools. Zero regrets. Deployment went from a 15-minute runbook to 'scp the binary.'",
    created_at: "2025-11-30 09:00:00",
  },
  {
    id: commentIds[5],
    post_slug: "why-sqlite-is-the-only-database-you-need",
    subscriber_id: subscribers[2].id,
    parent_id: commentIds[4],
    content: "How do you handle concurrent writes from multiple processes?",
    created_at: "2025-11-30 13:00:00",
  },
  {
    id: commentIds[6],
    post_slug: "why-sqlite-is-the-only-database-you-need",
    subscriber_id: subscribers[9].id,
    parent_id: commentIds[5],
    content:
      "WAL mode + busy_timeout. We get maybe 50 writes/sec peak and haven't hit a conflict in 6 months.",
    created_at: "2025-11-30 15:30:00",
  },
  {
    id: commentIds[7],
    post_slug: "zero-latency-ui",
    subscriber_id: subscribers[2].id,
    parent_id: null,
    content:
      "The optimistic UI section is gold. We shipped this pattern across our app and NPS went up 15 points.",
    created_at: "2025-12-19 11:45:00",
  },
  {
    id: commentIds[8],
    post_slug: "zero-latency-ui",
    subscriber_id: subscribers[5].id,
    parent_id: commentIds[7],
    content:
      "Same. The trick is getting rollback UX right — you need to tell users something failed without making it feel broken.",
    created_at: "2025-12-19 14:20:00",
  },
  {
    id: commentIds[9],
    post_slug: "building-ai-agents-that-actually-work",
    subscriber_id: subscribers[6].id,
    parent_id: null,
    content:
      "The reliability math is sobering. We thought our agent was 95% accurate until we actually measured end-to-end success rate. It was 72%.",
    created_at: "2026-01-09 10:00:00",
  },
  {
    id: commentIds[10],
    post_slug: "building-ai-agents-that-actually-work",
    subscriber_id: subscribers[7].id,
    parent_id: commentIds[9],
    content:
      "How do you handle the edge cases in tool design? We keep finding inputs that break our tools in unexpected ways.",
    created_at: "2026-01-09 14:30:00",
  },
  {
    id: commentIds[11],
    post_slug: "building-ai-agents-that-actually-work",
    subscriber_id: subscribers[8].id,
    parent_id: commentIds[10],
    content:
      "The answer is you don't make tools smarter — you make more tools, each handling a narrower case. Small surface area = fewer bugs.",
    created_at: "2026-01-10 09:15:00",
  },
  {
    id: commentIds[12],
    post_slug: "building-ai-agents-that-actually-work",
    subscriber_id: subscribers[2].id,
    parent_id: null,
    content:
      "This should be required reading for every AI startup. The eval-first approach is exactly what's missing from most agent frameworks.",
    created_at: "2026-01-10 16:00:00",
  },
  {
    id: commentIds[13],
    post_slug: "rust-changed-how-i-think",
    subscriber_id: subscribers[9].id,
    parent_id: null,
    content:
      "The before/after Python comparison is so relatable. I started adding type hints to all my Python after six months of Rust.",
    created_at: "2026-01-23 08:00:00",
  },
  {
    id: commentIds[14],
    post_slug: "rust-changed-how-i-think",
    subscriber_id: subscribers[3].id,
    parent_id: commentIds[13],
    content:
      "Same experience. 'Parse, don't validate' changed everything for me. Pydantic + mypy is the closest Python gets to Rust's guarantees.",
    created_at: "2026-01-23 11:45:00",
  },
  {
    id: commentIds[15],
    post_slug: "the-case-against-microservices",
    subscriber_id: subscribers[1].id,
    parent_id: null,
    content:
      "Finally someone says it. We spent 6 months migrating to microservices and velocity dropped 40%. We're going back to a modular monolith.",
    created_at: "2026-02-04 09:30:00",
  },
  {
    id: commentIds[16],
    post_slug: "the-case-against-microservices",
    subscriber_id: subscribers[4].id,
    parent_id: commentIds[15],
    content:
      "Devil's advocate: at 200 engineers we absolutely needed service boundaries. The monolith was a bottleneck on deploy frequency.",
    created_at: "2026-02-04 13:00:00",
  },
  {
    id: commentIds[17],
    post_slug: "the-case-against-microservices",
    subscriber_id: subscribers[1].id,
    parent_id: commentIds[16],
    content:
      "At 200, sure. But most teams doing microservices are under 20. That's the problem — the pattern is adopted for prestige, not need.",
    created_at: "2026-02-04 15:30:00",
  },
  {
    id: commentIds[18],
    post_slug: "prompt-engineering-is-dead",
    subscriber_id: subscribers[5].id,
    parent_id: null,
    content:
      "Structured outputs > prompt engineering. We replaced 200 lines of prompt with a Pydantic model and the reliability went from 80% to 99%.",
    created_at: "2026-02-13 10:00:00",
  },
  {
    id: commentIds[19],
    post_slug: "prompt-engineering-is-dead",
    subscriber_id: subscribers[6].id,
    parent_id: commentIds[18],
    content:
      "Disagree slightly. Good prompts + structured outputs is the sweet spot. The schema constrains shape, but the prompt guides quality.",
    created_at: "2026-02-13 14:15:00",
  },
  {
    id: commentIds[20],
    post_slug: "zero-copy-parsing-in-rust",
    subscriber_id: subscribers[3].id,
    parent_id: null,
    content:
      "That benchmark table is wild. 21x faster than regex. We're using zero-copy parsing for our log ingestion pipeline now.",
    created_at: "2026-02-20 08:30:00",
  },
  {
    id: commentIds[21],
    post_slug: "zero-copy-parsing-in-rust",
    subscriber_id: subscribers[8].id,
    parent_id: commentIds[20],
    content:
      "How do you handle the case where parsed data needs to outlive the buffer? Do you convert to owned lazily or eagerly?",
    created_at: "2026-02-20 12:00:00",
  },
  {
    id: commentIds[22],
    post_slug: "from-prototype-to-production-ml",
    subscriber_id: subscribers[7].id,
    parent_id: null,
    content:
      "The maturity ladder is exactly the framework we needed. We were trying to jump from Level 0 to Level 4 and it wasn't working.",
    created_at: "2026-02-27 09:00:00",
  },
  {
    id: commentIds[23],
    post_slug: "the-art-of-error-handling",
    subscriber_id: subscribers[0].id,
    parent_id: null,
    content:
      "The error hierarchy concept is great. We started classifying errors as operational/infrastructure/fatal and our incident response got way faster.",
    created_at: "2026-03-01 14:00:00",
  },
  {
    id: commentIds[24],
    post_slug: "designing-apis-people-actually-love",
    subscriber_id: subscribers[4].id,
    parent_id: null,
    content:
      "Cursor-based pagination is so underrated. We switched from offset and our paginated endpoints stopped returning duplicates under load.",
    created_at: "2026-03-02 16:30:00",
  },
];

const likeCounts: Record<string, number> = {
  "the-architecture-of-longevity": 87,
  "why-sqlite-is-the-only-database-you-need": 64,
  "zero-latency-ui": 142,
  "building-ai-agents-that-actually-work": 203,
  "rust-changed-how-i-think": 71,
  "the-case-against-microservices": 95,
  "prompt-engineering-is-dead": 118,
  "zero-copy-parsing-in-rust": 43,
  "from-prototype-to-production-ml": 56,
  "the-art-of-error-handling": 38,
  "designing-apis-people-actually-love": 67,
  "my-development-environment-in-2026": 29,
};

export function seedIfEmpty(db: Database.Database) {
  const row = db.prepare("SELECT COUNT(*) as c FROM subscribers").get() as {
    c: number;
  };
  if (row.c > 0) return;

  const insertSub = db.prepare(
    "INSERT INTO subscribers (id, email) VALUES (?, ?)",
  );
  for (const s of subscribers) insertSub.run(s.id, s.email);

  const insertLike = db.prepare(
    "INSERT INTO likes (post_slug, subscriber_id, created_at) VALUES (?, NULL, datetime('now', '-' || ? || ' hours'))",
  );
  for (const [slug, count] of Object.entries(likeCounts)) {
    for (let i = 0; i < count; i++)
      insertLike.run(slug, Math.floor(Math.random() * 2000));
  }

  const insertComment = db.prepare(
    "INSERT INTO comments (id, post_slug, subscriber_id, parent_id, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  );
  for (const c of comments)
    insertComment.run(
      c.id,
      c.post_slug,
      c.subscriber_id,
      c.parent_id,
      c.content,
      c.created_at,
    );

  const insertCL = db.prepare(
    "INSERT OR IGNORE INTO comment_likes (comment_id, subscriber_id) VALUES (?, ?)",
  );
  insertCL.run(commentIds[0], subscribers[1].id);
  insertCL.run(commentIds[0], subscribers[2].id);
  insertCL.run(commentIds[0], subscribers[3].id);
  insertCL.run(commentIds[7], subscribers[0].id);
  insertCL.run(commentIds[7], subscribers[3].id);
  insertCL.run(commentIds[9], subscribers[0].id);
  insertCL.run(commentIds[9], subscribers[1].id);
  insertCL.run(commentIds[9], subscribers[3].id);
  insertCL.run(commentIds[12], subscribers[0].id);
  insertCL.run(commentIds[12], subscribers[3].id);
  insertCL.run(commentIds[12], subscribers[6].id);
  insertCL.run(commentIds[15], subscribers[0].id);
  insertCL.run(commentIds[15], subscribers[2].id);
  insertCL.run(commentIds[15], subscribers[5].id);
  insertCL.run(commentIds[18], subscribers[1].id);
  insertCL.run(commentIds[18], subscribers[4].id);
  insertCL.run(commentIds[18], subscribers[7].id);
  insertCL.run(commentIds[20], subscribers[0].id);
  insertCL.run(commentIds[20], subscribers[5].id);
  insertCL.run(commentIds[23], subscribers[2].id);
  insertCL.run(commentIds[24], subscribers[1].id);
}
