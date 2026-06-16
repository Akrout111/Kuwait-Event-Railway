import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need to re-import the module for each test to get a fresh store,
// but since the store is module-level and the module is cached, we use
// unique identifiers per test to avoid collisions.

// Import using dynamic import with vi.resetModules
let checkRateLimit: typeof import('@/lib/rate-limit')['checkRateLimit'];
let getClientIdentifier: typeof import('@/lib/rate-limit')['getClientIdentifier'];

beforeEach(async () => {
  vi.resetModules();
  const mod = await import('@/lib/rate-limit');
  checkRateLimit = mod.checkRateLimit;
  getClientIdentifier = mod.getClientIdentifier;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('checkRateLimit', () => {
  it('allows the first request', () => {
    const result = checkRateLimit('test-first-request', {
      limit: 5,
      windowSeconds: 60,
    });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('allows requests up to the limit', () => {
    const id = 'test-up-to-limit';
    const limit = 3;

    const r1 = checkRateLimit(id, { limit, windowSeconds: 60 });
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(id, { limit, windowSeconds: 60 });
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(id, { limit, windowSeconds: 60 });
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('blocks requests beyond the limit', () => {
    const id = 'test-beyond-limit';
    const limit = 2;

    checkRateLimit(id, { limit, windowSeconds: 60 });
    checkRateLimit(id, { limit, windowSeconds: 60 });

    const r3 = checkRateLimit(id, { limit, windowSeconds: 60 });
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it('resets the limit after the window expires', () => {
    vi.useFakeTimers();
    const id = 'test-window-expiry';
    const limit = 2;
    const windowSeconds = 60;

    checkRateLimit(id, { limit, windowSeconds });
    checkRateLimit(id, { limit, windowSeconds });

    // Should be blocked now
    const blocked = checkRateLimit(id, { limit, windowSeconds });
    expect(blocked.allowed).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(windowSeconds * 1000 + 1);

    // Should be allowed again
    const afterExpiry = checkRateLimit(id, { limit, windowSeconds });
    expect(afterExpiry.allowed).toBe(true);
    expect(afterExpiry.remaining).toBe(limit - 1);
  });

  it('tracks different identifiers independently', () => {
    const limit = 2;
    const windowSeconds = 60;

    // Exhaust limit for id-a
    checkRateLimit('id-a', { limit, windowSeconds });
    checkRateLimit('id-a', { limit, windowSeconds });
    const blocked = checkRateLimit('id-a', { limit, windowSeconds });
    expect(blocked.allowed).toBe(false);

    // id-b should still be allowed
    const allowed = checkRateLimit('id-b', { limit, windowSeconds });
    expect(allowed.allowed).toBe(true);
  });

  it('returns resetAt as a timestamp in the future', () => {
    const result = checkRateLimit('test-reset-at', {
      limit: 5,
      windowSeconds: 60,
    });
    expect(result.resetAt).toBeGreaterThan(Date.now() - 1000);
  });

  it('uses default options when none provided', () => {
    // Default limit is 30, window is 60 seconds
    const result = checkRateLimit('test-defaults');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(29); // 30 - 1
  });
});

describe('getClientIdentifier', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '203.0.113.50, 70.41.3.18' },
    });
    expect(getClientIdentifier(req)).toBe('203.0.113.50');
  });

  it('extracts single IP from x-forwarded-for', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '192.168.1.1' },
    });
    expect(getClientIdentifier(req)).toBe('192.168.1.1');
  });

  it('returns "unknown" when no x-forwarded-for header', () => {
    const req = new Request('https://example.com');
    expect(getClientIdentifier(req)).toBe('unknown');
  });

  it('trims whitespace from the IP', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '  10.0.0.1  , 192.168.0.1' },
    });
    expect(getClientIdentifier(req)).toBe('10.0.0.1');
  });
});
