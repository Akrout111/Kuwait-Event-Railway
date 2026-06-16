import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted to ensure mock functions are available when vi.mock factory runs
const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

// Mock the Resend module with a proper class constructor
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function (this: unknown, _apiKey?: string) { // eslint-disable-line @typescript-eslint/no-unused-vars
    this.emails = { send: mockSend };
  }),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import { sendEmail, sendBookingConfirmationEmail, sendPaymentFailureEmail } from '@/lib/email';

describe('sendEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('falls back to logging when RESEND_API_KEY is not set', async () => {
    vi.stubEnv('RESEND_API_KEY', '');

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>Hello</p>',
    });

    expect(result).toBe(true);
    // Should NOT have called the actual Resend send
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('falls back to logging when RESEND_API_KEY is the placeholder', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_xxxxxxxx');

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>Hello</p>',
    });

    expect(result).toBe(true);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('returns true when Resend sends successfully', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_valid_api_key_12345');
    mockSend.mockResolvedValue({ data: { id: 'email-id' }, error: null });

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>Hello</p>',
    });

    expect(result).toBe(true);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('returns false when Resend returns an error', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_valid_api_key_12345');
    mockSend.mockResolvedValue({
      data: null,
      error: { message: 'Invalid API key', name: 'validation_error' },
    });

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>Hello</p>',
    });

    expect(result).toBe(false);
  });

  it('returns false when Resend throws an exception', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_valid_api_key_12345');
    mockSend.mockRejectedValue(new Error('Network error'));

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>Hello</p>',
    });

    expect(result).toBe(false);
  });
});

describe('sendBookingConfirmationEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders Arabic template without crashing (mock mode)', async () => {
    vi.stubEnv('RESEND_API_KEY', '');

    const result = await sendBookingConfirmationEmail({
      to: 'test@example.com',
      attendeeName: 'أحمد',
      bookingNumber: 'EVT-2026-000001',
      eventTitle: 'حفل موسيقي',
      eventDate: '2026-06-01',
      eventTime: '8:00 PM',
      venueName: 'مسرح الوطن',
      ticketCount: 2,
      totalAmount: '20.000',
      bookingId: 'booking-123',
      appUrl: 'https://example.com',
      locale: 'ar',
    });

    expect(result).toBe(true);
  });

  it('renders English template without crashing (mock mode)', async () => {
    vi.stubEnv('RESEND_API_KEY', '');

    const result = await sendBookingConfirmationEmail({
      to: 'test@example.com',
      attendeeName: 'Ahmed',
      bookingNumber: 'EVT-2026-000002',
      eventTitle: 'Music Concert',
      eventDate: '2026-06-01',
      eventTime: '8:00 PM',
      venueName: 'National Theater',
      ticketCount: 3,
      totalAmount: '30.000',
      bookingId: 'booking-456',
      appUrl: 'https://example.com',
      locale: 'en',
    });

    expect(result).toBe(true);
  });

  it('defaults to Arabic locale when not specified', async () => {
    vi.stubEnv('RESEND_API_KEY', '');

    const result = await sendBookingConfirmationEmail({
      to: 'test@example.com',
      attendeeName: 'أحمد',
      bookingNumber: 'EVT-2026-000003',
      eventTitle: 'حفل',
      eventDate: '2026-06-01',
      eventTime: '8:00 PM',
      venueName: 'مسرح',
      ticketCount: 1,
      totalAmount: '10.000',
      bookingId: 'booking-789',
      appUrl: 'https://example.com',
    });

    expect(result).toBe(true);
  });
});

describe('sendPaymentFailureEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders Arabic payment failure template without crashing (mock mode)', async () => {
    vi.stubEnv('RESEND_API_KEY', '');

    const result = await sendPaymentFailureEmail({
      to: 'test@example.com',
      attendeeName: 'محمد',
      bookingNumber: 'EVT-2026-000004',
      eventTitle: 'معرض فني',
      locale: 'ar',
    });

    expect(result).toBe(true);
  });

  it('renders English payment failure template without crashing (mock mode)', async () => {
    vi.stubEnv('RESEND_API_KEY', '');

    const result = await sendPaymentFailureEmail({
      to: 'test@example.com',
      attendeeName: 'Mohammed',
      bookingNumber: 'EVT-2026-000005',
      eventTitle: 'Art Exhibition',
      locale: 'en',
    });

    expect(result).toBe(true);
  });

  it('defaults to Arabic locale when not specified', async () => {
    vi.stubEnv('RESEND_API_KEY', '');

    const result = await sendPaymentFailureEmail({
      to: 'test@example.com',
      attendeeName: 'سالم',
      bookingNumber: 'EVT-2026-000006',
      eventTitle: 'فعالية',
    });

    expect(result).toBe(true);
  });
});
