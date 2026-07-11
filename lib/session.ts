import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";

// Session (JWT + cookie) helpers only — deliberately kept free of bcryptjs.
// middleware.ts runs in the Edge Runtime, which lacks the Node APIs
// (process.nextTick/setImmediate) that bcryptjs needs; importing password
// hashing from the same module middleware uses would drag bcryptjs into the
// edge bundle. lib/auth.ts (password hashing) is Node-only and only ever
// imported from route handlers, never from middleware.

export const SESSION_COOKIE_NAME = "ecovest_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const encoder = new TextEncoder();

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "ecovest-dev-secret-change-me";
  return encoder.encode(secret);
}

export interface SessionPayload {
  userId: string;
  email: string;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.userId === "string" && typeof payload.email === "string") {
      return { userId: payload.userId, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

/** Reads and verifies the session cookie directly from a NextRequest — used
 * in API route handlers (and mirrors the logic middleware.ts uses at the edge). */
export async function getSessionFromRequest(
  req: NextRequest
): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}
