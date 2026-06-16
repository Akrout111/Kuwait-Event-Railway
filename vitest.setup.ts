// @ts-nocheck — vitest setup file; `vi` is provided globally by vitest at runtime.
import '@testing-library/jest-dom';

vi.mock('next/headers', () => ({
  headers: () => new Headers(),
  cookies: () => ({ get: () => null, set: () => {} }),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: () => Promise.resolve((key: string) => key),
}));
