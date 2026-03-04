import fs from "fs";
import path from "path";
import satori from "satori";
import sharp from "sharp";
import React from "react";

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

function HomeOgImage() {
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
          background: "linear-gradient(90deg, #C8FF00, rgba(200,255,0,0.2))",
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
        {/* Top row: site name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
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
        </div>

        {/* Middle: title + subtitle + excerpt */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "64px",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.035em",
              color: "#ffffff",
            }}
          >
            Dopey
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "24px",
              fontWeight: 700,
              color: "#C8FF00",
              letterSpacing: "-0.02em",
            }}
          >
            Software Engineer
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
            Building AI systems and high-performance tools. Python for the
            models. Rust for everything else.
          </div>
        </div>

        {/* Bottom: tags + author */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Tags */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {["AI", "RUST", "PYTHON"].map((tag) => (
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

          {/* Avatar + site */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #C8FF00 0%, #7BA600 100%)",
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
              sshdopey.com
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

function BlogOgImage() {
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
          background: "linear-gradient(90deg, #C8FF00, rgba(200,255,0,0.2))",
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
        {/* Top row: site name + Blog */}
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
            Blog
          </div>
        </div>

        {/* Middle: title + subtitle */}
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
              fontSize: "64px",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.035em",
              color: "#ffffff",
            }}
          >
            Writing.
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
            Thoughts on engineering, architecture, and building things that
            last.
          </div>
        </div>

        {/* Bottom: tags + author */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Tags */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {["ENGINEERING", "AI", "ARCHITECTURE"].map((tag) => (
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

          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #C8FF00 0%, #7BA600 100%)",
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

async function main() {
  console.log("Loading fonts...");
  const fonts = await loadFonts();

  fs.mkdirSync(outDir, { recursive: true });

  // Generate homepage OG
  console.log("Generating home.png...");
  const homeSvg = await satori(<HomeOgImage />, {
    width: 1200,
    height: 630,
    fonts,
  });
  const homePng = await sharp(Buffer.from(homeSvg))
    .png({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(outDir, "home.png"), homePng);
  console.log("  done home.png");

  // Generate blog OG
  console.log("Generating blog.png...");
  const blogSvg = await satori(<BlogOgImage />, {
    width: 1200,
    height: 630,
    fonts,
  });
  const blogPng = await sharp(Buffer.from(blogSvg))
    .png({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(outDir, "blog.png"), blogPng);
  console.log("  done blog.png");

  console.log("All done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
