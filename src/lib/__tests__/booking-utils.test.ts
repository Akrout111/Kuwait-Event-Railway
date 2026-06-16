import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateBookingNumber,
  generateTicketNumber,
  getBookingExpiry,
} from '@/lib/booking-utils';
import { BOOKING_EXPIRY_MINUTES } from '@/lib/constants';

describe('generateBookingNumber', () => {
  it('starts with EVT-', () => {
    const result = generateBookingNumber();
    expect(result.startsWith('EVT-')).toBe(true);
  });

  it('contains the current year', () => {
    const year = new Date().getFullYear();
    const result = generateBookingNumber();
    expect(result).toContain(`EVT-${year}-`);
  });

  it('has the format EVT-YYYY-XXXXXX with 6-digit padded number', () => {
    const result = generateBookingNumber();
    const pattern = /^EVT-\d{4}-\d{6}$/;
    expect(result).toMatch(pattern);
  });

  it('produces different numbers on consecutive calls (crypto randomness)', () => {
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      results.add(generateBookingNumber());
    }
    // With 20 calls and 999999 possible values, collisions are extremely unlikely
    expect(results.size).toBeGreaterThan(1);
  });

  it('pads the random number with leading zeros', () => {
    // We can't guarantee a low number, but the format must always be 6 digits
    const result = generateBookingNumber();
    const parts = result.split('-');
    expect(parts[2]).toHaveLength(6);
  });
});

describe('generateTicketNumber', () => {
  it('starts with TCK-', () => {
    const result = generateTicketNumber();
    expect(result.startsWith('TCK-')).toBe(true);
  });

  it('matches the format TCK-XXXX-XXXX', () => {
    const result = generateTicketNumber();
    const pattern = /^TCK-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;
    expect(result).toMatch(pattern);
  });

  it('does not contain confusing characters (I, O, 0, 1)', () => {
    const confusing = ['I', 'O', '0', '1'];
    for (let i = 0; i < 50; i++) {
      const result = generateTicketNumber();
      for (const char of confusing) {
        expect(result).not.toContain(char);
      }
    }
  });

  it('produces different ticket numbers on consecutive calls', () => {
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      results.add(generateTicketNumber());
    }
    expect(results.size).toBeGreaterThan(1);
  });

  it('has exactly 2 hyphens', () => {
    const result = generateTicketNumber();
    const hyphenCount = result.split('-').length - 1;
    expect(hyphenCount).toBe(2);
  });
});

describe('getBookingExpiry', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('returns a Date object', () => {
    const result = getBookingExpiry();
    expect(result).toBeInstanceOf(Date);
  });

  it('is approximately BOOKING_EXPIRY_MINUTES from now', () => {
    const now = new Date();
    const expiry = getBookingExpiry();
    const diffMs = expiry.getTime() - now.getTime();
    const expectedMs = BOOKING_EXPIRY_MINUTES * 60 * 1000;
    // Allow 1 second tolerance for test execution
    expect(diffMs).toBeGreaterThanOrEqual(expectedMs - 1000);
    expect(diffMs).toBeLessThanOrEqual(expectedMs + 1000);
  });

  it('is always in the future', () => {
    const before = new Date();
    const expiry = getBookingExpiry();
    const after = new Date();
    expect(expiry.getTime()).toBeGreaterThan(before.getTime());
    expect(expiry.getTime()).toBeLessThanOrEqual(
      after.getTime() + BOOKING_EXPIRY_MINUTES * 60 * 1000 + 1000
    );
  });

  it('uses the BOOKING_EXPIRY_MINUTES constant (15 minutes)', () => {
    vi.useFakeTimers();
    const now = new Date('2026-01-15T12:00:00Z');
    vi.setSystemTime(now);

    const expiry = getBookingExpiry();
    const expectedTime = new Date(
      now.getTime() + BOOKING_EXPIRY_MINUTES * 60 * 1000
    );
    expect(expiry.getTime()).toBe(expectedTime.getTime());

    vi.useRealTimers();
  });
});
