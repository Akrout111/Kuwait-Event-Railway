import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findFirst: vi.fn(),
    },
  },
}));

import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { resolveUserId, findUserByIdentifier } from '@/lib/auth-utils';

describe('resolveUserId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns userId from Clerk auth when available', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_123' } as Awaited<ReturnType<typeof auth>>);

    const result = await resolveUserId();
    expect(result).toBe('clerk_user_123');
  });

  it('falls back to cookie auth when Clerk returns no userId', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>);
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'jwt_token_here' }),
    } as unknown as Awaited<ReturnType<typeof cookies>>);
    vi.mocked(verifyToken).mockReturnValue({ userId: 'cookie_user_456' } as never);

    const result = await resolveUserId();
    expect(result).toBe('cookie_user_456');
  });

  it('falls back from Clerk to cookie auth', async () => {
    vi.mocked(auth).mockRejectedValue(new Error('Clerk not configured'));
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'jwt_token_here' }),
    } as unknown as Awaited<ReturnType<typeof cookies>>);
    vi.mocked(verifyToken).mockReturnValue({ userId: 'cookie_user_789' } as never);

    const result = await resolveUserId();
    expect(result).toBe('cookie_user_789');
  });

  it('returns null when both Clerk and cookie auth fail', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>);
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(null),
    } as unknown as Awaited<ReturnType<typeof cookies>>);

    const result = await resolveUserId();
    expect(result).toBeNull();
  });
});

describe('findUserByIdentifier', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('finds user by clerkId match', async () => {
    const mockUser = { id: 'db_user_1', name: 'Test', email: 'test@example.com' };
    vi.mocked(db.user.findFirst).mockResolvedValue(mockUser as never);

    const result = await findUserByIdentifier('clerk_abc');
    expect(result).toEqual(mockUser);
    expect(db.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ clerkId: 'clerk_abc' }, { id: 'clerk_abc' }],
        isActive: true,
        deletedAt: null,
      },
      select: undefined,
    });
  });

  it('finds user by id match', async () => {
    const mockUser = { id: 'db_user_2', name: 'Another', email: 'another@example.com' };
    vi.mocked(db.user.findFirst).mockResolvedValue(mockUser as never);

    const result = await findUserByIdentifier('db_user_2');
    expect(result).toEqual(mockUser);
    expect(db.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ clerkId: 'db_user_2' }, { id: 'db_user_2' }],
        isActive: true,
        deletedAt: null,
      },
      select: undefined,
    });
  });

  it('returns null when no user found', async () => {
    vi.mocked(db.user.findFirst).mockResolvedValue(null);

    const result = await findUserByIdentifier('nonexistent');
    expect(result).toBeNull();
  });

  it('passes select option when provided', async () => {
    const select = { id: true, name: true };
    vi.mocked(db.user.findFirst).mockResolvedValue({ id: '1', name: 'Test' } as never);

    await findUserByIdentifier('some_id', select);
    expect(db.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ clerkId: 'some_id' }, { id: 'some_id' }],
        isActive: true,
        deletedAt: null,
      },
      select,
    });
  });
});
