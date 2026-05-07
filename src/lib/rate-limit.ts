/**
 * Simple in-memory rate limiter — blocks excessive requests from the same
 * key (typically an IP) within a sliding window.
 *
 * Caveats:
 *  - Vercel runs serverless functions; a single instance may be reused for
 *    short bursts, but separate instances do NOT share memory. So this is
 *    "good enough" defence against casual spam, not a hard guarantee.
 *  - For strict enforcement (e.g. card-testing protection), upgrade to
 *    Upstash Redis (or any KV store). The interface is the same.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Sweep stale buckets every minute so the map doesn't grow unbounded.
let lastSweep = Date.now();
function maybeSweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  maybeSweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    const fresh = { count: 1, resetAt: now + windowMs };
    buckets.set(key, fresh);
    return { ok: true, remaining: limit - 1, resetAt: fresh.resetAt };
  }
  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }
  bucket.count += 1;
  return {
    ok: true,
    remaining: limit - bucket.count,
    resetAt: bucket.resetAt,
  };
}

/**
 * Best-effort client IP from common proxy headers + a generic fallback.
 * Vercel always sets x-forwarded-for, so this is reliable in production.
 */
export function clientIpFrom(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
