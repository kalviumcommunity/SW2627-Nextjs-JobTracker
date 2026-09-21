import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
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
    const { name, email, password, role } = body || {};

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password and role are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (role !== "candidate" && role !== "employer") {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existingCandidate = await prisma.candidate.findUnique({
      where: { email: normalizedEmail },
    });

    const existingEmployer = await prisma.employer.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingCandidate || existingEmployer) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    let userId: string;

    if (role === "candidate") {
      const candidate = await prisma.candidate.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
        },
      });

      userId = candidate.id;
    } else {
      const employer = await prisma.employer.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
        },
      });

      userId = employer.id;
    }

    const accessToken = createAccessToken(userId, role);
    const sessionId = crypto.randomUUID();
    const finalRefreshToken = createRefreshToken(userId, sessionId);

    // ponytail: Single-roundtrip session creation avoiding redundant DB update
    await createSession(userId, role, finalRefreshToken, sessionId);

    const response = NextResponse.json(
      {
        message: "Signup successful",
        user: {
          id: userId,
          name: name.trim(),
          email: normalizedEmail,
          role,
        },
      },
      { status: 201 }
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
  } catch (err: unknown) {
    console.error("POST /api/auth/signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}