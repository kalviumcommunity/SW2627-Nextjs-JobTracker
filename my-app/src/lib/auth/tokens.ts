import jwt, { type JwtPayload, type Secret } from "jsonwebtoken";

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  role: "candidate" | "employer";
}

export interface RefreshTokenPayload extends JwtPayload {
  userId: string;
  sessionId: string;
}

function getAccessSecret(): Secret {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET is not configured");
  }
  return secret;
}

function getRefreshSecret(): Secret {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error("REFRESH_TOKEN_SECRET is not configured");
  }
  return secret;
}

export function createAccessToken(
  userId: string,
  role: "candidate" | "employer"
): string {
  return jwt.sign({ userId, role }, getAccessSecret(), {
    expiresIn: "15m",
  });
}

export function createRefreshToken(
  userId: string,
  sessionId: string
): string {
  return jwt.sign({ userId, sessionId }, getRefreshSecret(), {
    expiresIn: "7d",
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, getAccessSecret()) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, getRefreshSecret()) as RefreshTokenPayload;
}