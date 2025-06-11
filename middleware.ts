import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuth = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!isAuth) {
    return NextResponse.redirect(new URL('/auth/signin', req.nextUrl));
  }

  return NextResponse.next();
});

// Only run the middleware on these paths
export const config = {
  matcher: [
    '/idea/:path*',
    '/profile/:path*',
    '/skills',
    '/api/ideas/:path*',
    '/api/requests/:path*',
    '/api/kanban/:path*',
    '/auth/:path*'
  ]
};