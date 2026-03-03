import type Database from "better-sqlite3";

const subscribers = [
  { name: "Brave Penguin", email: "alex@example.com" },
  { name: "Swift Eagle", email: "sarah@example.com" },
  { name: "Gentle Dolphin", email: "jordan@example.com" },
  { name: "Curious Fox", email: "priya@example.com" },
  { name: "Wise Owl", email: "marcus@example.com" },
  { name: "Bold Tiger", email: "lena@example.com" },
  { name: "Calm Bear", email: "devon@example.com" },
  { name: "Quick Raven", email: "nina@example.com" },
  { name: "Silent Wolf", email: "kai@example.com" },
  { name: "Bright Otter", email: "sam@example.com" },
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

## The Edge Is the Future

With the rise of edge computing, SQLite's architecture becomes even more compelling. Embedded databases replicated to the edge, serving responses in microseconds.

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

Perceived performance is the only performance that matters. And the gap between actual speed and perceived speed is where great frontend engineering lives.

## The 100ms Rule

Anything under 100ms feels instant. The user clicks, and the thing happens. No loader, no skeleton, no "please wait." Just cause and effect.

\`\`\`text
User intent → UI response: < 100ms (instant)
User intent → Data confirmed: < 1000ms (fast)
User intent → Full render: < 3000ms (acceptable)
\`\`\`

Three tiers. The first one is non-negotiable.

## Optimistic by Default

Every mutation should be optimistic. When a user clicks "like," the heart fills immediately. When they post a comment, it appears in the list before the server even knows about it.

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

Every kilobyte you ship is a kilobyte the browser has to parse, compile, and execute before your app becomes interactive.

The fastest code is code that doesn't exist. The most reliable code is code that doesn't exist. Ship less. Load less. Do more with the platform.`,
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

Not less quality. Not less thought. Less *stuff*. Fewer features, fewer abstractions, fewer dependencies, fewer options. Just the essential thing, done exceptionally well.

## Complexity Is a Debt

Every feature you add is a feature you maintain. Every dependency you install is a dependency you update. Every abstraction you create is an abstraction you explain.

\`\`\`python
# Simple beats clever. Every time.
def get_user(user_id: int) -> User | None:
    return db.execute(
        "SELECT * FROM users WHERE id = ?", (user_id,)
    ).fetchone()
\`\`\`

## Three Rules

**One.** If you can solve it without a library, solve it without a library. Not because libraries are bad — because understanding is good.

**Two.** If you can solve it with a boring solution, choose boring. Boring solutions are well-understood, well-tested, and well-documented.

**Three.** If you can solve it by doing nothing, do nothing. The best code is no code.

\`\`\`rust
fn process(input: &str) -> Result<Output, Error> {
    let parsed = parse(input)?;
    let validated = validate(parsed)?;
    Ok(transform(validated))
}
\`\`\`

Simplicity isn't a starting point. It's a destination you reach by way of understanding. Build less. Build better. Ship with conviction.`,
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

I've been building AI agents for the past two years — not demos, not prototypes, production systems that handle real workloads. Here's what I've learned.

## The Reliability Problem

An AI agent that works 90% of the time is useless. Not "suboptimal" — *useless*. If your agent fails 1 in 10 times, users learn to not trust it. And an untrusted agent is just an expensive chatbot.

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

The retry loop isn't elegant. It's essential.

## Tool Design Matters More Than Prompt Engineering

The quality of your tools determines the ceiling of your agent. A perfectly prompted agent with bad tools will produce bad results.

\`\`\`python
# Bad: vague, unbounded tool
def search(query: str) -> list[dict]:
    return db.search(query)  # Returns... what exactly?

# Good: precise, typed, bounded
def find_user_by_email(email: str) -> User | None:
    """Find a single user by exact email match. Returns None if not found."""
    return db.users.find_one({"email": email})
\`\`\`

Every tool should do one thing, have clear types, and fail predictably.

## The Evaluation Gap

![Agent evaluation pipeline](https://picsum.photos/seed/pipeline/800/400)

You can't improve what you can't measure. Build evaluation pipelines before you build agents. Define what "correct" looks like for every task, then measure relentlessly.

| Metric | Target | Typical |
|--------|--------|---------|
| Task completion rate | > 95% | 70-85% |
| Avg. latency | < 5s | 8-15s |
| Tool call accuracy | > 99% | 90-95% |
| Cost per task | < $0.05 | $0.10-0.50 |

The table doesn't lie. Most agents aren't production-ready. Build the evaluation first, then build the agent to pass it.`,
  },
  {
    slug: "rust-changed-how-i-think",
    title: "Rust Changed How I Think About Software",
    published_at: "2026-02-10 08:30:00",
    featured: 0,
    tags: "rust,engineering",
    cover_image: "https://picsum.photos/seed/rustthink/1200/630",
    excerpt: "Learning Rust didn't just teach me a new language. It rewired how I think about every language.",
    content: `Learning Rust didn't just teach me a new language. It rewired how I approach software in every language I use. The ownership model isn't just a memory management strategy — it's a design philosophy.

## Ownership Is a Design Tool

In Rust, every value has exactly one owner. When the owner goes out of scope, the value is dropped. This isn't a limitation — it's clarity.

\`\`\`rust
fn process_data(data: Vec<u8>) -> Result<Report, Error> {
    // We own \`data\`. Nobody else can mutate it.
    // When this function ends, \`data\` is freed.
    let parsed = parse(&data)?;
    let report = analyze(parsed)?;
    Ok(report)
}
\`\`\`

After writing Rust, I started asking in every language: "Who owns this data? Who can mutate it? When is it freed?" These questions make you a better engineer regardless of the language.

## Error Handling Done Right

Rust's \`Result\` type forces you to handle errors at every call site. There are no hidden exceptions, no surprise panics in production.

\`\`\`rust
use std::fs;
use std::io;

fn read_config(path: &str) -> Result<Config, io::Error> {
    let contents = fs::read_to_string(path)?;
    let config: Config = toml::from_str(&contents)
        .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;
    Ok(config)
}
\`\`\`

The \`?\` operator is elegant. But the real power is that the type signature tells you everything: this function can fail with an \`io::Error\`. No surprises.

## What I Bring Back to Python

When I write Python now, I write it differently:

\`\`\`python
# Before Rust: YOLO
def get_user(id):
    return db.query(f"SELECT * FROM users WHERE id = {id}")

# After Rust: explicit, safe, typed
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

## The Hidden Costs

Microservices trade code complexity for operational complexity. That's not always a good trade.

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| Deployment | One artifact | N artifacts + orchestration |
| Debugging | Stack trace | Distributed tracing |
| Latency | Function call | Network hop |
| Data consistency | Transaction | Eventual consistency |
| Team requirement | Any size | Needs platform team |

Every network hop is a potential failure point. Every service boundary is a versioning challenge. Every distributed transaction is a consistency headache.

## When Monoliths Win

For teams under 30 engineers, a modular monolith outperforms microservices on every metric that matters:

\`\`\`text
Development velocity: Monolith wins
Debugging speed: Monolith wins
Deployment simplicity: Monolith wins
Operational cost: Monolith wins
Time to market: Monolith wins
\`\`\`

The only metric where microservices win is "independent scalability" — and most teams don't need it.

## The Right Architecture

\`\`\`python
# Modular monolith: clear boundaries, shared deployment
project/
├── modules/
│   ├── auth/        # Authentication & authorization
│   ├── billing/     # Payments & subscriptions
│   ├── content/     # Posts, comments, media
│   └── search/      # Full-text search
├── shared/
│   ├── db.py        # Database connection
│   └── events.py    # Internal event bus
└── main.py          # Single entry point
\`\`\`

Clear module boundaries. Shared database. Single deployment. When you actually need to extract a service, the boundaries are already there.

Start with a monolith. Extract services when you have a *specific, measurable* reason. "Netflix does it" is not a reason.`,
  },
  {
    slug: "prompt-engineering-is-dead",
    title: "Prompt Engineering Is Dead",
    published_at: "2026-02-20 10:15:00",
    featured: 0,
    tags: "ai,philosophy",
    cover_image: "https://picsum.photos/seed/promptend/1200/630",
    excerpt: "The era of artisanal prompt crafting is ending. What comes next matters more.",
    content: `The era of artisanal prompt crafting is ending. Every major model update makes your carefully tuned prompts obsolete. The engineers who thrive won't be the ones writing the best prompts — they'll be the ones building the best systems around the models.

## The Fragility Problem

A prompt that works perfectly on GPT-4 might fail completely on GPT-4.5. A prompt tuned for Claude 3 might behave differently on Claude 4. Your "10x prompt engineer" is really just someone who memorized the quirks of a specific model version.

\`\`\`python
# Fragile: depends on model-specific behavior
prompt = """You are a JSON extraction expert. Always respond
with valid JSON. Never include markdown formatting. Use
exactly these field names: name, age, location."""

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

Structured outputs beat prompt engineering every time. Type systems are more reliable than natural language instructions.

## What Actually Matters

1. **System design** — How you compose models with tools and data
2. **Evaluation** — How you measure and improve quality
3. **Reliability** — How you handle failures gracefully
4. **Cost efficiency** — How you route between models intelligently

None of these are prompt engineering. They're software engineering.

## The Real Skill

The real skill isn't talking to AI. It's building systems where AI is one component among many — constrained, evaluated, and replaceable.

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
    content: `Every database migration is a risk. Schema changes on a live database can lock tables, break queries, and take your service down. The goal isn't to make migrations exciting — it's to make them boring.

## The Golden Rules

1. **Never rename a column directly.** Add the new column, backfill, migrate readers, drop the old one.
2. **Never drop a column without checking.** Ensure no code references it first.
3. **Always make migrations reversible.** If it can't be undone, think harder.

## The Expand-Contract Pattern

\`\`\`sql
-- Step 1: Expand (add new column)
ALTER TABLE users ADD COLUMN display_name TEXT;

-- Step 2: Backfill (populate new column)
UPDATE users SET display_name = name WHERE display_name IS NULL;

-- Step 3: Migrate code (read from new column)
-- Deploy code that reads display_name instead of name

-- Step 4: Contract (remove old column, weeks later)
ALTER TABLE users DROP COLUMN name;
\`\`\`

Each step is a separate deployment. Each step is independently reversible. If anything goes wrong, you roll back one step — not the whole migration.

## Adding Indexes Safely

On large tables, \`CREATE INDEX\` locks the table. Use \`CONCURRENTLY\` in PostgreSQL:

\`\`\`sql
-- Bad: locks the table for the entire duration
CREATE INDEX idx_users_email ON users (email);

-- Good: builds index without locking
CREATE INDEX CONCURRENTLY idx_users_email ON users (email);
\`\`\`

For SQLite, indexes are fast enough that this usually isn't an issue — another reason to love it.

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
    content: `Yes, strong types slow you down at first. You have to think about your data shapes upfront. You have to satisfy the compiler. You have to write more code for the same result.

No, that's not a good argument against them.

## The Speed Paradox

Dynamic typing feels faster because you skip the thinking step. But you don't skip it — you defer it. Every type error you don't catch at compile time becomes a runtime bug. Every runtime bug becomes a debugging session. Every debugging session costs 10x what the type annotation would have cost.

\`\`\`rust
// The compiler catches this before any user ever sees it
fn calculate_total(items: &[LineItem]) -> Money {
    items.iter()
        .map(|item| item.price * item.quantity)
        .sum()
}
\`\`\`

Try writing this in Python with the same guarantees. You can't — not without runtime validation that's slower and less reliable than the Rust compiler.

## TypeScript Changed the Game

TypeScript proved that you can add types to a dynamic language and people will love it. The JavaScript ecosystem's migration to TypeScript is the strongest endorsement of type systems in software history.

\`\`\`typescript
// Before: hope for the best
function processUser(user) {
  return user.name.toUpperCase();  // might blow up
}

// After: know for certain
function processUser(user: { name: string }): string {
  return user.name.toUpperCase();  // guaranteed safe
}
\`\`\`

## The Investment Curve

| Time Frame | Dynamic Types | Strong Types |
|-----------|---------------|--------------|
| Day 1 | Faster | Slower |
| Week 1 | Equal | Equal |
| Month 1 | Slower | Faster |
| Year 1 | Much slower | Much faster |

The crossover happens faster than you think. By month one, you're already reaping the benefits. By year one, it's not even close.

Types aren't a tax. They're an investment with guaranteed returns.`,
  },
];

