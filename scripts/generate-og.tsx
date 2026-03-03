import fs from "fs";
import path from "path";
import satori from "satori";
import sharp from "sharp";
import matter from "gray-matter";
import React from "react";

const postsDir = path.join(process.cwd(), "content/posts");
const outDir = path.join(process.cwd(), "public/og");

async function loadFonts(): Promise<
  { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[]
> {
  const fonts: {
    name: string;
    data: ArrayBuffer;
    weight: 400 | 700;
    style: "normal";
  }[] = [];

  for (const weight of [400, 700] as const) {
    const url = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`;
    const cssRes = await fetch(url);
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\(([^)]+)\)/);
    if (match) {
      const fontRes = await fetch(match[1]);
      fonts.push({
        name: "Inter",
        data: await fontRes.arrayBuffer(),
        weight,
        style: "normal",
      });
    }
  }

  if (fonts.length === 0)
    throw new Error("Could not load fonts for OG generation");
  return fonts;
}

function readingTime(content: string): number {
  return Math.max(1, Math.round(content.split(/\s+/).length / 230));
}

interface PostData {
  slug: string;
  title: string;
  excerpt: string;
  published_at: string;
  tags: string[];
  reading_time: number;
}

function getPost(slug: string): PostData | null {
  const filePath = path.join(postsDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? "",
    excerpt: data.excerpt ?? "",
    published_at: data.published_at ?? "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    reading_time: readingTime(content),
  };
}

function getAllPosts(): PostData[] {
  if (!fs.existsSync(postsDir)) return [];
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => getPost(f.replace(/\.mdx$/, ""))!)
    .filter(Boolean);
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function OgImage({ post }: { post: PostData }) {
  const date = formatDate(post.published_at);
  const tags = post.tags.slice(0, 3);
  const titleSize = post.title.length > 60 ? 42 : post.title.length > 40 ? 50 : 58;

  const excerpt =
    post.excerpt.length > 100
      ? post.excerpt.slice(0, 100) + "..."
      : post.excerpt;

  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#050505",
        color: "#f5f5f5",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ─── Background layers ─── */}

      {/* Subtle radial gradient from center */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(200,255,0,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Large accent glow top-right */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          right: "-120px",
          width: "500px",
          height: "500px",
          display: "flex",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,255,0,0.07) 0%, rgba(200,255,0,0.02) 40%, transparent 70%)",
        }}
      />

      {/* Small accent glow bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: "-150px",
          left: "-80px",
          width: "350px",
          height: "350px",
          display: "flex",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,255,0,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Noise texture overlay via fine grid */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ─── Accent line at top ─── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "70px",
          width: "120px",
          height: "3px",
          display: "flex",
          background:
            "linear-gradient(90deg, #C8FF00, rgba(200,255,0,0.2))",
          borderRadius: "0 0 2px 2px",
        }}
      />

      {/* ─── Content ─── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          padding: "56px 70px 50px",
          position: "relative",
        }}
      >
        {/* Top row: site name + reading time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Accent dot */}
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#C8FF00",
                display: "flex",
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: "15px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              sshdopey.com
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "14px",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            {`${post.reading_time} min read`}
          </div>
        </div>

        {/* Middle: title + excerpt */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: `${titleSize}px`,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.035em",
              color: "#ffffff",
              maxWidth: "950px",
            }}
          >
            {post.title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "18px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.6,
              maxWidth: "700px",
            }}
          >
            {excerpt}
          </div>
        </div>

        {/* Bottom: tags + author + date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Tags */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#C8FF00",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "5px 14px",
                  borderRadius: "100px",
                  border: "1px solid rgba(200,255,0,0.2)",
                  background: "rgba(200,255,0,0.06)",
                }}
              >
                {tag}
              </div>
            ))}
          </div>

          {/* Author + date */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #C8FF00 0%, #7BA600 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#050505",
                }}
              >
                D
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  Dopey
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                width: "1px",
                height: "20px",
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: "14px",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              {date}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Accent line at bottom ─── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          display: "flex",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(200,255,0,0.15) 30%, rgba(200,255,0,0.3) 50%, rgba(200,255,0,0.15) 70%, transparent 100%)",
        }}
      />
    </div>
  );
}

async function generateOgImage(
  post: PostData,
  fonts: { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[],
) {
  const outPath = path.join(outDir, `${post.slug}.png`);

  const srcPath = path.join(postsDir, `${post.slug}.mdx`);
  if (fs.existsSync(outPath)) {
    const srcStat = fs.statSync(srcPath);
    const outStat = fs.statSync(outPath);
    if (outStat.mtimeMs > srcStat.mtimeMs) {
      console.log(`  skip ${post.slug}`);
      return;
    }
  }

  const svg = await satori(<OgImage post={post} />, {
    width: 1200,
    height: 630,
    fonts,
  });

  const png = await sharp(Buffer.from(svg)).png({ quality: 95 }).toBuffer();
  fs.writeFileSync(outPath, png);
  console.log(`  done ${post.slug}`);
}

async function main() {
  console.log("Loading fonts...");
  const fonts = await loadFonts();

  fs.mkdirSync(outDir, { recursive: true });

  const postArg = process.argv.find((a) => a.startsWith("--post="));
  const targetSlug = postArg?.split("=")[1];

  if (targetSlug) {
    const post = getPost(targetSlug);
    if (!post) {
      console.error(`Post not found: ${targetSlug}`);
      process.exit(1);
    }
    console.log(`Generating: ${targetSlug}`);
    await generateOgImage(post, fonts);
  } else {
    const posts = getAllPosts();
    console.log(`Generating ${posts.length} OG images...`);
    for (const post of posts) {
      await generateOgImage(post, fonts);
    }
  }

  console.log("All done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
