import { NextResponse, type NextRequest } from "next/server";
import { parseSessionCookie, sessionCookieName } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const cookie = req.cookies.get(sessionCookieName)?.value;
  const session = await parseSessionCookie(cookie);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
