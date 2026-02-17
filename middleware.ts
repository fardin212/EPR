import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedPaths = ["/dashboard"];

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const session = req.cookies.get("session")?.value;

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"],
};
