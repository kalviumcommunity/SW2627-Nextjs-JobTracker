import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth/tokens";
import {
  findSessionById,
  hashRefreshToken,
  updateSessionRefreshToken,
} from "@/lib/auth/session";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    const { userId, sessionId } = payload;

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 401 }
      );
    }

    const session = await findSessionById(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Session not found or revoked" },
        { status: 401 }
      );
    }

    if (new Date(session.expiresAt) < new Date()) {
      await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
      return NextResponse.json(
        { error: "Session has expired" },
        { status: 401 }
      );
    }

    const incomingHash = hashRefreshToken(refreshToken);
    if (session.refreshTokenHash !== incomingHash) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    const role: "candidate" | "employer" = session.candidateId
      ? "candidate"
      : "employer";

    const newAccessToken = createAccessToken(userId, role);
    const newRefreshToken = createRefreshToken(userId, sessionId);

    await updateSessionRefreshToken(sessionId, newRefreshToken);

    const response = NextResponse.json(
      { message: "Token refreshed successfully" },
      { status: 200 }
    );

    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    response.cookies.set("refreshToken", newRefreshToken, {
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
