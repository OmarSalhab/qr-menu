import { NextResponse, type NextRequest } from "next/server";
import { parseSessionCookie, sessionCookieName } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Skip API and static assets
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js")
  ) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(req.headers);

  // Hybrid theming: fetch brandColor from internal API and forward as a header
  try {
    const brandUrl = new URL("/api/brand", req.url);
    const r = await fetch(brandUrl.toString(), { cache: "no-store", headers: { "x-mw": "1" } });
    if (r.ok) {
      const data = (await r.json()) as { brandColor: string | null };
      if (data.brandColor) requestHeaders.set("x-brand", data.brandColor);
    }
  } catch {
    // ignore, fallback to default CSS brand
  }

  // Admin protection
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const cookie = req.cookies.get(sessionCookieName)?.value;
    const session = await parseSessionCookie(cookie);
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Run on all non-API, non-static paths (including /admin)
  matcher: ["/((?!api|_next|static|.*\\..*).*)"],
};
