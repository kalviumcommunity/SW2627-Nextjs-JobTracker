import crypto from "crypto";
import { prisma } from "../prisma";

export function hashRefreshToken(refreshToken: string): string {
  return crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
}

export async function createSession(
  userId: string,
  role: "candidate" | "employer",
  refreshToken: string
) {
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return prisma.session.create({
    data: {
      refreshTokenHash,
      expiresAt,
      ...(role === "candidate"
        ? { candidateId: userId }
        : { employerId: userId }),
    },
  });
}

export async function findSessionByRefreshToken(refreshToken: string) {
  const refreshTokenHash = hashRefreshToken(refreshToken);

  return prisma.session.findUnique({
    where: {
      refreshTokenHash,
    },
  });
}

export async function findSessionById(sessionId: string) {
  return prisma.session.findUnique({
    where: {
      id: sessionId,
    },
  });
}

export async function updateSessionRefreshToken(
  sessionId: string,
  newRefreshToken: string
) {
  const refreshTokenHash = hashRefreshToken(newRefreshToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return prisma.session.update({
    where: {
      id: sessionId,
    },
    data: {
      refreshTokenHash,
      expiresAt,
    },
  });
}

export async function deleteSession(sessionId: string) {
  return prisma.session.delete({
    where: {
      id: sessionId,
    },
  });
}