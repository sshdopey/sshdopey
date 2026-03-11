import fs from "fs";
import path from "path";
import satori from "satori";
import sharp from "sharp";
import matter from "gray-matter";

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

function loadAvatarBase64(): string {
  const avatarPath = path.join(process.cwd(), "public/sshdopey.jpeg");
  const buf = fs.readFileSync(avatarPath);
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

async function fetchImageBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    return `data:${contentType};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function readingTime(content: string): number {
  return Math.max(1, Math.round(content.split(/\s+/).length / 230));
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const day = d.getUTCDate().toString().padStart(2, "0");
    const month = d.toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const year = d.getUTCFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

interface PostData {
  slug: string;
  title: string;
  excerpt: string;
  published_at: string;
  cover_image: string;
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
    cover_image: data.cover_image ?? "",
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

/* eslint-disable @next/next/no-img-element */

function OgImage({
  post,
  avatarSrc,
  coverSrc,
}: {
  post: PostData;
  avatarSrc: string;
  coverSrc: string | null;
}) {
  const date = formatDate(post.published_at);
  const tags = post.tags.slice(0, 4);
  const titleSize =
    post.title.length > 60 ? 44 : post.title.length > 40 ? 52 : 58;

  const excerpt =
    post.excerpt.length > 120
      ? post.excerpt.slice(0, 120) + "..."
      : post.excerpt;

  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#09090B",
        color: "#f5f5f5",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ─── Cover image background ─── */}
      {coverSrc && (
        <img
          alt=""
          src={coverSrc}
          width={1200}
          height={630}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200px",
            height: "630px",
            objectFit: "cover",
          }}
        />
      )}

      {/* ─── Gradient overlays for text readability ─── */}
      {/* Main bottom-up gradient: solid dark at bottom, fading up */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          background: coverSrc
            ? "linear-gradient(180deg, rgba(9,9,11,0.25) 0%, rgba(9,9,11,0.5) 30%, rgba(9,9,11,0.88) 55%, rgba(9,9,11,0.97) 70%, #09090B 85%)"
            : "none",
        }}
      />

      {/* Left-side darkening for text area */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          background: coverSrc
            ? "linear-gradient(90deg, rgba(9,9,11,0.4) 0%, rgba(9,9,11,0.15) 50%, transparent 100%)"
            : "none",
        }}
      />

      {/* Accent glow bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: "-120px",
          left: "-40px",
          width: "500px",
          height: "500px",
          display: "flex",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 55%)",
        }}
      />

      {/* Subtle accent glow top-right (only without cover) */}
      {!coverSrc && (
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-80px",
            width: "600px",
            height: "600px",
            display: "flex",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(200,255,0,0.07) 0%, rgba(200,255,0,0.02) 45%, transparent 65%)",
          }}
        />
      )}

      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: 0,
          width: "4px",
          height: "550px",
          display: "flex",
          background:
            "linear-gradient(180deg, #C8FF00 0%, rgba(200,255,0,0.3) 70%, transparent 100%)",
          borderRadius: "0 4px 4px 0",
        }}
      />

      {/* Top edge accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          display: "flex",
          background:
            "linear-gradient(90deg, #C8FF00 0%, rgba(200,255,0,0.35) 40%, transparent 80%)",
        }}
      />

      {/* Bottom edge accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          display: "flex",
          background:
            "linear-gradient(90deg, rgba(200,255,0,0.3) 0%, rgba(200,255,0,0.1) 40%, transparent 75%)",
        }}
      />

      {/* ─── Content ─── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          padding: "44px 56px 40px 44px",
          position: "relative",
        }}
      >
        {/* Top row: branding + avatar + reading time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <img
              alt=""
              src={avatarSrc}
              width={36}
              height={36}
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                Dopey
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "13px",
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                sshdopey.com
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "15px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#C8FF00",
                display: "flex",
              }}
            />
            {`${post.reading_time} min read`}
          </div>
        </div>

        {/* Middle: title + excerpt */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "flex-end",
            gap: "18px",
            maxWidth: "960px",
            paddingBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: `${titleSize}px`,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            {post.title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "22px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.45,
              maxWidth: "800px",
            }}
          >
            {excerpt}
          </div>
        </div>

        {/* Bottom row: tags + date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#C8FF00",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "6px 18px",
                  borderRadius: "100px",
                  border: "1px solid rgba(200,255,0,0.3)",
                  background: "rgba(200,255,0,0.1)",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "16px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {date}
          </div>
        </div>
      </div>
    </div>
  );
}

async function generateOgImage(
  post: PostData,
  fonts: {
    name: string;
    data: ArrayBuffer;
    weight: 400 | 700;
    style: "normal";
  }[],
  avatarSrc: string,
  forceRegenerate: boolean,
) {
  const outPath = path.join(outDir, `${post.slug}.png`);

  if (!forceRegenerate) {
    const srcPath = path.join(postsDir, `${post.slug}.mdx`);
    if (fs.existsSync(outPath)) {
      const srcStat = fs.statSync(srcPath);
      const outStat = fs.statSync(outPath);
      if (outStat.mtimeMs > srcStat.mtimeMs) {
        console.log(`  skip ${post.slug}`);
        return;
      }
    }
  }

  // Fetch cover image and convert to base64 for embedding
  let coverSrc: string | null = null;
  if (post.cover_image) {
    console.log(`  fetching cover: ${post.cover_image}`);
    coverSrc = await fetchImageBase64(post.cover_image);
    if (!coverSrc) {
      console.log(`  warning: could not fetch cover image, using fallback`);
    }
  }

  const svg = await satori(
    <OgImage post={post} avatarSrc={avatarSrc} coverSrc={coverSrc} />,
    {
      width: 1200,
      height: 630,
      fonts,
    },
  );

  const png = await sharp(Buffer.from(svg)).png({ quality: 95 }).toBuffer();
  fs.writeFileSync(outPath, png);
  console.log(`  done ${post.slug}`);
}

async function main() {
  console.log("Loading fonts...");
  const fonts = await loadFonts();
  const avatarSrc = loadAvatarBase64();

  fs.mkdirSync(outDir, { recursive: true });

  const forceRegenerate = process.argv.includes("--force");
  const postArg = process.argv.find((a) => a.startsWith("--post="));
  const targetSlug = postArg?.split("=")[1];

  if (targetSlug) {
    const post = getPost(targetSlug);
    if (!post) {
      console.error(`Post not found: ${targetSlug}`);
      process.exit(1);
    }
    console.log(`Generating: ${targetSlug}`);
    await generateOgImage(post, fonts, avatarSrc, forceRegenerate);
  } else {
    const posts = getAllPosts();
    console.log(`Generating ${posts.length} OG images...`);
    for (const post of posts) {
      await generateOgImage(post, fonts, avatarSrc, forceRegenerate);
    }
  }

  console.log("All done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
