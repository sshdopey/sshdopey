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

const posts = [
  {
    slug: "the-architecture-of-longevity",
    title: "The Architecture of Longevity",
    published_at: "2025-11-10 10:00:00",
    featured: 1,
    tags: "architecture,engineering",
    cover_image: "https://picsum.photos/seed/longevity/1200/630",
    excerpt: "The best code isn't the code that works today — it's the code that works five years from now.",
    content: `The best code isn't the code that works today. It's the code that works five years from now, when you've forgotten why you wrote it, when the team has turned over twice, and when the requirements have shifted in ways nobody predicted.

I've spent years thinking about what makes software last. Not just survive — *last*. The kind of systems that become load-bearing walls in an organization, quietly doing their job while everything else churns around them.

## The Three Pillars

**Simplicity over cleverness.** Every clever trick is a future debugging session. Every abstraction is a concept someone has to learn. The best code reads like prose — boring, predictable, and exactly what you expect.

**Boundaries over flexibility.** Flexible systems sound good in architecture meetings. In practice, they become everything-systems that do nothing well. Draw hard lines. Make decisions. The constraints you choose today become the clarity your team needs tomorrow.

**Data over process.** Processes change. Data endures. If you model your data correctly, you can rebuild the entire application around it. If you model it wrong, no amount of clever code will save you.

## The Compound Cost

Every decision in software has compound interest. A small shortcut today becomes a large detour tomorrow. A clean interface now saves hundreds of hours later.

The metric I care about most isn't performance or test coverage. It's **time to understand**. How long does it take a new engineer to look at this code and know what it does, why it does it, and how to change it safely?

If the answer is "minutes," you've built something that will outlive you. If the answer is "days," you've built a liability.

Build for the engineers who come after you. They're the ones who will decide whether your system lives or dies.`,
  },
  {
    slug: "why-sqlite-is-the-only-database-you-need",
    title: "Why SQLite Is the Only Database You Need",
    published_at: "2025-12-05 14:30:00",
    featured: 0,
    tags: "databases,infrastructure",
    cover_image: "https://picsum.photos/seed/sqlitedb/1200/630",
    excerpt: "For 90% of applications, SQLite is not just sufficient — it's optimal.",
    content: `I'm going to make a controversial claim: for 90% of applications, SQLite is not just sufficient — it's *optimal*.

Not for everything. Not for massive multi-region deployments. But for your SaaS, your personal project, your API backend? SQLite wins, and it's not close.

## The Numbers Don't Lie

SQLite handles 100,000+ reads per second on commodity hardware. With WAL mode enabled, you get concurrent readers with a single writer — more than enough for applications serving thousands of users.

\`\`\`sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;
PRAGMA busy_timeout = 5000;
\`\`\`

Four lines. Your database is now faster than most managed PostgreSQL instances.

## Operational Simplicity

Here's what you don't need with SQLite:

- A database server process
- Connection pooling
- Network latency between app and database
- A backup strategy more complex than "copy a file"
- An ops team to manage upgrades

Your database is a file. You can \`cp\` it. You can \`scp\` it to another machine. This isn't a limitation — it's a superpower.

\`\`\`typescript
import Database from 'better-sqlite3';

const db = new Database('app.db');
db.pragma('journal_mode = WAL');

const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
\`\`\`

Start with SQLite. Migrate when you have a real reason. You'll be surprised how long "when" takes to arrive.`,
  },
  {
    slug: "zero-latency-ui",
    title: "Zero-Latency UI: A Manifesto",
    published_at: "2026-01-15 09:15:00",
    featured: 1,
    tags: "frontend,performance",
    cover_image: "https://picsum.photos/seed/latencyui/1200/630",
    excerpt: "Users don't care about your Lighthouse score. They care about one thing: does it feel fast?",
    content: `Users don't care about your Lighthouse score. They don't care about your bundle size metrics. They don't care about your server response time.

They care about one thing: *does it feel fast?*

Perceived performance is the only performance that matters.

## The 100ms Rule

Anything under 100ms feels instant. The user clicks, and the thing happens. No loader, no skeleton, no "please wait." Just cause and effect.

\`\`\`text
User intent → UI response: < 100ms (instant)
User intent → Data confirmed: < 1000ms (fast)
User intent → Full render: < 3000ms (acceptable)
\`\`\`

## Optimistic by Default

Every mutation should be optimistic. When a user clicks "like," the heart fills immediately.

\`\`\`typescript
async function handleLike() {
  setLiked(true);
  setCount(c => c + 1);

  const result = await api.like(postId);
  if (!result.ok) {
    setLiked(false);
    setCount(c => c - 1);
  }
}
\`\`\`

The user sees the change in under 16ms. The server round-trip happens in the background. Ship less. Load less. Do more with the platform.`,
  },
  {
    slug: "the-unreasonable-effectiveness-of-simplicity",
    title: "The Unreasonable Effectiveness of Simplicity",
    published_at: "2026-01-28 16:45:00",
    featured: 0,
    tags: "philosophy,engineering",
    cover_image: "https://picsum.photos/seed/simplecode/1200/630",
    excerpt: "The most impactful technical decision I ever made was choosing to build less.",
    content: `The most impactful technical decision I ever made was choosing to build less.

Not less quality. Not less thought. Less *stuff*. Fewer features, fewer abstractions, fewer dependencies, fewer options.

## Complexity Is a Debt

\`\`\`python
# Simple beats clever. Every time.
def get_user(user_id: int) -> User | None:
    return db.execute(
        "SELECT * FROM users WHERE id = ?", (user_id,)
    ).fetchone()
\`\`\`

## Three Rules

**One.** If you can solve it without a library, solve it without a library.

**Two.** If you can solve it with a boring solution, choose boring.

**Three.** If you can solve it by doing nothing, do nothing.

\`\`\`rust
fn process(input: &str) -> Result<Output, Error> {
    let parsed = parse(input)?;
    let validated = validate(parsed)?;
    Ok(transform(validated))
}
\`\`\`

Simplicity isn't a starting point. It's a destination you reach by way of understanding.`,
  },
  {
    slug: "building-ai-agents-that-actually-work",
    title: "Building AI Agents That Actually Work",
    published_at: "2026-02-04 11:00:00",
    featured: 1,
    tags: "ai,python",
    cover_image: "https://picsum.photos/seed/aiagents/1200/630",
    excerpt: "Most AI agent demos are impressive. Most AI agent products are terrible. Here's why.",
    content: `Most AI agent demos are impressive. Most AI agent products are terrible. The gap between "look what it can do" and "this reliably solves my problem" is enormous.

## The Reliability Problem

An AI agent that works 90% of the time is useless. Not "suboptimal" — *useless*.

\`\`\`python
class Agent:
    def __init__(self, model: str, tools: list[Tool]):
        self.model = model
        self.tools = tools
        self.max_retries = 3

    async def execute(self, task: str) -> Result:
        for attempt in range(self.max_retries):
            plan = await self.plan(task)
            result = await self.run(plan)
            if result.is_valid():
                return result
            task = f"{task}\\nPrevious attempt failed: {result.error}"
        return Result.failure("Max retries exceeded")
\`\`\`

## Tool Design Matters More Than Prompt Engineering

\`\`\`python
# Bad: vague, unbounded tool
def search(query: str) -> list[dict]:
    return db.search(query)

# Good: precise, typed, bounded
def find_user_by_email(email: str) -> User | None:
    """Find a single user by exact email match."""
    return db.users.find_one({"email": email})
\`\`\`

| Metric | Target | Typical |
|--------|--------|---------|
| Task completion rate | > 95% | 70-85% |
| Avg. latency | < 5s | 8-15s |
| Tool call accuracy | > 99% | 90-95% |
| Cost per task | < $0.05 | $0.10-0.50 |

Build the evaluation first, then build the agent to pass it.`,
  },
  {
    slug: "rust-changed-how-i-think",
    title: "Rust Changed How I Think About Software",
    published_at: "2026-02-10 08:30:00",
    featured: 0,
    tags: "rust,engineering",
    cover_image: "https://picsum.photos/seed/rustthink/1200/630",
    excerpt: "Learning Rust didn't just teach me a new language. It rewired how I think about every language.",
    content: `Learning Rust didn't just teach me a new language. It rewired how I approach software in every language I use.

## Ownership Is a Design Tool

\`\`\`rust
fn process_data(data: Vec<u8>) -> Result<Report, Error> {
    let parsed = parse(&data)?;
    let report = analyze(parsed)?;
    Ok(report)
}
\`\`\`

After writing Rust, I started asking in every language: "Who owns this data? Who can mutate it? When is it freed?"

## What I Bring Back to Python

\`\`\`python
# Before Rust
def get_user(id):
    return db.query(f"SELECT * FROM users WHERE id = {id}")

# After Rust
def get_user(user_id: int) -> User | None:
    row = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return User(**row) if row else None
\`\`\`

Rust taught me that constraints are features. Every constraint you add is a bug you prevent.`,
  },
  {
    slug: "the-case-against-microservices",
    title: "The Case Against Microservices",
    published_at: "2026-02-16 13:00:00",
    featured: 0,
    tags: "architecture,infrastructure",
    cover_image: "https://picsum.photos/seed/monolith/1200/630",
    excerpt: "Your startup doesn't need Kubernetes. It needs a well-structured monolith and a deployment script.",
    content: `Your startup doesn't need Kubernetes. It doesn't need a service mesh. It doesn't need 47 microservices communicating over gRPC.

It needs a well-structured monolith and a deployment script.

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| Deployment | One artifact | N artifacts + orchestration |
| Debugging | Stack trace | Distributed tracing |
| Latency | Function call | Network hop |
| Data consistency | Transaction | Eventual consistency |
| Team requirement | Any size | Needs platform team |

## The Right Architecture

\`\`\`python
# Modular monolith: clear boundaries, shared deployment
project/
├── modules/
│   ├── auth/
│   ├── billing/
│   ├── content/
│   └── search/
├── shared/
│   ├── db.py
│   └── events.py
└── main.py
\`\`\`

Start with a monolith. Extract services when you have a *specific, measurable* reason.`,
  },
  {
    slug: "prompt-engineering-is-dead",
    title: "Prompt Engineering Is Dead",
    published_at: "2026-02-20 10:15:00",
    featured: 0,
    tags: "ai,philosophy",
    cover_image: "https://picsum.photos/seed/promptend/1200/630",
    excerpt: "The era of artisanal prompt crafting is ending. What comes next matters more.",
    content: `The era of artisanal prompt crafting is ending. Every major model update makes your carefully tuned prompts obsolete.

\`\`\`python
# Fragile: depends on model-specific behavior
prompt = """You are a JSON extraction expert. Always respond
with valid JSON. Never include markdown formatting."""

# Robust: structured output with validation
from pydantic import BaseModel

class Person(BaseModel):
    name: str
    age: int
    location: str

result = client.chat.completions.create(
    model="gpt-4",
    response_format=Person,
    messages=[{"role": "user", "content": text}]
)
\`\`\`

Structured outputs beat prompt engineering every time.

## What Actually Matters

1. **System design** — How you compose models with tools and data
2. **Evaluation** — How you measure and improve quality
3. **Reliability** — How you handle failures gracefully
4. **Cost efficiency** — How you route between models intelligently

Don't optimize your prompts. Optimize your architecture.`,
  },
  {
    slug: "database-migrations-without-downtime",
    title: "Database Migrations Without Downtime",
    published_at: "2026-02-25 15:00:00",
    featured: 0,
    tags: "databases,infrastructure",
    cover_image: "https://picsum.photos/seed/migrations/1200/630",
    excerpt: "Every migration is a risk. Here's how to make them boring.",
    content: `Every database migration is a risk. The goal isn't to make migrations exciting — it's to make them boring.

## The Expand-Contract Pattern

\`\`\`sql
-- Step 1: Expand (add new column)
ALTER TABLE users ADD COLUMN display_name TEXT;

-- Step 2: Backfill
UPDATE users SET display_name = name WHERE display_name IS NULL;

-- Step 3: Migrate code (read from new column)

-- Step 4: Contract (remove old column, weeks later)
ALTER TABLE users DROP COLUMN name;
\`\`\`

## Migration Checklist

| Step | Check |
|------|-------|
| Add column | Has a default value? |
| Add index | Using CONCURRENTLY? |
| Rename column | Using expand-contract? |
| Drop column | All code migrated? |
| Change type | Compatible with existing data? |

Make migrations boring. Your on-call engineers will thank you.`,
  },
  {
    slug: "type-systems-are-worth-it",
    title: "Type Systems Are Worth the Trade-off",
    published_at: "2026-03-01 09:00:00",
    featured: 0,
    tags: "rust,philosophy",
    cover_image: "https://picsum.photos/seed/typesafe/1200/630",
    excerpt: "Yes, strong types slow you down at first. No, that's not a good argument against them.",
    content: `Yes, strong types slow you down at first. You have to think about your data shapes upfront. You have to satisfy the compiler.

No, that's not a good argument against them.

\`\`\`typescript
// Before: hope for the best
function processUser(user) {
  return user.name.toUpperCase();
}

// After: know for certain
function processUser(user: { name: string }): string {
  return user.name.toUpperCase();
}
\`\`\`

## The Investment Curve

| Time Frame | Dynamic Types | Strong Types |
|-----------|---------------|--------------|
| Day 1 | Faster | Slower |
| Week 1 | Equal | Equal |
| Month 1 | Slower | Faster |
| Year 1 | Much slower | Much faster |

Types aren't a tax. They're an investment with guaranteed returns.`,
  },
];

