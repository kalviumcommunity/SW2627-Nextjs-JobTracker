import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/tokens";

type AuthPayload = {
  userId: string;
  role: "candidate" | "employer";
};

type AuthenticatedResult = {
  authenticated: true;
  error: null;
  status: 200;
  payload: AuthPayload;
};

type UnauthenticatedResult = {
  authenticated: false;
  error: string;
  status: 401;
  payload: null;
};

type AuthResult = AuthenticatedResult | UnauthenticatedResult;

type AuthorizedResult = {
  authorized: true;
  error: null;
  status: 200;
  payload: AuthPayload;
};

type UnauthorizedResult = {
  authorized: false;
  error: string;
  status: 401 | 403;
  payload: AuthPayload | null;
};

type RoleResult = AuthorizedResult | UnauthorizedResult;

export async function requireAuth(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return {
      authenticated: false,
      error: "Authentication required",
      status: 401,
      payload: null,
    };
  }

  try {
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      return {
        authenticated: false,
        error: "Invalid or expired token",
        status: 401,
        payload: null,
      };
    }

    return {
      authenticated: true,
      error: null,
      status: 200,
      payload,
    };
  } catch {
    return {
      authenticated: false,
      error: "Invalid or expired token",
      status: 401,
      payload: null,
    };
  }
}

export async function requireRole(
  role: "candidate" | "employer"
): Promise<RoleResult> {
  const auth = await requireAuth();

  if (!auth.authenticated) {
    return {
      authorized: false,
      error: auth.error,
      status: auth.status,
      payload: null,
    };
  }

  if (auth.payload.role !== role) {
    return {
      authorized: false,
      error: "Forbidden",
      status: 403,
      payload: auth.payload,
    };
  }

  return {
    authorized: true,
    error: null,
    status: 200,
    payload: auth.payload,
  };
}