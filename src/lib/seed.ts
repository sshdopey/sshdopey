import type Database from "better-sqlite3";

const subscribers = [
  { name: "Alex K", email: "alex@example.com" },
  { name: "Sarah Chen", email: "sarah@example.com" },
  { name: "Jordan M", email: "jordan@example.com" },
  { name: "Priya Sharma", email: "priya@example.com" },
  { name: "Marcus Webb", email: "marcus@example.com" },
  { name: "Lena Torres", email: "lena@example.com" },
];

const posts = [
  {
    slug: "the-architecture-of-longevity",
    title: "The Architecture of Longevity",
    published_at: "2026-02-15 10:00:00",
    featured: 0,
    excerpt:
      "The best code isn't the code that works today. It's the code that works five years from now, when you've forgotten why you wrote it.",
    content: `The best code isn't the code that works today. It's the code that works five years from now, when you've forgotten why you wrote it, when the team has turned over twice, and when the requirements have shifted in ways nobody predicted.

I've spent years thinking about what makes software last. Not just survive — *last*. The kind of systems that become load-bearing walls in an organization, quietly doing their job while everything else churns around them.

## The Three Pillars

**Simplicity over cleverness.** Every clever trick is a future debugging session. Every abstraction is a concept someone has to learn. The best code reads like prose — boring, predictable, and exactly what you expect.

**Boundaries over flexibility.** Flexible systems sound good in architecture meetings. In practice, they become everything-systems that do nothing well. Draw hard lines. Make decisions. The constraints you choose today become the clarity your team needs tomorrow.

**Data over process.** Processes change. Data endures. If you model your data correctly, you can rebuild the entire application around it. If you model it wrong, no amount of clever code will save you.

## The Pragmatist's Oath

I don't believe in perfect architecture. I believe in architecture that's good enough to survive contact with reality. The gap between a whiteboard diagram and production is where engineering happens.

Ship it. Watch it. Fix what breaks. The system you build is never the system you designed — and that's not a failure. That's the process working.

## The Compound Cost

Every decision in software has compound interest. A small shortcut today becomes a large detour tomorrow. A clean interface now saves hundreds of hours later. The engineers who understand this build systems that last decades. The ones who don't build systems that last quarters.

The metric I care about most isn't performance or test coverage. It's **time to understand**. How long does it take a new engineer to look at this code and know what it does, why it does it, and how to change it safely?

If the answer is "minutes," you've built something that will outlive you. If the answer is "days," you've built a liability.

Build for the engineers who come after you. They're the ones who will decide whether your system lives or dies.`,
  },
  {
    slug: "why-sqlite-is-the-only-database-you-need",
    title: "Why SQLite Is the Only Database You Need",
    published_at: "2026-02-22 14:30:00",
    featured: 0,
    excerpt:
      "For 90% of applications, SQLite is not just sufficient — it's optimal. Here's why the simplest database wins.",
    content: `I'm going to make a controversial claim: for 90% of applications, SQLite is not just sufficient — it's *optimal*.

Not for everything. Not for massive multi-region deployments or real-time collaborative editing. But for your SaaS, your personal project, your API backend, your mobile app? SQLite wins, and it's not close.

## The Numbers Don't Lie

SQLite handles 100,000+ reads per second on commodity hardware. With WAL mode enabled, you get concurrent readers with a single writer — more than enough for applications serving thousands of users.

Your PostgreSQL instance, running on a $50/month server, is probably doing less work than SQLite could do on a Raspberry Pi.

## Operational Simplicity

Here's what you don't need with SQLite:

- A database server process
- Connection pooling
- Network latency between app and database
- A backup strategy more complex than "copy a file"
- An ops team to manage database upgrades

Your database is a file. You can \`cp\` it. You can \`scp\` it to another machine. This isn't a limitation — it's a superpower.

## The Edge Is the Future

With the rise of edge computing, SQLite's architecture becomes even more compelling. Embedded databases that live next to your application code, replicated to the edge, serving responses in microseconds instead of milliseconds.

Turso, LiteFS, cr-sqlite — the ecosystem is building exactly this future. And it's all built on SQLite.

## When to Reach for Something Else

Be honest with yourself: do you actually need horizontal write scaling? Do you actually need real-time pub/sub? Or are you over-engineering because PostgreSQL feels more "professional"?

Start with SQLite. Migrate when you have a real reason. You'll be surprised how long "when" takes to arrive.`,
  },
  {
    slug: "zero-latency-ui",
    title: "Zero-Latency UI: A Manifesto",
    published_at: "2026-02-27 09:15:00",
    featured: 1,
    excerpt:
      "Users don't care about your Lighthouse score. They care about one thing: does it feel fast?",
    content: `Users don't care about your Lighthouse score. They don't care about your bundle size metrics. They don't care about your server response time.

They care about one thing: *does it feel fast?*

Perceived performance is the only performance that matters. And the gap between actual speed and perceived speed is where great frontend engineering lives.

## The 100ms Rule

Anything under 100ms feels instant. The user clicks, and the thing happens. No loader, no skeleton, no "please wait." Just cause and effect, like physics.

This is your target. Not for the server response — for the *UI response*. The moment a user interacts, the interface should acknowledge it. Instantly.

\`\`\`
User intent → UI response: < 100ms (instant)
User intent → Data confirmed: < 1000ms (fast)
User intent → Full render: < 3000ms (acceptable)
\`\`\`

Three tiers. The first one is non-negotiable.

## Optimistic by Default

Every mutation should be optimistic. When a user clicks "like," the heart fills immediately. When they post a comment, it appears in the list before the server even knows about it.

Yes, you need rollback logic. Yes, you need error handling. But the 99% case — where everything works fine — should feel like the data changed the moment the user decided it should.

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

The user sees the change in under 16ms. The server round-trip happens in the background.

## Ship Less JavaScript

Every kilobyte of JavaScript you ship is a kilobyte the browser has to parse, compile, and execute before your app becomes interactive.

The fastest code is code that doesn't exist. The most reliable code is code that doesn't exist. The most maintainable code is code that doesn't exist.

Ship less. Load less. Do more with the platform. Your users — and their devices — will thank you.`,
  },
  {
    slug: "the-unreasonable-effectiveness-of-simplicity",
    title: "The Unreasonable Effectiveness of Simplicity",
    published_at: "2026-03-01 16:45:00",
    featured: 0,
    excerpt:
      "The most impactful technical decision I ever made was choosing to build less. Not less quality. Less stuff.",
    content: `The most impactful technical decision I ever made was choosing to build less.

Not less quality. Not less thought. Less *stuff*. Fewer features, fewer abstractions, fewer dependencies, fewer options. Just the essential thing, done exceptionally well.

## Complexity Is a Debt

Every feature you add is a feature you maintain. Every dependency you install is a dependency you update. Every abstraction you create is an abstraction you explain.

The total cost of a software decision is never the implementation cost. It's the implementation cost plus the maintenance cost plus the cognitive cost, compounded over the lifetime of the system.

Most teams dramatically underestimate this compound interest.

## The Subtraction Game

Good engineering isn't about adding the right things. It's about removing the wrong things.

When I review code, my favorite question is: "What can we delete?" Not refactor, not abstract, not improve — *delete*. What lines of code, what features, what entire subsystems can we simply remove and have a better product?

The answer is almost always "more than you think."

## Three Rules

**One.** If you can solve it without a library, solve it without a library. Not because libraries are bad — because understanding is good.

**Two.** If you can solve it with a boring solution, choose boring. Boring solutions are well-understood, well-tested, and well-documented. Novel solutions are none of these things.

**Three.** If you can solve it by doing nothing, do nothing. The best code is no code. The best feature is the one you didn't build. The best bug is the one that never existed because the code that would have caused it was never written.

## Simplicity Is Not Easy

Here's the paradox: the simplest systems are the hardest to build. Anyone can make something complex. Complexity is the default. Simplicity requires taste, discipline, and the courage to say "no" to good ideas because you're holding out for great ones.

Simplicity isn't a starting point. It's a destination you reach by way of understanding.

Build less. Build better. Ship with conviction.`,
  },
];

