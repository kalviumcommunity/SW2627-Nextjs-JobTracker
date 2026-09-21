import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface JWTPayload {
  userId?: string;
  role?: "candidate" | "employer";
  exp?: number;
}

// ponytail: Native Web Crypto HMAC-SHA256 verification (runs in Edge runtime with zero dependencies)
async function verifyJWTSignature(
  token: string,
  secret: string
): Promise<JWTPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = enc.encode(`${headerB64}.${payloadB64}`);

    // Base64url to binary
    const base64 = signatureB64.replace(/-/g, "+").replace(/_/g, "/");
    const binarySig = atob(base64);
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, data);
    if (!isValid) return null;

    const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payloadJson) as JWTPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const isCandidateRoute =
    pathname === "/candidate" || pathname.startsWith("/candidate/");
  const isEmployerRoute =
    pathname === "/employer" || pathname.startsWith("/employer/");

  // Only protect /candidate and /employer routes
  if (!isCandidateRoute && !isEmployerRoute) {
    return NextResponse.next();
  }

  // 1. If no tokens at all, redirect to /login
  if (!token && !refreshToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const jwtSecret =
    process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET || "";

  // 2. Verify signature cryptographically if secret is available
  let payload: JWTPayload | null = null;
  if (token && jwtSecret) {
    payload = await verifyJWTSignature(token, jwtSecret);
  } else if (token) {
    // Fallback if secret is not set (e.g. initial dev bootstrap)
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        payload = JSON.parse(
          atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
        ) as JWTPayload;
      }
    } catch {
      payload = null;
    }
  }

  // 3. Handle expired or invalid access token
  const isExpired =
    payload?.exp !== undefined && Date.now() >= payload.exp * 1000;

  if (!payload || !payload.role || isExpired) {
    // If user has a refreshToken, allow navigation to continue so the client/app
    // can silently renew via /api/auth/refresh instead of aggressively evicting them.
    if (refreshToken) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Role-based route guard
  if (isCandidateRoute && payload.role !== "candidate") {
    return NextResponse.redirect(new URL("/employer", request.url));
  }

  if (isEmployerRoute && payload.role !== "employer") {
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
