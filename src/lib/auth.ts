import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "ahad_admin";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSigningSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("Set ADMIN_SESSION_SECRET to a random string of at least 32 characters.");
  }
  return secret;
}

function sign(payload: string): string {
  // Including the password in the signature invalidates sessions when you change it.
  // Neither the password nor the secret is stored in the cookie.
  return createHmac("sha256", getSigningSecret())
    .update(process.env.ADMIN_PASSWORD ?? "")
    .update("\0")
    .update(payload)
    .digest("hex");
}

export function createSessionToken(): string {
  const payload = `admin.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token || !process.env.ADMIN_PASSWORD) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, timestamp, signature] = parts;
  if (role !== "admin" || !/^\d+$/.test(timestamp) || !/^[a-f0-9]{64}$/.test(signature)) {
    return false;
  }

  // Expiry is enforced on the server, not just by the browser's cookie lifetime.
  const issuedAt = Number(timestamp);
  const age = Date.now() - issuedAt;
  if (!Number.isSafeInteger(issuedAt) || age < 0 || age >= SESSION_DURATION_SECONDS * 1000) {
    return false;
  }

  try {
    return timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(sign(`${role}.${timestamp}`), "hex")
    );
  } catch {
    // Missing configuration and malformed cookies must never grant access.
    return false;
  }
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !input || input.length > 1024) return false;

  // Hash first so the timing-safe comparison always uses equal-sized buffers.
  const hash = (value: string) => createHash("sha256").update(value, "utf8").digest();
  return timingSafeEqual(hash(input), hash(expected));
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export async function setAdminCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
    // Docker's loopback-only HTTP setup explicitly disables Secure cookies.
    // The HTTPS Compose override forces this back on. Normal production defaults
    // stay secure when ADMIN_COOKIE_SECURE is not configured.
    secure:
      process.env.ADMIN_COOKIE_SECURE === undefined
        ? process.env.NODE_ENV === "production"
        : process.env.ADMIN_COOKIE_SECURE !== "false",
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