// subscriber_id references: 1=Alex, 2=Sarah, 3=Jordan, 4=Priya, 5=Marcus, 6=Lena
const comments = [
  // Thread on post 1: Alex starts, Sarah and Marcus reply, Alex replies to Marcus
  { post_slug: "the-architecture-of-longevity", subscriber_id: 1, parent_id: null, content: "Brilliant piece. The 'data over process' insight completely changed how I think about schema design.", created_at: "2026-02-16 08:30:00" },
  { post_slug: "the-architecture-of-longevity", subscriber_id: 2, parent_id: 1, content: "Agreed. I've been pushing this at my org too — model the data right and everything else follows.", created_at: "2026-02-16 12:15:00" },
  { post_slug: "the-architecture-of-longevity", subscriber_id: 5, parent_id: 1, content: "Counterpoint: what about event sourcing? The data model IS the process in that paradigm.", created_at: "2026-02-17 09:00:00" },
  { post_slug: "the-architecture-of-longevity", subscriber_id: 1, parent_id: 3, content: "Fair point, but this is about most systems, not event-sourced ones. 90% of apps are CRUD.", created_at: "2026-02-17 11:30:00" },

  // Thread on post 3: Jordan starts, Lena replies
  { post_slug: "zero-latency-ui", subscriber_id: 3, parent_id: null, content: "The optimistic UI section is gold. We shipped this pattern last quarter and our NPS went up 15 points.", created_at: "2026-02-28 11:45:00" },
  { post_slug: "zero-latency-ui", subscriber_id: 6, parent_id: 5, content: "Same experience here. The trick is getting the rollback UX right — we went through 3 iterations before it felt invisible.", created_at: "2026-02-28 14:20:00" },

  // Standalone comment on post 4
  { post_slug: "the-unreasonable-effectiveness-of-simplicity", subscriber_id: 4, parent_id: null, content: "\"Simplicity isn't a starting point. It's a destination.\" — I'm putting this on my wall.", created_at: "2026-03-02 07:30:00" },
];

