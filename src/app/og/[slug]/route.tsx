import { ImageResponse } from "@vercel/og";
import { getPostBySlug } from "@/lib/posts";

export const runtime = "nodejs";

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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const date = formatDate(post.published_at);
  const tags = post.tags.slice(0, 3);
  const titleSize =
    post.title.length > 60 ? 48 : post.title.length > 40 ? 56 : 64;
  const excerpt =
    post.excerpt.length > 100
      ? post.excerpt.slice(0, 100) + "..."
      : post.excerpt;

  return new ImageResponse(
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
      {/* Ambient glow */}
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

      {/* Avatar (absolutely positioned right) */}
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
            background:
              "linear-gradient(135deg, #C8FF00 0%, rgba(200,255,0,0.3) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "56px",
            fontWeight: 700,
            color: "#09090B",
          }}
        >
          D
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

      {/* Full-width content */}
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
        {/* Top: site + reading time (full width) */}
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

        {/* Middle: title + excerpt */}
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

        {/* Bottom: tags + date (full width) */}
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
    </div>,
    { width: 1200, height: 630 },
  );
}
