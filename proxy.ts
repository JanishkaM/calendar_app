import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/proxy";
import { isUserAuthenticated, User } from "./utils/checkAuth";


export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  const publicPaths = ["/", "/auth/callback"];
  const isPublic = publicPaths.some(
    (path) => url.pathname === path || url.pathname.startsWith(`${path}/`)
  );

  const { data } = await updateSession(request);
  const user = data?.user;
  const isAuthenticated = isUserAuthenticated(user as User);

  if (!isPublic && !isAuthenticated) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (isPublic && isAuthenticated) {
    url.pathname = "/calendar";
    console.log("Authenticated user accessing public route, redirecting to /calendar");
    return NextResponse.redirect(url);
  }

  if (isPublic){
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/calendar/:path*",
    "/task/:path*",
  ],
};
