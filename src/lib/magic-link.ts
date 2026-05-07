import crypto from "crypto";

/**
 * Stateless magic-link tokens. No DB needed — the token itself carries the
 * email + expiry, signed with HMAC so it can't be forged.
 *
 * Format: base64url(JSON({email, exp})) + "." + base64url(HMAC)
 *
 * Tokens expire 15 min after issue. Once used, they can technically be
 * replayed up to expiry — that's acceptable for a low-stakes staff portal.
 * Add a one-time-use store later if you need stricter semantics.
 */

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

function b64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf
    .toString("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function fromB64url(s: string): Buffer {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  return Buffer.from(pad ? padded + "=".repeat(4 - pad) : padded, "base64");
}

function getSecret(): string {
  const s = process.env.MAGIC_LINK_SECRET;
  if (!s) throw new Error("MAGIC_LINK_SECRET env var is not set");
  return s;
}

export function generateMagicToken(email: string): string {
  const payload = JSON.stringify({
    email: email.toLowerCase(),
    exp: Date.now() + TOKEN_TTL_MS,
  });
  const payloadB64 = b64url(payload);
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(payloadB64)
    .digest();
  return `${payloadB64}.${b64url(sig)}`;
}

export type VerifyResult =
  | { ok: true; email: string }
  | { ok: false; reason: "malformed" | "invalid" | "expired" };

export function verifyMagicToken(token: string): VerifyResult {
  if (!token || typeof token !== "string" || !token.includes("."))
    return { ok: false, reason: "malformed" };

  const [payloadB64, sigB64] = token.split(".", 2);
  if (!payloadB64 || !sigB64) return { ok: false, reason: "malformed" };

  // Recompute HMAC and compare in constant time
  const expectedSig = crypto
    .createHmac("sha256", getSecret())
    .update(payloadB64)
    .digest();
  let providedSig: Buffer;
  try {
    providedSig = fromB64url(sigB64);
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (
    expectedSig.length !== providedSig.length ||
    !crypto.timingSafeEqual(expectedSig, providedSig)
  ) {
    return { ok: false, reason: "invalid" };
  }

  let parsed: { email?: string; exp?: number };
  try {
    parsed = JSON.parse(fromB64url(payloadB64).toString("utf8"));
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (
    !parsed.email ||
    typeof parsed.email !== "string" ||
    typeof parsed.exp !== "number"
  ) {
    return { ok: false, reason: "malformed" };
  }
  if (Date.now() > parsed.exp) return { ok: false, reason: "expired" };

  return { ok: true, email: parsed.email };
}

/** Comma-separated env var → lowercased Set. Empty if unset. */
export function allowedStaffEmails(): Set<string> {
  const raw = process.env.STAFF_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAllowedEmail(email: string): boolean {
  const allowed = allowedStaffEmails();
  if (allowed.size === 0) return false; // no allowlist = nobody allowed (fail closed)
  return allowed.has(email.trim().toLowerCase());
}
