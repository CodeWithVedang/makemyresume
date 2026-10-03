import { ImageResponse } from "next/og";

/**
 * PNG app icons generated at build time from the logo mark, so no binary
 * assets need to be checked in. "maskable" adds safe-zone padding.
 */
const ICONS = {
  "192": { size: 192, padding: 0, radius: 42 },
  "512": { size: 512, padding: 0, radius: 112 },
  maskable: { size: 512, padding: 96, radius: 0 },
  "apple-touch-icon": { size: 180, padding: 18, radius: 0 },
} as const;

export const dynamic = "force-static";

export function generateStaticParams() {
  return Object.keys(ICONS).map((name) => ({ name }));
}

export async function GET(_request: Request, ctx: RouteContext<"/icons/[name]">) {
  const { name } = await ctx.params;
  const icon = ICONS[name as keyof typeof ICONS];
  if (!icon) return new Response("Not found", { status: 404 });
  const inner = icon.size - icon.padding * 2;

  return new ImageResponse(
    (
      <div
        style={{
          width: icon.size,
          height: icon.size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#183B56",
          borderRadius: icon.radius,
        }}
      >
        <svg width={inner} height={inner} viewBox="0 0 32 32">
          <path d="M10 8h9l5 5v11a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" fill="#fff" />
          <path d="M19 8v4a1 1 0 0 0 1 1h4" fill="#F59E6C" />
          <rect x="12" y="15" width="8" height="1.6" rx=".8" fill="#2F6B8A" />
          <rect x="12" y="18.5" width="9" height="1.6" rx=".8" fill="#C9D5DE" />
          <rect x="12" y="22" width="6" height="1.6" rx=".8" fill="#C9D5DE" />
        </svg>
      </div>
    ),
    { width: icon.size, height: icon.size },
  );
}