const commentIds = [
  "cm01a2b3c4d5", "cm06e7f8g9h0", "cm11i2j3k4l5", "cm16m7n8o9p0",
  "cm21q2r3s4t5", "cm26u7v8w9x0", "cm31y2z3a4b5", "cm36c7d8e9f0",
  "cm41g2h3i4j5", "cm46k7l8m9n0", "cm51o2p3q4r5", "cm56s7t8u9v0",
  "cm61w2x3y4z5", "cm66a7b8c9d0", "cm71e2f3g4h5", "cm76i7j8k9l0",
  "cm81m2n3o4p5", "cm86q7r8s9t0", "cm91u2v3w4x5", "cm96y7z8a9b0",
  "cma1c2d3e4f5", "cma6g7h8i9j0", "cmb1k2l3m4n5", "cmb6o7p8q9r0",
  "cmc1s2t3u4v5",
];

const comments = [
  { id: commentIds[0], post_slug: "the-architecture-of-longevity", subscriber_id: subscribers[0].id, parent_id: null, content: "The 'data over process' insight changed how I think about schema design.", created_at: "2025-11-11 08:30:00" },
  { id: commentIds[1], post_slug: "the-architecture-of-longevity", subscriber_id: subscribers[1].id, parent_id: commentIds[0], content: "Agreed. Model the data right and everything else follows.", created_at: "2025-11-11 12:15:00" },
  { id: commentIds[2], post_slug: "the-architecture-of-longevity", subscriber_id: subscribers[4].id, parent_id: commentIds[0], content: "Counterpoint: what about event sourcing? The data model IS the process.", created_at: "2025-11-12 09:00:00" },
  { id: commentIds[3], post_slug: "the-architecture-of-longevity", subscriber_id: subscribers[0].id, parent_id: commentIds[2], content: "Fair, but this is about most systems. 90% of apps are CRUD.", created_at: "2025-11-12 11:30:00" },
  { id: commentIds[4], post_slug: "zero-latency-ui", subscriber_id: subscribers[2].id, parent_id: null, content: "The optimistic UI section is gold. We shipped this pattern and NPS went up 15 points.", created_at: "2026-01-16 11:45:00" },
  { id: commentIds[5], post_slug: "zero-latency-ui", subscriber_id: subscribers[5].id, parent_id: commentIds[4], content: "Same. The trick is getting rollback UX right.", created_at: "2026-01-16 14:20:00" },
  { id: commentIds[6], post_slug: "the-unreasonable-effectiveness-of-simplicity", subscriber_id: subscribers[3].id, parent_id: null, content: "\"Simplicity isn't a starting point. It's a destination.\" Putting this on my wall.", created_at: "2026-01-29 07:30:00" },
  { id: commentIds[7], post_slug: "building-ai-agents-that-actually-work", subscriber_id: subscribers[6].id, parent_id: null, content: "The evaluation table is sobering. We thought our agent was 95% accurate until we actually measured.", created_at: "2026-02-05 10:00:00" },
  { id: commentIds[8], post_slug: "building-ai-agents-that-actually-work", subscriber_id: subscribers[7].id, parent_id: commentIds[7], content: "How do you handle edge cases in tool design?", created_at: "2026-02-05 14:30:00" },
  { id: commentIds[9], post_slug: "building-ai-agents-that-actually-work", subscriber_id: subscribers[8].id, parent_id: commentIds[7], content: "The answer is you don't. You make more tools, not more complex tools.", created_at: "2026-02-06 09:15:00" },
  { id: commentIds[10], post_slug: "building-ai-agents-that-actually-work", subscriber_id: subscribers[2].id, parent_id: null, content: "This should be required reading for every AI startup.", created_at: "2026-02-06 16:00:00" },
  { id: commentIds[11], post_slug: "rust-changed-how-i-think", subscriber_id: subscribers[9].id, parent_id: null, content: "The before/after Python comparison is so relatable.", created_at: "2026-02-11 08:00:00" },
  { id: commentIds[12], post_slug: "rust-changed-how-i-think", subscriber_id: subscribers[3].id, parent_id: commentIds[11], content: "Same experience. I started adding type hints to all my Python after learning Rust.", created_at: "2026-02-11 11:45:00" },
  { id: commentIds[13], post_slug: "the-case-against-microservices", subscriber_id: subscribers[1].id, parent_id: null, content: "Finally someone says it. We spent 6 months migrating to microservices and velocity dropped 40%.", created_at: "2026-02-17 09:30:00" },
  { id: commentIds[14], post_slug: "the-case-against-microservices", subscriber_id: subscribers[4].id, parent_id: commentIds[13], content: "Devils advocate: at 200 engineers we absolutely needed service boundaries.", created_at: "2026-02-17 13:00:00" },
  { id: commentIds[15], post_slug: "the-case-against-microservices", subscriber_id: subscribers[1].id, parent_id: commentIds[14], content: "At 200 sure. Most teams doing microservices are under 20.", created_at: "2026-02-17 15:30:00" },
  { id: commentIds[16], post_slug: "prompt-engineering-is-dead", subscriber_id: subscribers[5].id, parent_id: null, content: "Structured outputs > prompt engineering. This is the way.", created_at: "2026-02-21 10:00:00" },
  { id: commentIds[17], post_slug: "prompt-engineering-is-dead", subscriber_id: subscribers[6].id, parent_id: commentIds[16], content: "Disagree slightly. Good prompts + structured outputs is the sweet spot.", created_at: "2026-02-21 14:15:00" },
  { id: commentIds[18], post_slug: "database-migrations-without-downtime", subscriber_id: subscribers[0].id, parent_id: null, content: "The expand-contract pattern saved us from a 2-hour outage last month.", created_at: "2026-02-26 08:00:00" },
  { id: commentIds[19], post_slug: "type-systems-are-worth-it", subscriber_id: subscribers[7].id, parent_id: null, content: "The investment curve table is perfect. Showed this to my team lead.", created_at: "2026-03-02 07:30:00" },
  { id: commentIds[20], post_slug: "type-systems-are-worth-it", subscriber_id: subscribers[8].id, parent_id: commentIds[19], content: "Did it convince them?", created_at: "2026-03-02 10:00:00" },
  { id: commentIds[21], post_slug: "type-systems-are-worth-it", subscriber_id: subscribers[7].id, parent_id: commentIds[20], content: "We're migrating to TypeScript next sprint.", created_at: "2026-03-02 11:30:00" },
  { id: commentIds[22], post_slug: "why-sqlite-is-the-only-database-you-need", subscriber_id: subscribers[9].id, parent_id: null, content: "We moved from Postgres to SQLite for our internal tools. Zero regrets.", created_at: "2025-12-06 09:00:00" },
  { id: commentIds[23], post_slug: "why-sqlite-is-the-only-database-you-need", subscriber_id: subscribers[2].id, parent_id: commentIds[22], content: "How do you handle concurrent writes?", created_at: "2025-12-06 13:00:00" },
  { id: commentIds[24], post_slug: "why-sqlite-is-the-only-database-you-need", subscriber_id: subscribers[9].id, parent_id: commentIds[23], content: "WAL mode + busy_timeout. Haven't hit a conflict in 6 months.", created_at: "2025-12-06 15:30:00" },
];

