import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted to ensure mock functions are available when vi.mock factory runs
const { mockFindMany, mockCount } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    event: {
      findMany: mockFindMany,
      count: mockCount,
    },
  },
}));

import { searchEvents } from '@/lib/search';

const mockEvent1 = {
  id: 'evt-1',
  titleAr: 'حفل موسيقي',
  titleEn: 'Music Concert',
  minPrice: '10.000',
  startDate: new Date('2026-06-01'),
  venue: { id: 'v1', nameAr: 'مسرح', nameEn: 'Theater', city: 'Kuwait City' },
  category: { id: 'cat-1', nameAr: 'موسيقى', nameEn: 'Music', slug: 'music' },
  ticketTiers: [
    { id: 'tt1', type: 'STANDARD', price: '10.000', quantityTotal: 100, quantitySold: 30 },
  ],
  organizer: { id: 'org-1', name: 'Events Co.' },
};

const mockEvent2 = {
  id: 'evt-2',
  titleAr: 'معرض فني',
  titleEn: 'Art Exhibition',
  minPrice: '5.000',
  startDate: new Date('2026-07-01'),
  venue: { id: 'v2', nameAr: 'قاعة', nameEn: 'Hall', city: 'Hawally' },
  category: { id: 'cat-2', nameAr: 'فن', nameEn: 'Art', slug: 'art' },
  ticketTiers: [
    { id: 'tt2', type: 'STANDARD', price: '5.000', quantityTotal: 50, quantitySold: 10 },
  ],
  organizer: { id: 'org-2', name: 'Art Co.' },
};

describe('searchEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns paginated results', async () => {
    mockFindMany.mockResolvedValue([mockEvent1, mockEvent2]);
    mockCount.mockResolvedValue(2);

    const result = await searchEvents({ page: 1, limit: 10 });

    expect(result.events).toHaveLength(2);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });
  });

  it('calculates totalPages correctly', async () => {
    mockFindMany.mockResolvedValue([mockEvent1]);
    mockCount.mockResolvedValue(25);

    const result = await searchEvents({ page: 1, limit: 10 });

    expect(result.pagination.totalPages).toBe(3);
  });

  it('adds quantityAvailable to ticket tiers', async () => {
    mockFindMany.mockResolvedValue([mockEvent1]);
    mockCount.mockResolvedValue(1);

    const result = await searchEvents({});

    expect(result.events[0].ticketTiers[0].quantityAvailable).toBe(70); // 100 - 30
  });

  it('passes query filter for search', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await searchEvents({ query: 'Concert' });

    const findManyArgs = mockFindMany.mock.calls[0][0];
    expect(findManyArgs.where.OR).toBeDefined();
    expect(findManyArgs.where.OR).toEqual([
      { titleAr: { contains: 'Concert' } },
      { titleEn: { contains: 'Concert' } },
      { descriptionAr: { contains: 'Concert' } },
    ]);
  });

  it('passes category filter', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await searchEvents({ category: 'music' });

    const findManyArgs = mockFindMany.mock.calls[0][0];
    expect(findManyArgs.where.category).toEqual({ slug: 'music' });
  });

  it('passes city filter through venue relation', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await searchEvents({ city: 'Kuwait City' });

    const findManyArgs = mockFindMany.mock.calls[0][0];
    expect(findManyArgs.where.venue).toEqual({ city: 'Kuwait City' });
  });

  it('applies date range filter when provided', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await searchEvents({
      startDateFrom: '2026-06-01',
      startDateTo: '2026-06-30',
    });

    const findManyArgs = mockFindMany.mock.calls[0][0];
    expect(findManyArgs.where.startDate).toBeDefined();
    expect(findManyArgs.where.startDate.gte).toBeInstanceOf(Date);
    expect(findManyArgs.where.startDate.lte).toBeInstanceOf(Date);
  });

  it('sorts by price using minPrice field', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await searchEvents({ sortBy: 'price', sortOrder: 'asc' });

    const findManyArgs = mockFindMany.mock.calls[0][0];
    expect(findManyArgs.orderBy).toEqual({ minPrice: 'asc' });
  });

  it('sorts by startDate by default', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await searchEvents({});

    const findManyArgs = mockFindMany.mock.calls[0][0];
    expect(findManyArgs.orderBy).toEqual({ startDate: 'asc' });
  });

  it('applies pagination with skip and take', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await searchEvents({ page: 3, limit: 10 });

    const findManyArgs = mockFindMany.mock.calls[0][0];
    expect(findManyArgs.skip).toBe(20); // (3-1) * 10
    expect(findManyArgs.take).toBe(10);
  });
});
