import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted to ensure the mock function is available when vi.mock factory runs
const { mockFindUnique } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    event: {
      findUnique: mockFindUnique,
    },
  },
}));

import { generateUniqueSlug } from '../slug';

describe('generateUniqueSlug', () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
  });

  it('generates slug from English title', async () => {
    mockFindUnique.mockResolvedValue(null);
    const slug = await generateUniqueSlug('عنوان عربي', 'My Event Title');
    expect(slug).toBe('my-event-title');
  });

  it('generates slug from Arabic title when no English title provided', async () => {
    mockFindUnique.mockResolvedValue(null);
    const slug = await generateUniqueSlug('حدث الكويت');
    // Arabic text with \w regex won't match Arabic chars, so it should fallback
    expect(slug).toBeDefined();
    expect(typeof slug).toBe('string');
  });

  it('handles special characters in English title', async () => {
    mockFindUnique.mockResolvedValue(null);
    const slug = await generateUniqueSlug('عنوان عربي', 'Hello, World! @2024 #Event');
    expect(slug).toBe('hello-world-2024-event');
  });

  it('appends counter when slug already exists', async () => {
    mockFindUnique
      .mockResolvedValueOnce({ id: '1', slug: 'my-event' }) // first exists
      .mockResolvedValueOnce(null); // second is unique

    const slug = await generateUniqueSlug('عنوان', 'My Event');
    expect(slug).toBe('my-event-1');
  });

  it('increments counter for multiple collisions', async () => {
    mockFindUnique
      .mockResolvedValueOnce({ id: '1', slug: 'my-event' })
      .mockResolvedValueOnce({ id: '2', slug: 'my-event-1' })
      .mockResolvedValueOnce({ id: '3', slug: 'my-event-2' })
      .mockResolvedValueOnce(null);

    const slug = await generateUniqueSlug('عنوان', 'My Event');
    expect(slug).toBe('my-event-3');
  });

  it('truncates long titles to 100 characters', async () => {
    mockFindUnique.mockResolvedValue(null);
    const longTitle = 'a'.repeat(150);
    const slug = await generateUniqueSlug('عنوان', longTitle);
    expect(slug.length).toBeLessThanOrEqual(100);
  });

  it('replaces spaces with hyphens', async () => {
    mockFindUnique.mockResolvedValue(null);
    const slug = await generateUniqueSlug('عنوان', 'Hello World Event');
    expect(slug).toBe('hello-world-event');
  });

  it('replaces underscores with hyphens', async () => {
    mockFindUnique.mockResolvedValue(null);
    const slug = await generateUniqueSlug('عنوان', 'Hello_World_Event');
    expect(slug).toBe('hello-world-event');
  });

  it('removes leading and trailing hyphens', async () => {
    mockFindUnique.mockResolvedValue(null);
    const slug = await generateUniqueSlug('عنوان', '---Hello World---');
    expect(slug).toBe('hello-world');
  });

  it('converts to lowercase', async () => {
    mockFindUnique.mockResolvedValue(null);
    const slug = await generateUniqueSlug('عنوان', 'UPPERCASE TITLE');
    expect(slug).toBe('uppercase-title');
  });

  it('handles empty English title gracefully', async () => {
    mockFindUnique.mockResolvedValue(null);
    const slug = await generateUniqueSlug('عنوان', '');
    // Should use Arabic title as fallback, which may produce empty slug -> fallback to event-timestamp
    expect(slug).toBeDefined();
    expect(typeof slug).toBe('string');
  });

  it('returns timestamp-based slug when all Arabic text produces empty base', async () => {
    mockFindUnique.mockResolvedValue(null);
    const slug = await generateUniqueSlug('حدث');
    // Arabic chars don't match \w, so baseSlug is empty, fallback to event-{timestamp}
    expect(slug).toMatch(/^event-/);
  });
});
