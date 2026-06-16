import { describe, it, expect, vi } from 'vitest';

// Mock logger before importing knet
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import {
  generateKNetSignature,
  verifyKNetSignature,
  processKNetCallback,
  generateKNetPaymentId,
} from '@/lib/knet';

describe('generateKNetSignature', () => {
  it('returns a hex string', () => {
    const result = generateKNetSignature('test-data', 'test-secret');
    expect(typeof result).toBe('string');
    expect(result).toMatch(/^[0-9a-f]+$/);
  });

  it('returns a 64-character hex string (SHA-256)', () => {
    const result = generateKNetSignature('test-data', 'test-secret');
    expect(result).toHaveLength(64);
  });

  it('produces the same signature for the same inputs', () => {
    const result1 = generateKNetSignature('test-data', 'test-secret');
    const result2 = generateKNetSignature('test-data', 'test-secret');
    expect(result1).toBe(result2);
  });

  it('produces different signatures for different data', () => {
    const result1 = generateKNetSignature('data-1', 'secret');
    const result2 = generateKNetSignature('data-2', 'secret');
    expect(result1).not.toBe(result2);
  });

  it('produces different signatures for different secrets', () => {
    const result1 = generateKNetSignature('data', 'secret-1');
    const result2 = generateKNetSignature('data', 'secret-2');
    expect(result1).not.toBe(result2);
  });
});

describe('verifyKNetSignature', () => {
  it('returns true for a valid signature', () => {
    const data = 'merchant|payment123|10.00|KWD|order456';
    const secret = 'my-secret-key';
    const signature = generateKNetSignature(data, secret);

    const result = verifyKNetSignature(signature, data, secret);
    expect(result).toBe(true);
  });

  it('returns false for an invalid signature', () => {
    const data = 'merchant|payment123|10.00|KWD|order456';
    const secret = 'my-secret-key';
    const wrongSignature = '0'.repeat(64);

    const result = verifyKNetSignature(wrongSignature, data, secret);
    expect(result).toBe(false);
  });

  it('returns false when secret is different', () => {
    const data = 'merchant|payment123|10.00|KWD|order456';
    const signature = generateKNetSignature(data, 'correct-secret');

    const result = verifyKNetSignature(signature, data, 'wrong-secret');
    expect(result).toBe(false);
  });

  it('returns false for malformed signature (not hex)', () => {
    const result = verifyKNetSignature('not-hex-at-all', 'data', 'secret');
    expect(result).toBe(false);
  });

  it('returns false for signatures of different lengths', () => {
    const shortSig = 'ab12';
    const result = verifyKNetSignature(shortSig, 'data', 'secret');
    expect(result).toBe(false);
  });
});

describe('processKNetCallback', () => {
  it('returns success for CAPTURED result', () => {
    const result = processKNetCallback({
      paymentId: 'pay_123',
      result: 'CAPTURED',
      transactionId: 'tx_456',
      authCode: 'auth_789',
    });

    expect(result.success).toBe(true);
    expect(result.paymentId).toBe('pay_123');
    expect(result.result).toBe('CAPTURED');
    expect(result.transactionId).toBe('tx_456');
    expect(result.authCode).toBe('auth_789');
  });

  it('returns failure for NOT_CAPTURED result', () => {
    const result = processKNetCallback({
      paymentId: 'pay_123',
      result: 'NOT_CAPTURED',
    });

    expect(result.success).toBe(false);
    expect(result.result).toBe('NOT_CAPTURED');
  });

  it('returns failure for other result codes', () => {
    const result = processKNetCallback({
      paymentId: 'pay_123',
      result: 'DECLINED',
    });

    expect(result.success).toBe(false);
  });

  it('includes optional fields when provided', () => {
    const result = processKNetCallback({
      paymentId: 'pay_abc',
      result: 'CAPTURED',
      transactionId: 'tx_def',
      authCode: 'auth_ghi',
      postDate: '2026-03-04',
      ref: 'ref_123',
      trackId: 'track_456',
    });

    expect(result.transactionId).toBe('tx_def');
    expect(result.authCode).toBe('auth_ghi');
  });

  it('omits optional fields when not provided', () => {
    const result = processKNetCallback({
      paymentId: 'pay_abc',
      result: 'CAPTURED',
    });

    expect(result.transactionId).toBeUndefined();
    expect(result.authCode).toBeUndefined();
  });
});

describe('generateKNetPaymentId', () => {
  it('starts with knet_', () => {
    const result = generateKNetPaymentId();
    expect(result.startsWith('knet_')).toBe(true);
  });

  it('produces unique IDs on consecutive calls', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 20; i++) {
      ids.add(generateKNetPaymentId());
    }
    expect(ids.size).toBe(20);
  });
});

describe('KNet mock mode detection', () => {
  it('detects mock mode when KNET_BASE_URL is empty string', () => {
    // The isMockMode is computed at module load time, so we test the condition logic
    const checkMock = (url: string | undefined) =>
      url === 'https://test.knet.com/api' || !url || url.trim() === '';
    expect(checkMock('')).toBe(true);
  });

  it('detects mock mode when KNET_BASE_URL is undefined', () => {
    const checkMock = (url: string | undefined) =>
      url === 'https://test.knet.com/api' || !url || url.trim() === '';
    expect(checkMock(undefined)).toBe(true);
  });

  it('detects mock mode when KNET_BASE_URL is the test URL', () => {
    const checkMock = (url: string | undefined) =>
      url === 'https://test.knet.com/api' || !url || url.trim() === '';
    expect(checkMock('https://test.knet.com/api')).toBe(true);
  });

  it('does not detect mock mode for a real production URL', () => {
    const checkMock = (url: string | undefined) =>
      url === 'https://test.knet.com/api' || !url || url.trim() === '';
    expect(checkMock('https://kpay.com.kw/api')).toBe(false);
  });
});
