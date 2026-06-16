import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted to ensure mock functions are available when vi.mock factory runs
const {
  mockBookingFindMany,
  mockBookingUpdate,
  mockTicketTierUpdate,
  mockTicketDeleteMany,
  mockTransaction,
} = vi.hoisted(() => {
  const mockBookingFindMany = vi.fn();
  const mockBookingUpdate = vi.fn();
  const mockTicketTierUpdate = vi.fn();
  const mockTicketDeleteMany = vi.fn();
  const mockTransaction = vi.fn((fn) =>
    fn({
      booking: { update: mockBookingUpdate },
      ticketTier: { update: mockTicketTierUpdate },
      ticket: { deleteMany: mockTicketDeleteMany },
    })
  );
  return {
    mockBookingFindMany,
    mockBookingUpdate,
    mockTicketTierUpdate,
    mockTicketDeleteMany,
    mockTransaction,
  };
});

vi.mock('@/lib/db', () => ({
  db: {
    booking: {
      findMany: mockBookingFindMany,
      update: mockBookingUpdate,
    },
    ticketTier: {
      update: mockTicketTierUpdate,
    },
    ticket: {
      deleteMany: mockTicketDeleteMany,
    },
    $transaction: mockTransaction,
  },
}));

vi.mock('@/lib/update-event-prices', () => ({
  updateEventMinPrice: vi.fn(),
}));

import { releaseExpiredBookings } from '@/lib/booking-expiry';

describe('releaseExpiredBookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns released: 0 when there are no expired bookings', async () => {
    mockBookingFindMany.mockResolvedValue([]);

    const result = await releaseExpiredBookings();

    expect(result).toEqual({ released: 0 });
    expect(mockBookingFindMany).toHaveBeenCalledTimes(1);
  });

  it('releases expired bookings and returns the count', async () => {
    const expiredBooking = {
      id: 'booking-1',
      eventId: 'event-1',
      tickets: [
        { ticketTierId: 'tier-1', ticketTier: { id: 'tier-1' } },
        { ticketTierId: 'tier-2', ticketTier: { id: 'tier-2' } },
      ],
    };
    mockBookingFindMany.mockResolvedValue([expiredBooking]);
    mockBookingUpdate.mockResolvedValue({ id: 'booking-1', status: 'CANCELLED' });
    mockTicketTierUpdate.mockResolvedValue({});
    mockTicketDeleteMany.mockResolvedValue({ count: 2 });

    const result = await releaseExpiredBookings();

    expect(result).toEqual({ released: 1 });
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });

  it('decrements quantitySold for each ticket tier in the booking', async () => {
    const expiredBooking = {
      id: 'booking-2',
      eventId: 'event-2',
      tickets: [
        { ticketTierId: 'tier-a', ticketTier: { id: 'tier-a' } },
        { ticketTierId: 'tier-b', ticketTier: { id: 'tier-b' } },
        { ticketTierId: 'tier-c', ticketTier: { id: 'tier-c' } },
      ],
    };
    mockBookingFindMany.mockResolvedValue([expiredBooking]);
    mockBookingUpdate.mockResolvedValue({});
    mockTicketTierUpdate.mockResolvedValue({});
    mockTicketDeleteMany.mockResolvedValue({ count: 3 });

    await releaseExpiredBookings();

    expect(mockTicketTierUpdate).toHaveBeenCalledTimes(3);
  });

  it('cancels the booking and deletes tickets in a transaction', async () => {
    const expiredBooking = {
      id: 'booking-3',
      eventId: 'event-3',
      tickets: [{ ticketTierId: 'tier-x', ticketTier: { id: 'tier-x' } }],
    };
    mockBookingFindMany.mockResolvedValue([expiredBooking]);
    mockBookingUpdate.mockResolvedValue({});
    mockTicketTierUpdate.mockResolvedValue({});
    mockTicketDeleteMany.mockResolvedValue({ count: 1 });

    await releaseExpiredBookings();

    // Transaction should have been called
    expect(mockTransaction).toHaveBeenCalledTimes(1);

    // Inside the transaction, booking update should cancel
    expect(mockBookingUpdate).toHaveBeenCalledWith({
      where: { id: 'booking-3' },
      data: { status: 'CANCELLED' },
    });

    // Tickets should be deleted
    expect(mockTicketDeleteMany).toHaveBeenCalledWith({
      where: { bookingId: 'booking-3' },
    });
  });

  it('handles multiple expired bookings', async () => {
    const bookings = [
      {
        id: 'booking-a',
        eventId: 'event-a',
        tickets: [{ ticketTierId: 't1', ticketTier: { id: 't1' } }],
      },
      {
        id: 'booking-b',
        eventId: 'event-b',
        tickets: [{ ticketTierId: 't2', ticketTier: { id: 't2' } }],
      },
    ];
    mockBookingFindMany.mockResolvedValue(bookings);
    mockBookingUpdate.mockResolvedValue({});
    mockTicketTierUpdate.mockResolvedValue({});
    mockTicketDeleteMany.mockResolvedValue({ count: 1 });

    const result = await releaseExpiredBookings();

    expect(result).toEqual({ released: 2 });
    expect(mockTransaction).toHaveBeenCalledTimes(2);
  });

  it('queries only PENDING bookings created before the expiry threshold', async () => {
    mockBookingFindMany.mockResolvedValue([]);

    await releaseExpiredBookings();

    const findManyArgs = mockBookingFindMany.mock.calls[0][0];
    expect(findManyArgs.where.status).toBe('PENDING');
    expect(findManyArgs.where.createdAt.lt).toBeInstanceOf(Date);
  });
});
