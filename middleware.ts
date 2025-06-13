import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes and their required roles
const protectedRoutes = {
  "/admin": ["ADMIN"],
  "/admin/dashboard": ["ADMIN"],
  "/admin/events": ["ADMIN"],
  "/admin/ideas": ["ADMIN"],
  "/admin/users": ["ADMIN"],
};

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
  const userRole = req.auth?.user?.role || "USER";

  // Debug logs
  console.log("Middleware Debug:", {
    isLoggedIn,
    userRole,
    path: req.nextUrl.pathname,
    auth: req.auth
  });

  // Redirect admins to /admin if they visit / or /dashboard
  if (isLoggedIn && userRole === "ADMIN") {
    console.log("Admin redirect triggered");
    if (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/admin", req.nextUrl));
    }
  }

  // Handle auth pages
  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return null;
  }

  // Handle unauthenticated users
  if (!isLoggedIn) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.nextUrl)
    );
  }

  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (req.nextUrl.pathname.startsWith(route)) {
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/", req.nextUrl));
      }
    }
  }

  return null;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};