const likeCounts: Record<string, number> = {
  "the-architecture-of-longevity": 14,
  "why-sqlite-is-the-only-database-you-need": 9,
  "zero-latency-ui": 23,
  "the-unreasonable-effectiveness-of-simplicity": 7,
};

export function seedIfEmpty(db: Database.Database) {
  const row = db
    .prepare("SELECT COUNT(*) as count FROM posts")
    .get() as { count: number };
  if (row.count > 0) return;

  // Subscribers
  const insertSub = db.prepare(
    "INSERT INTO subscribers (name, email) VALUES (?, ?)",
  );
  for (const s of subscribers) {
    insertSub.run(s.name, s.email);
  }

  // Posts
  const insertPost = db.prepare(
    "INSERT INTO posts (slug, title, content, excerpt, featured, published_at) VALUES (?, ?, ?, ?, ?, ?)",
  );
  for (const p of posts) {
    insertPost.run(p.slug, p.title, p.content, p.excerpt, p.featured, p.published_at);
  }

  // Likes
  const insertLike = db.prepare(
    "INSERT INTO likes (post_slug, created_at) VALUES (?, datetime('now', '-' || ? || ' hours'))",
  );
  for (const [slug, count] of Object.entries(likeCounts)) {
    for (let i = 0; i < count; i++) {
      insertLike.run(slug, Math.floor(Math.random() * 300));
    }
  }

  // Comments (parent_id references the comment's row position, need to map)
  const insertComment = db.prepare(
    "INSERT INTO comments (post_slug, subscriber_id, parent_id, content, created_at) VALUES (?, ?, ?, ?, ?)",
  );
  for (const c of comments) {
    insertComment.run(
      c.post_slug,
      c.subscriber_id,
      c.parent_id,
      c.content,
      c.created_at,
    );
  }
}