const comments = [
  { post_slug: "the-architecture-of-longevity", subscriber_id: 1, parent_id: null, content: "The 'data over process' insight changed how I think about schema design.", created_at: "2025-11-11 08:30:00" },
  { post_slug: "the-architecture-of-longevity", subscriber_id: 2, parent_id: 1, content: "Agreed. I've been pushing this at my org — model the data right and everything else follows.", created_at: "2025-11-11 12:15:00" },
  { post_slug: "the-architecture-of-longevity", subscriber_id: 5, parent_id: 1, content: "Counterpoint: what about event sourcing? The data model IS the process.", created_at: "2025-11-12 09:00:00" },
  { post_slug: "the-architecture-of-longevity", subscriber_id: 1, parent_id: 3, content: "Fair, but this is about most systems. 90% of apps are CRUD.", created_at: "2025-11-12 11:30:00" },
  { post_slug: "zero-latency-ui", subscriber_id: 3, parent_id: null, content: "The optimistic UI section is gold. We shipped this pattern and NPS went up 15 points.", created_at: "2026-01-16 11:45:00" },
  { post_slug: "zero-latency-ui", subscriber_id: 6, parent_id: 5, content: "Same. The trick is getting rollback UX right — went through 3 iterations.", created_at: "2026-01-16 14:20:00" },
  { post_slug: "the-unreasonable-effectiveness-of-simplicity", subscriber_id: 4, parent_id: null, content: "\"Simplicity isn't a starting point. It's a destination.\" Putting this on my wall.", created_at: "2026-01-29 07:30:00" },
  { post_slug: "building-ai-agents-that-actually-work", subscriber_id: 7, parent_id: null, content: "The evaluation table is sobering. We thought our agent was 95% accurate until we actually measured.", created_at: "2026-02-05 10:00:00" },
  { post_slug: "building-ai-agents-that-actually-work", subscriber_id: 8, parent_id: 8, content: "How do you handle edge cases in tool design? Our tools keep getting more complex.", created_at: "2026-02-05 14:30:00" },
  { post_slug: "building-ai-agents-that-actually-work", subscriber_id: 9, parent_id: 8, content: "The answer is you don't. You make more tools, not more complex tools.", created_at: "2026-02-06 09:15:00" },
  { post_slug: "building-ai-agents-that-actually-work", subscriber_id: 3, parent_id: null, content: "This should be required reading for every AI startup. 90% of them are building demos.", created_at: "2026-02-06 16:00:00" },
  { post_slug: "rust-changed-how-i-think", subscriber_id: 10, parent_id: null, content: "The before/after Python comparison is so relatable. Rust made me a better Python dev.", created_at: "2026-02-11 08:00:00" },
  { post_slug: "rust-changed-how-i-think", subscriber_id: 4, parent_id: 12, content: "Same experience. I started adding type hints to all my Python after learning Rust.", created_at: "2026-02-11 11:45:00" },
  { post_slug: "the-case-against-microservices", subscriber_id: 2, parent_id: null, content: "Finally someone says it. We spent 6 months migrating to microservices and velocity dropped 40%.", created_at: "2026-02-17 09:30:00" },
  { post_slug: "the-case-against-microservices", subscriber_id: 5, parent_id: 14, content: "Devils advocate: at 200 engineers we absolutely needed service boundaries.", created_at: "2026-02-17 13:00:00" },
  { post_slug: "the-case-against-microservices", subscriber_id: 2, parent_id: 15, content: "At 200 sure. Most teams doing microservices are under 20.", created_at: "2026-02-17 15:30:00" },
  { post_slug: "prompt-engineering-is-dead", subscriber_id: 6, parent_id: null, content: "Structured outputs > prompt engineering. This is the way.", created_at: "2026-02-21 10:00:00" },
  { post_slug: "prompt-engineering-is-dead", subscriber_id: 7, parent_id: 17, content: "Disagree slightly. Good prompts + structured outputs is the sweet spot.", created_at: "2026-02-21 14:15:00" },
  { post_slug: "database-migrations-without-downtime", subscriber_id: 1, parent_id: null, content: "The expand-contract pattern saved us from a 2-hour outage last month.", created_at: "2026-02-26 08:00:00" },
  { post_slug: "type-systems-are-worth-it", subscriber_id: 8, parent_id: null, content: "The investment curve table is perfect. Showed this to my team lead.", created_at: "2026-03-02 07:30:00" },
  { post_slug: "type-systems-are-worth-it", subscriber_id: 9, parent_id: 20, content: "Did it convince them?", created_at: "2026-03-02 10:00:00" },
  { post_slug: "type-systems-are-worth-it", subscriber_id: 8, parent_id: 21, content: "We're migrating to TypeScript next sprint.", created_at: "2026-03-02 11:30:00" },
  { post_slug: "why-sqlite-is-the-only-database-you-need", subscriber_id: 10, parent_id: null, content: "We moved from Postgres to SQLite for our internal tools. Zero regrets.", created_at: "2025-12-06 09:00:00" },
  { post_slug: "why-sqlite-is-the-only-database-you-need", subscriber_id: 3, parent_id: 23, content: "How do you handle concurrent writes? That's always been my concern.", created_at: "2025-12-06 13:00:00" },
  { post_slug: "why-sqlite-is-the-only-database-you-need", subscriber_id: 10, parent_id: 24, content: "WAL mode + busy_timeout. Haven't hit a conflict in 6 months.", created_at: "2025-12-06 15:30:00" },
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

  const insertSub = db.prepare("INSERT INTO subscribers (name, email) VALUES (?, ?)");
  for (const s of subscribers) insertSub.run(s.name, s.email);

  const insertPost = db.prepare(
    "INSERT INTO posts (slug, title, content, excerpt, cover_image, tags, featured, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  for (const p of posts) {
    insertPost.run(p.slug, p.title, p.content, p.excerpt, p.cover_image, p.tags, p.featured, p.published_at);
  }

  const insertLike = db.prepare(
    "INSERT INTO likes (post_slug, created_at) VALUES (?, datetime('now', '-' || ? || ' hours'))",
  );
  for (const [slug, count] of Object.entries(likeCounts)) {
    for (let i = 0; i < count; i++) insertLike.run(slug, Math.floor(Math.random() * 2000));
  }

  const insertComment = db.prepare(
    "INSERT INTO comments (post_slug, subscriber_id, parent_id, content, created_at) VALUES (?, ?, ?, ?, ?)",
  );
  for (const c of comments) {
    insertComment.run(c.post_slug, c.subscriber_id, c.parent_id, c.content, c.created_at);
  }

  const insertCL = db.prepare("INSERT OR IGNORE INTO comment_likes (comment_id, subscriber_id) VALUES (?, ?)");
  insertCL.run(1, 2); insertCL.run(1, 3); insertCL.run(1, 4); insertCL.run(1, 6);
  insertCL.run(5, 1); insertCL.run(5, 2); insertCL.run(5, 4);
  insertCL.run(7, 1); insertCL.run(7, 3); insertCL.run(7, 5); insertCL.run(7, 6); insertCL.run(7, 8);
  insertCL.run(8, 1); insertCL.run(8, 2); insertCL.run(8, 5);
  insertCL.run(11, 1); insertCL.run(11, 4); insertCL.run(11, 7);
  insertCL.run(14, 1); insertCL.run(14, 3); insertCL.run(14, 6); insertCL.run(14, 8);
  insertCL.run(19, 2); insertCL.run(19, 5);
}
