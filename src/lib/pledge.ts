import crypto from "crypto";

// Pledge price bounds (USD / month). The visitor sets the price inside this range.
export const PLEDGE_MIN = 5;
export const PLEDGE_MAX = 500;
export const PLEDGE_DEFAULT = 49;

// How long a verification link stays valid.
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface PledgePayload {
  email: string;
  amount: number; // dollars / month
  painPoint: string; // short summary, truncated for the URL
  iat: number; // issued-at, ms epoch
}

function getSecret(): string {
  const secret = process.env.PLEDGE_SECRET;
  if (!secret) {
    throw new Error("PLEDGE_SECRET is not configured");
  }
  return secret;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export function clampAmount(value: unknown): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return PLEDGE_DEFAULT;
  return Math.min(PLEDGE_MAX, Math.max(PLEDGE_MIN, n));
}

/** Create a tamper-proof, self-contained verification token (no database needed). */
export function signPledgeToken(payload: Omit<PledgePayload, "iat">): string {
  const full: PledgePayload = {
    ...payload,
    painPoint: payload.painPoint.slice(0, 280),
    iat: Date.now(),
  };
  const body = base64url(JSON.stringify(full));
  const sig = base64url(
    crypto.createHmac("sha256", getSecret()).update(body).digest()
  );
  return `${body}.${sig}`;
}

/** Validate a token's signature and freshness. Returns the payload or null. */
export function verifyPledgeToken(token: string): PledgePayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;

  const expected = base64url(
    crypto.createHmac("sha256", getSecret()).update(body).digest()
  );
  // constant-time compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(fromBase64url(body).toString()) as PledgePayload;
    if (typeof payload.iat !== "number") return null;
    if (Date.now() - payload.iat > TOKEN_TTL_MS) return null;
    return payload;
  } catch {
    return null;
  }
}
