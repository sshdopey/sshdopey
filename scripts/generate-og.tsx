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

/* eslint-disable @next/next/no-img-element */

function OgImage({ post, avatarSrc }: { post: PostData; avatarSrc: string }) {
  const date = formatDate(post.published_at);
  const tags = post.tags.slice(0, 3);
  const titleSize =
    post.title.length > 60 ? 48 : post.title.length > 40 ? 56 : 64;

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
        backgroundColor: "#09090B",
        color: "#f5f5f5",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ─── Background ─── */}
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
      <div
        style={{
          position: "absolute",
          bottom: "-180px",
          left: "100px",
          width: "400px",
          height: "400px",
          display: "flex",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,255,0,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Fine line grid */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

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
            "linear-gradient(180deg, #C8FF00 0%, rgba(200,255,0,0.25) 75%, transparent 100%)",
          borderRadius: "0 4px 4px 0",
        }}
      />

      {/* Top edge */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          display: "flex",
          background:
            "linear-gradient(90deg, #C8FF00 0%, rgba(200,255,0,0.35) 50%, transparent 85%)",
        }}
      />

      {/* ─── Avatar (absolutely positioned right) ─── */}
      <div
        style={{
          position: "absolute",
          right: "56px",
          top: "50%",
          marginTop: "-90px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
        }}
      >
        {/* Separator line */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "-36px",
            width: "1px",
            height: "340px",
            display: "flex",
            background:
              "linear-gradient(180deg, transparent, rgba(255,255,255,0.06), transparent)",
          }}
        />
        <div
          style={{
            width: "130px",
            height: "130px",
            borderRadius: "50%",
            border: "3px solid rgba(200,255,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "3px",
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img
            alt=""
            src={avatarSrc}
            width={120}
            height={120}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "3px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "22px",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            Dopey
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "15px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            @sshdopey
          </div>
        </div>
      </div>

      {/* ─── Full-width content ─── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          padding: "46px 56px 42px 44px",
          position: "relative",
        }}
      >
        {/* Top row: site + reading time (full width) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#C8FF00",
                display: "flex",
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: "17px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
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
              fontSize: "17px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            {`${post.reading_time} min read`}
          </div>
        </div>

        {/* Middle: title + excerpt (avoid avatar area) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: "22px",
            maxWidth: "880px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: `${titleSize}px`,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            {post.title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "24px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.5,
              maxWidth: "720px",
            }}
          >
            {excerpt}
          </div>
        </div>

        {/* Bottom row: tags + date (full width) */}
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
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#C8FF00",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "8px 22px",
                  borderRadius: "100px",
                  border: "1px solid rgba(200,255,0,0.25)",
                  background: "rgba(200,255,0,0.07)",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "18px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            {date}
          </div>
        </div>
      </div>

      {/* Bottom edge */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          display: "flex",
          background:
            "linear-gradient(90deg, rgba(200,255,0,0.3) 0%, rgba(200,255,0,0.1) 50%, transparent 85%)",
        }}
      />
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

  const svg = await satori(<OgImage post={post} avatarSrc={avatarSrc} />, {
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
  const avatarSrc = loadAvatarBase64();

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
    await generateOgImage(post, fonts, avatarSrc);
  } else {
    const posts = getAllPosts();
    console.log(`Generating ${posts.length} OG images...`);
    for (const post of posts) {
      await generateOgImage(post, fonts, avatarSrc);
    }
  }

  console.log("All done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
