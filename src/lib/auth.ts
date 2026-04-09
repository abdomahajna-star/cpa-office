import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE = "cpa_session";

export interface SessionPayload {
  userId: string;
  role: "ADMIN" | "EMPLOYEE" | "CLIENT";
  companyId?: string;
  name: string;
}

// ── Sign & issue a session cookie ──────────────────────────────────────────
export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
}

// ── Verify and return session payload ──────────────────────────────────────
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ── Verify from a request (for middleware) ─────────────────────────────────
export async function verifySession(
  req: NextRequest
): Promise<SessionPayload | null> {
  try {
    const token = req.cookies.get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ── Clear session ──────────────────────────────────────────────────────────
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}
