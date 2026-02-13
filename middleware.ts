import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes
  const publicPaths = ["/welcome", "/api", "/_next", "/favicon.ico"];
  if (publicPaths.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // Only protect app pages (adjust as needed)
  const protectedPaths = ["/", "/intake", "/blueprints"];
  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtected) return NextResponse.next();

  // Supabase stores auth in cookies; we just check if any auth cookie exists.
  // This is a lightweight MVP check (works for anonymous sign-in too).
  const hasAuth =
    req.cookies.get("sb-access-token") ||
    req.cookies.get("sb-refresh-token") ||
    // newer cookie naming (projects can differ)
    Object.keys(req.cookies.getAll().reduce((acc, c) => ({ ...acc, [c.name]: true }), {})).some((n) =>
      n.startsWith("sb-")
    );

  if (!hasAuth) {
    const url = req.nextUrl.clone();
    url.pathname = "/welcome";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/intake/:path*", "/blueprints/:path*"],
};