import { vi } from 'vitest';
export const db = {
  user: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
  event: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
  booking: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
  ticket: { create: vi.fn(), createMany: vi.fn(), update: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() },
  ticketTier: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
  payment: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
  category: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
  venue: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
  review: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
  notification: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
  $transaction: vi.fn((fn) => fn(db)),
};
