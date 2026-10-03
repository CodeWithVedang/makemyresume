import "server-only";

/**
 * Fixed-window, in-memory rate limiter. Good enough for a single instance;
 * swap the store for Redis/Upstash when running multiple instances.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

// Local E2E runs create many accounts from one IP. Never honoured in production.
const RELAXED = process.env.NODE_ENV !== "production" && process.env.RELAX_RATE_LIMITS === "true";

export function rateLimit(key: string, baseLimit: number, windowMs: number): RateLimitResult {
  const limit = RELAXED ? baseLimit * 100 : baseLimit;
  const now = Date.now();
  if (now - lastSweep > 60_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    lastSweep = now;
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSeconds: 0 };
}

/** Best-effort client IP. Only trust x-forwarded-for behind a trusted proxy. */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
