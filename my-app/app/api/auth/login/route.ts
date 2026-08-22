import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth/password";
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

    const { email, password } = body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        { error: "Email and password are required strings" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    const candidate = await prisma.candidate.findUnique({
      where: { email: trimmedEmail },
    });

    let employer = null;
    let role: "candidate" | "employer" = "candidate";
    let user = candidate;

    if (!user) {
      employer = await prisma.employer.findUnique({
        where: { email: trimmedEmail },
      });
      if (employer) {
        user = employer as unknown as typeof candidate;
        role = "employer";
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

    const accessToken = createAccessToken(user.id, role);
    const temporarySessionId = crypto.randomUUID();
    const refreshToken = createRefreshToken(user.id, temporarySessionId);

    const session = await createSession(user.id, role, refreshToken);
    const finalRefreshToken = createRefreshToken(user.id, session.id);

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
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role,
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
