import fs from "fs";
import path from "path";
import satori from "satori";
import sharp from "sharp";

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

/* eslint-disable @next/next/no-img-element */

function HomeOgImage({ avatarSrc }: { avatarSrc: string }) {
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
          right: "64px",
          top: "50%",
          marginTop: "-110px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-70px",
            left: "-40px",
            width: "1px",
            height: "370px",
            display: "flex",
            background:
              "linear-gradient(180deg, transparent, rgba(255,255,255,0.06), transparent)",
          }}
        />
        <div
          style={{
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            border: "3px solid rgba(200,255,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "3px",
          }}
        >
          <img
            alt=""
            src={avatarSrc}
            width={150}
            height={150}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "20px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          @sshdopey
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
        {/* Top: site name */}
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

        {/* Middle: name + role + tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: "16px",
            maxWidth: "780px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "84px",
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
              color: "#ffffff",
            }}
          >
            Dopey
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "32px",
              fontWeight: 700,
              color: "#C8FF00",
              letterSpacing: "-0.01em",
            }}
          >
            Software Engineer
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "23px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.5,
              maxWidth: "600px",
              marginTop: "4px",
            }}
          >
            Building AI systems and high-performance tools. Python for the
            models. Rust for everything else.
          </div>
        </div>

        {/* Bottom: tech tags */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {["AI", "RUST", "PYTHON"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                fontSize: "16px",
                fontWeight: 700,
                color: "#C8FF00",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "9px 24px",
                borderRadius: "100px",
                border: "1px solid rgba(200,255,0,0.25)",
                background: "rgba(200,255,0,0.07)",
              }}
            >
              {tag}
            </div>
          ))}
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

function BlogOgImage({ avatarSrc }: { avatarSrc: string }) {
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
          left: "150px",
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
          marginTop: "-95px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-70px",
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
            border: "3px solid rgba(200,255,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "3px",
          }}
        >
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
        {/* Top: site + Blog label */}
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
              color: "rgba(255,255,255,0.5)",
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
            gap: "22px",
            maxWidth: "780px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "84px",
              fontWeight: 700,
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
              color: "#ffffff",
            }}
          >
            Writing.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "25px",
              fontWeight: 400,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.5,
              maxWidth: "600px",
            }}
          >
            Thoughts on engineering, architecture, and building things that
            last.
          </div>
        </div>

        {/* Bottom: tags */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {["ENGINEERING", "AI", "ARCHITECTURE"].map((tag) => (
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

async function main() {
  console.log("Loading fonts...");
  const fonts = await loadFonts();
  const avatarSrc = loadAvatarBase64();

  fs.mkdirSync(outDir, { recursive: true });

  console.log("Generating home.png...");
  const homeSvg = await satori(<HomeOgImage avatarSrc={avatarSrc} />, {
    width: 1200,
    height: 630,
    fonts,
  });
  const homePng = await sharp(Buffer.from(homeSvg))
    .png({ quality: 95 })
    .toBuffer();
  fs.writeFileSync(path.join(outDir, "home.png"), homePng);
  console.log("  done home.png");

  console.log("Generating blog.png...");
  const blogSvg = await satori(<BlogOgImage avatarSrc={avatarSrc} />, {
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
