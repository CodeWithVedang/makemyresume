import { ImageResponse } from "next/og";

import { APP_NAME } from "@/lib/config";

export const alt = `${APP_NAME} — Free resume maker for India`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share card (WhatsApp, LinkedIn, X) generated at build time. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#F7F8FA",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{ width: 64, height: 64, borderRadius: 14, background: "#183B56", display: "flex" }}
            />
            <span style={{ fontSize: 40, fontWeight: 700, color: "#17202A" }}>{APP_NAME}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 72, fontWeight: 700, color: "#17202A", lineHeight: 1.05 }}>
              Make a resume that
            </span>
            <span style={{ fontSize: 72, fontWeight: 700, color: "#2F6B8A", lineHeight: 1.05 }}>gets you noticed.</span>
            <span style={{ marginTop: 28, fontSize: 30, color: "#5B6670" }}>
              Free · ATS-friendly templates · PDF download · Made for India
            </span>
          </div>
        </div>
        <div
          style={{
            width: 300,
            marginLeft: 48,
            background: "#FFFFFF",
            borderRadius: 12,
            boxShadow: "0 20px 50px rgba(23,32,42,0.15)",
            padding: 28,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ height: 22, width: "70%", background: "#17202A", borderRadius: 4 }} />
          <div style={{ height: 12, width: "45%", background: "#2F6B8A", borderRadius: 4 }} />
          <div style={{ height: 2, width: "100%", background: "#2F6B8A", marginTop: 6 }} />
          {[90, 80, 95, 60, 85, 70, 92, 55, 78].map((w, i) => (
            <div key={i} style={{ height: 9, width: `${w}%`, background: "#D7DDE3", borderRadius: 4 }} />
          ))}
          <div style={{ marginTop: "auto", display: "flex" }}>
            <span style={{ background: "#E3F3EE", color: "#2E8B72", fontSize: 18, padding: "6px 14px", borderRadius: 999 }}>
              ATS friendly
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