const likeCounts: Record<string, number> = {
  "the-architecture-of-longevity": 47,
  "why-sqlite-is-the-only-database-you-need": 32,
  "zero-latency-ui": 89,
  "the-unreasonable-effectiveness-of-simplicity": 28,
  "building-ai-agents-that-actually-work": 156,
  "rust-changed-how-i-think": 63,
  "the-case-against-microservices": 41,
  "prompt-engineering-is-dead": 74,
  "database-migrations-without-downtime": 19,
  "type-systems-are-worth-it": 35,
};

export function seedIfEmpty(db: Database.Database) {
  const row = db.prepare("SELECT COUNT(*) as c FROM posts").get() as { c: number };
  if (row.c > 0) return;

  const insertSub = db.prepare("INSERT INTO subscribers (id, email) VALUES (?, ?)");
  for (const s of subscribers) insertSub.run(s.id, s.email);

  const insertPost = db.prepare(
    "INSERT INTO posts (slug, title, content, excerpt, cover_image, tags, featured, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  for (const p of posts) insertPost.run(p.slug, p.title, p.content, p.excerpt, p.cover_image, p.tags, p.featured, p.published_at);

  const insertLike = db.prepare("INSERT INTO likes (post_slug, created_at) VALUES (?, datetime('now', '-' || ? || ' hours'))");
  for (const [slug, count] of Object.entries(likeCounts)) {
    for (let i = 0; i < count; i++) insertLike.run(slug, Math.floor(Math.random() * 2000));
  }

  const insertComment = db.prepare("INSERT INTO comments (id, post_slug, subscriber_id, parent_id, content, created_at) VALUES (?, ?, ?, ?, ?, ?)");
  for (const c of comments) insertComment.run(c.id, c.post_slug, c.subscriber_id, c.parent_id, c.content, c.created_at);

  const insertCL = db.prepare("INSERT OR IGNORE INTO comment_likes (comment_id, subscriber_id) VALUES (?, ?)");
  insertCL.run(commentIds[0], subscribers[1].id);
  insertCL.run(commentIds[0], subscribers[2].id);
  insertCL.run(commentIds[0], subscribers[3].id);
  insertCL.run(commentIds[4], subscribers[0].id);
  insertCL.run(commentIds[4], subscribers[3].id);
  insertCL.run(commentIds[6], subscribers[0].id);
  insertCL.run(commentIds[6], subscribers[2].id);
  insertCL.run(commentIds[6], subscribers[4].id);
  insertCL.run(commentIds[6], subscribers[7].id);
  insertCL.run(commentIds[7], subscribers[0].id);
  insertCL.run(commentIds[7], subscribers[1].id);
  insertCL.run(commentIds[10], subscribers[0].id);
  insertCL.run(commentIds[10], subscribers[3].id);
  insertCL.run(commentIds[10], subscribers[6].id);
  insertCL.run(commentIds[13], subscribers[0].id);
  insertCL.run(commentIds[13], subscribers[2].id);
  insertCL.run(commentIds[13], subscribers[5].id);
  insertCL.run(commentIds[18], subscribers[1].id);
  insertCL.run(commentIds[18], subscribers[4].id);
}
