import bcrypt from "bcryptjs";

// Password hashing only. This file is Node-only (bcryptjs uses Node APIs not
// available in the Edge Runtime) and must only be imported from route
// handlers, never from middleware.ts — see lib/session.ts for the
// edge-safe JWT/cookie helpers used by both.

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
