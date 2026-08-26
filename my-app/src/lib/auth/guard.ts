import { cookies } from "next/headers";
import { verifyAccessToken, type AccessTokenPayload } from "./tokens";

export type AuthSuccess = {
  authenticated: true;
  authorized: true;
  payload: AccessTokenPayload;
};

export type AuthUnauthenticated = {
  authenticated: false;
  authorized: false;
  status: 401;
  error: string;
};

export type AuthForbidden = {
  authenticated: true;
  authorized: false;
  status: 403;
  error: string;
  payload: AccessTokenPayload;
};

export type RoleAuthResult = AuthSuccess | AuthUnauthenticated | AuthForbidden;

export type BaseAuthResult =
  | {
      authenticated: true;
      payload: AccessTokenPayload;
    }
  | AuthUnauthenticated;

export async function requireAuth(): Promise<BaseAuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return {
      authenticated: false,
      authorized: false,
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
      authorized: false,
      status: 401,
      error: "Invalid or expired access token",
    };
  }
}

export async function requireRole(
  role: "candidate" | "employer"
): Promise<RoleAuthResult> {
  const auth = await requireAuth();

  if (!auth.authenticated) {
    return auth;
  }

  if (auth.payload.role !== role) {
    return {
      authenticated: true,
      authorized: false,
      status: 403,
      error: `Only ${role}s are authorized`,
      payload: auth.payload,
    };
  }

  return {
    authenticated: true,
    authorized: true,
    payload: auth.payload,
  };
}
