import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware function to handle JWT authentication
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;

  const publicRoutes = ["/", "/login", "/register"];
  const protectedRoutes = ["/add-expense", "/expenses", "/welcome", "/hello"];

  const path = request.nextUrl.pathname;

  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  if (!token && protectedRoutes.includes(path)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configuration to match all routes except API and static assets
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
