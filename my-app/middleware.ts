import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface JWTPayload {
  userId?: string;
  role?: "candidate" | "employer";
  exp?: number;
}

function parseJWTPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode base64url payload
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  const isCandidateRoute = pathname === "/candidate" || pathname.startsWith("/candidate/");
  const isEmployerRoute = pathname === "/employer" || pathname.startsWith("/employer/");

  // Only protect /candidate and /employer routes
  if (!isCandidateRoute && !isEmployerRoute) {
    return NextResponse.next();
  }

  // 1. If not authenticated, redirect to /login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const payload = parseJWTPayload(token);

  // 2. If token is invalid or expired, redirect to /login
  if (!payload || !payload.role) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Role-based routing checks
  if (isCandidateRoute && payload.role !== "candidate") {
    // Employers cannot access Candidate-only routes -> redirect to employer dashboard
    return NextResponse.redirect(new URL("/employer", request.url));
  }

  if (isEmployerRoute && payload.role !== "employer") {
    // Candidates cannot access Employer-only routes -> redirect to candidate dashboard
    return NextResponse.redirect(new URL("/candidate", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/candidate",
    "/candidate/:path*",
    "/employer",
    "/employer/:path*",
  ],
};
