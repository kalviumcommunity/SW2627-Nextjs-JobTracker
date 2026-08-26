import { cookies } from "next/headers";
import { verifyAccessToken, type AccessTokenPayload } from "./tokens";

export type AuthResult =
  | {
      authenticated: true;
      payload: AccessTokenPayload;
    }
  | {
      authenticated: false;
      status: number;
      error: string;
    };

export async function requireAuth(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return {
      authenticated: false,
      status: 401,
      error: "Authentication required",
    };
  }

  try {
    const payload = verifyAccessToken(token);
    return {
      authenticated: true,
      payload,
    };
  } catch {
    return {
      authenticated: false,
      status: 401,
      error: "Invalid or expired access token",
    };
  }
}

export async function requireRole(
  role: "candidate" | "employer"
): Promise<AuthResult> {
  const auth = await requireAuth();

  if (!auth.authenticated) {
    return auth;
  }

  if (auth.payload.role !== role) {
    return {
      authenticated: false,
      status: 403,
      error: `Only ${role}s are authorized`,
    };
  }

  return auth;
}