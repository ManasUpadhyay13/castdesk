import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") || "CastDeck";
  const description = searchParams.get("description") || "Practice your pitch against AI investors who've actually read your deck.";
  const section = searchParams.get("section") || "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a0a",
          padding: "60px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient circles */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top bar - Logo + section badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                backgroundColor: "#fafafa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 800,
                color: "#0a0a0a",
              }}
            >
              CD
            </div>
            <span
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#fafafa",
                letterSpacing: "-0.02em",
              }}
            >
              CastDeck
            </span>
          </div>

          {section && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 16px",
                borderRadius: "20px",
                border: "1px solid rgba(250,250,250,0.15)",
                fontSize: "14px",
                color: "rgba(250,250,250,0.6)",
                fontWeight: 500,
              }}
            >
              {section}
            </div>
          )}
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginBottom: "60px",
          }}
        >
          <h1
            style={{
              fontSize: title.length > 40 ? "48px" : "56px",
              fontWeight: 800,
              color: "#fafafa",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
              maxWidth: "900px",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: "22px",
              color: "rgba(250,250,250,0.5)",
              lineHeight: 1.4,
              margin: 0,
              maxWidth: "750px",
            }}
          >
            {description}
          </p>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            borderTop: "1px solid rgba(250,250,250,0.08)",
            paddingTop: "24px",
          }}
        >
          <span style={{ fontSize: "14px", color: "rgba(250,250,250,0.35)" }}>
            castdesk.app
          </span>
          <span style={{ fontSize: "14px", color: "rgba(250,250,250,0.2)" }}>·</span>
          <span style={{ fontSize: "14px", color: "rgba(250,250,250,0.35)" }}>
            AI-powered pitch practice for founders
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
