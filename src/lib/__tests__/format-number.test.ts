import { describe, it, expect } from 'vitest';
import { formatLocalizedNumber, formatPrice, formatLocalizedDate, formatShortDate } from '@/lib/format-number';

describe('formatLocalizedNumber', () => {
  it('formats number in English with grouping', () => {
    const result = formatLocalizedNumber(1000, 'en');
    expect(result).toBe('1,000');
  });

  it('formats number in Arabic locale', () => {
    const result = formatLocalizedNumber(1000, 'ar');
    // Arabic-Indic numerals with grouping
    expect(result).toContain('١');
    expect(result).toContain('٠');
  });

  it('handles zero', () => {
    expect(formatLocalizedNumber(0, 'en')).toBe('0');
  });

  it('handles large numbers', () => {
    const result = formatLocalizedNumber(1000000, 'en');
    expect(result).toBe('1,000,000');
  });
});

describe('formatPrice', () => {
  it('formats KWD price in English', () => {
    const result = formatPrice(25.5, 'en');
    expect(result).toContain('25.500');
    expect(result).toContain('KWD');
  });

  it('formats KWD price in Arabic', () => {
    const result = formatPrice(25.5, 'ar');
    expect(result).toContain('د.ك');
  });

  it('handles string input', () => {
    const result = formatPrice('50.000', 'en');
    expect(result).toContain('50.000');
  });

  it('handles NaN string input for Arabic', () => {
    const result = formatPrice('not-a-number', 'ar');
    expect(result).toBe('٠ د.ك');
  });

  it('handles NaN string input for English', () => {
    const result = formatPrice('not-a-number', 'en');
    expect(result).toBe('0 KWD');
  });

  it('formats zero price', () => {
    const result = formatPrice(0, 'en');
    expect(result).toContain('0.000');
  });
});

describe('formatLocalizedDate', () => {
  it('formats date in English', () => {
    const result = formatLocalizedDate('2025-03-15', 'en');
    expect(result).toContain('March');
    expect(result).toContain('2025');
  });

  it('formats date in Arabic', () => {
    const result = formatLocalizedDate('2025-03-15', 'ar');
    // Should contain Arabic month name
    expect(result).toContain('٢٠٢٥');
  });

  it('handles Date object input', () => {
    const date = new Date('2025-06-01');
    const result = formatLocalizedDate(date, 'en');
    expect(result).toContain('June');
  });

  it('returns empty string for invalid date', () => {
    const result = formatLocalizedDate('invalid-date', 'en');
    expect(result).toBe('');
  });
});

describe('formatShortDate', () => {
  it('formats short date in English', () => {
    const result = formatShortDate('2025-03-15', 'en');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
  });

  it('formats short date in Arabic', () => {
    const result = formatShortDate('2025-03-15', 'ar');
    // Should contain Arabic month
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns empty string for invalid date', () => {
    const result = formatShortDate('invalid', 'en');
    expect(result).toBe('');
  });
});
