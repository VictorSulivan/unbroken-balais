import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login"];

const ROLE_ROUTES: Record<string, string[]> = {
  "/admin": ["admin"],
  "/dashboard": ["admin", "patron", "co_patron", "employe"],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next();

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const userRole = (req.auth.user as any)?.role as string;

  for (const [route, roles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route) && !roles.includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
