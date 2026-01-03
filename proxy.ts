import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/proxy";
import { isUserAuthenticated, User } from "./utils/checkAuth";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Bypass proxy for static assets and offline/PWA plumbing so the SW can work offline.
  const isStaticAsset =
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/static/") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|avif)$/i.test(url.pathname);
  const bypassPaths = new Set([
    "/sw.js",
    "/offline.html",
    "/favicon.ico",
    "/manifest.webmanifest",
  ]);

  if (isStaticAsset || bypassPaths.has(url.pathname)) {
    return NextResponse.next();
  }

  const publicPaths = ["/", "/auth/callback"];
  const isPublic = publicPaths.some(
    (path) => url.pathname === path || url.pathname.startsWith(`${path}/`)
  );

  // Session refresh can fail when offline; fall back to unauthenticated state.
  const { data, response } = await updateSession(request).catch(() => ({
    data: undefined,
    response: NextResponse.next(),
  }));

  const user = data?.user;
  const isAuthenticated = isUserAuthenticated(user as User);

  if (!isPublic && !isAuthenticated) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (isPublic && isAuthenticated) {
    url.pathname = "/calendar";
    console.log(
      "Authenticated user accessing public route, redirecting to /calendar"
    );
    return NextResponse.redirect(url);
  }

  return response ?? NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/calendar/:path*",
    "/task/:path*",
  ],
};
