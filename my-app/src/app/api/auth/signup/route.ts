import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createAccessToken, createRefreshToken } from "@/lib/auth/tokens";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { name, email, password, role } = body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        { error: "Name, email, password and role are required strings" },
        { status: 400 }
      );
    }

    const trimmedRole = role.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedRole !== "candidate" && trimmedRole !== "employer") {
      return NextResponse.json(
        { error: "Invalid role. Must be 'candidate' or 'employer'" },
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
      where: { email: trimmedEmail },
    });

    const existingEmployer = await prisma.employer.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingCandidate || existingEmployer) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    let userId: string;

    if (trimmedRole === "candidate") {
      const candidate = await prisma.candidate.create({
        data: {
          name: name.trim(),
          email: trimmedEmail,
          passwordHash,
        },
      });

      userId = candidate.id;
    } else {
      const employer = await prisma.employer.create({
        data: {
          name: name.trim(),
          email: trimmedEmail,
          passwordHash,
        },
      });

      userId = employer.id;
    }

    const accessToken = createAccessToken(userId, trimmedRole);

    const temporarySessionId = crypto.randomUUID();

    const refreshToken = createRefreshToken(userId, temporarySessionId);

    const session = await createSession(userId, trimmedRole, refreshToken);

    const finalRefreshToken = createRefreshToken(userId, session.id);

    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        refreshTokenHash: crypto
          .createHash("sha256")
          .update(finalRefreshToken)
          .digest("hex"),
      },
    });

    const response = NextResponse.json(
      {
        message: "Signup successful",
        user: {
          id: userId,
          name: name.trim(),
          email: trimmedEmail,
          role: trimmedRole,
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
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}