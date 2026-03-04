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
    post.title.length > 60 ? 42 : post.title.length > 40 ? 50 : 58;
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
        backgroundColor: "#050505",
        color: "#f5f5f5",
        fontFamily: "Inter, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
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

      {/* Grid */}
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

      {/* Top accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "70px",
          width: "120px",
          height: "3px",
          display: "flex",
          background: "linear-gradient(90deg, #C8FF00, rgba(200,255,0,0.2))",
          borderRadius: "0 0 2px 2px",
        }}
      />

      {/* Content */}
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
        {/* Top */}
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

        {/* Middle */}
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

        {/* Bottom */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
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

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #C8FF00, #7BA600)",
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

      {/* Bottom accent */}
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
    </div>,
    { width: 1200, height: 630 },
  );
}
