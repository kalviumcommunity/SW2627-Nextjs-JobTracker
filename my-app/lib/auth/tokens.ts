import jwt from "jsonwebtoken";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET or ACCESS_TOKEN_SECRET is not defined");
  }

  return secret;
};

const getRefreshSecret = (): string => {
  const secret =
    process.env.REFRESH_TOKEN_SECRET ||
    process.env.JWT_SECRET ||
    process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new Error("REFRESH_TOKEN_SECRET or JWT_SECRET is not defined");
  }

  return secret;
};

export type UserRole = "candidate" | "employer";

export interface AccessTokenPayload {
  userId: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
}

// Create access token
export function createAccessToken(
  userId: string,
  role: UserRole
): string {
  const payload: AccessTokenPayload = {
    userId,
    role,
  };

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "15m",
  });
}

// Create refresh token
export function createRefreshToken(
  userId: string,
  sessionId: string
): string {
  const payload: RefreshTokenPayload = {
    userId,
    sessionId,
  };

  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: "7d",
  });
}

// Verify access token
export function verifyAccessToken(
  token: string
): AccessTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (typeof decoded !== "object" || decoded === null) {
      return null;
    }

    const userId = (decoded as Record<string, unknown>).userId;
    const role = (decoded as Record<string, unknown>).role;

    if (
      typeof userId !== "string" ||
      (role !== "candidate" && role !== "employer")
    ) {
      return null;
    }

    return {
      userId,
      role,
    };
  } catch {
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(
  token: string
): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, getRefreshSecret());

    if (typeof decoded !== "object" || decoded === null) {
      throw new Error("Invalid refresh token");
    }

    const userId = (decoded as Record<string, unknown>).userId;
    const sessionId = (decoded as Record<string, unknown>).sessionId;

    if (
      typeof userId !== "string" ||
      typeof sessionId !== "string"
    ) {
      throw new Error("Invalid refresh token payload");
    }

    return {
      userId,
      sessionId,
    };
  } catch {
    throw new Error("Invalid or expired refresh token");
  }
}