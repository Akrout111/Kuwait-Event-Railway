import { describe, it, expect, beforeAll } from 'vitest';
import { generateTicketQRData, verifyTicketQRData } from '@/lib/qr-utils';

describe('QR utilities', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-for-qr-utils';
  });

  describe('generateTicketQRData', () => {
    it('generates valid JSON string with tn, bid, v, sig', () => {
      const result = generateTicketQRData('TKT-001', 'booking-123');

      const parsed = JSON.parse(result);
      expect(parsed.tn).toBe('TKT-001');
      expect(parsed.bid).toBe('booking-123');
      expect(parsed.v).toBe(1);
      expect(parsed.sig).toBeDefined();
      expect(typeof parsed.sig).toBe('string');
    });

    it('generates different signatures for different data', () => {
      const result1 = generateTicketQRData('TKT-001', 'booking-123');
      const result2 = generateTicketQRData('TKT-002', 'booking-123');

      const parsed1 = JSON.parse(result1);
      const parsed2 = JSON.parse(result2);
      expect(parsed1.sig).not.toBe(parsed2.sig);
    });
  });

  describe('verifyTicketQRData', () => {
    it('verifies a valid QR data string', () => {
      const qrData = generateTicketQRData('TKT-001', 'booking-123');
      const result = verifyTicketQRData(qrData);

      expect(result.valid).toBe(true);
      expect(result.tn).toBe('TKT-001');
      expect(result.bid).toBe('booking-123');
      expect(result.v).toBe(1);
    });

    it('rejects tampered data', () => {
      const qrData = generateTicketQRData('TKT-001', 'booking-123');
      const parsed = JSON.parse(qrData);
      parsed.tn = 'TAMPERED';
      const tamperedData = JSON.stringify(parsed);

      const result = verifyTicketQRData(tamperedData);
      expect(result.valid).toBe(false);
    });

    it('rejects data with missing fields', () => {
      const result = verifyTicketQRData(JSON.stringify({ tn: 'TKT-001' }));
      expect(result.valid).toBe(false);
    });

    it('rejects data with missing signature', () => {
      const result = verifyTicketQRData(JSON.stringify({ tn: 'TKT-001', bid: 'booking-123', v: 1 }));
      expect(result.valid).toBe(false);
    });

    it('rejects invalid JSON', () => {
      const result = verifyTicketQRData('not-json');
      expect(result.valid).toBe(false);
    });

    it('rejects data with wrong signature', () => {
      const result = verifyTicketQRData(JSON.stringify({
        tn: 'TKT-001',
        bid: 'booking-123',
        v: 1,
        sig: '0000000000000000000000000000000000000000000000000000000000000000',
      }));
      expect(result.valid).toBe(false);
    });
  });
});
