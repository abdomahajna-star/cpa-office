import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login", "/api/auth/login", "/api/contact", "/api/seed", "/api/migrate"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p) || pathname.startsWith("/_next") || pathname.startsWith("/fonts")) {
    return NextResponse.next();
  }

  // Allow Shiklolet agent webhook (protected by secret header)
  if (pathname === "/api/employee/shiklolet/callback") {
    return NextResponse.next();
  }

  const session = await verifySession(req);

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based route guards
  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/employee") && session.role === "CLIENT") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/portal") && session.role !== "CLIENT") {
    // Admins/employees go to their own panels
    if (session.role === "ADMIN")
      return NextResponse.redirect(new URL("/admin", req.url));
    if (session.role === "EMPLOYEE")
      return NextResponse.redirect(new URL("/employee", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts).*)"],
};
