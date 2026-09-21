import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth/password";
import { createAccessToken, createRefreshToken } from "@/lib/auth/tokens";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  try {
    const { email, password, role: requestedRole } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user = null;
    let resolvedRole: "candidate" | "employer" = "candidate";

    if (requestedRole === "employer") {
      const employer = await prisma.employer.findUnique({
        where: { email: normalizedEmail },
      });
      if (employer) {
        user = employer;
        resolvedRole = "employer";
      } else {
        const candidate = await prisma.candidate.findUnique({
          where: { email: normalizedEmail },
        });
        if (candidate) {
          user = candidate;
          resolvedRole = "candidate";
        }
      }
    } else {
      const candidate = await prisma.candidate.findUnique({
        where: { email: normalizedEmail },
      });
      if (candidate) {
        user = candidate;
        resolvedRole = "candidate";
      } else {
        const employer = await prisma.employer.findUnique({
          where: { email: normalizedEmail },
        });
        if (employer) {
          user = employer;
          resolvedRole = "employer";
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const accessToken = createAccessToken(user.id, resolvedRole);
    const sessionId = crypto.randomUUID();
    const finalRefreshToken = createRefreshToken(user.id, sessionId);

    // ponytail: Single-roundtrip session creation avoiding redundant DB update
    await createSession(user.id, resolvedRole, finalRefreshToken, sessionId);

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: resolvedRole,
        },
      },
      { status: 200 }
    );

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    response.cookies.set("refreshToken", finalRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
