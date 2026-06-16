/**
 * محدد معدل بسيط في الذاكرة
 * Simple in-memory rate limiter.
 * For production, replace with Redis-based (Upstash) rate limiting.
 * This implementation resets on server restart, which is acceptable for now.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  limit: 30,
  windowSeconds: 60,
};

export function checkRateLimit(
  identifier: string,
  options: Partial<RateLimitOptions> = {}
): { allowed: boolean; remaining: number; resetAt: number } {
  const { limit, windowSeconds } = { ...DEFAULT_OPTIONS, ...options };
  const now = Date.now();
  const resetTime = now + windowSeconds * 1000;

  const entry = store.get(identifier);

  if (!entry || now > entry.resetTime) {
    store.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: limit - 1, resetAt: resetTime };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetTime };
}

export function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return ip;
}
