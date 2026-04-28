import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth-utils";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login");
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  // Verify JWT Token at the edge
  const payload = await verifyToken(token);

  if (!payload && isAdminRoute) {
    // Attempting to access admin without session
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (payload && payload.role !== "admin" && isAdminRoute) {
    // Attempting to access admin as a standard student
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (payload && isAuthRoute) {
    // Already logged in, trying to access login page
    if (payload.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
