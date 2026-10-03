import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic route guard: redirects visitors without a session cookie away
 * from private pages. Real authorization happens on the server for every
 * page, action and API route (see src/server/session.ts).
 */
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

export function proxy(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (hasSession) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?callbackUrl=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/resume/:path*", "/settings/:path*", "/onboarding/:path*"],
};
