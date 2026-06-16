import { describe, it, expect } from 'vitest';
import { successResponse, errorResponse } from '@/lib/api-response';

describe('successResponse', () => {
  it('returns a JSON response with success true', async () => {
    const response = successResponse({ id: 1 }, 'Operation successful');

    expect(response).toBeInstanceOf(Response);
    const body = await response.json();
    expect(body).toEqual({
      success: true,
      data: { id: 1 },
      message: 'Operation successful',
    });
  });

  it('includes pagination meta when provided', async () => {
    const meta = { page: 1, limit: 10, total: 100, totalPages: 10 };
    const response = successResponse([], 'List fetched', meta);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.meta).toEqual(meta);
  });

  it('does not include meta when not provided', async () => {
    const response = successResponse({ name: 'test' }, 'Done');

    const body = await response.json();
    expect(body).not.toHaveProperty('meta');
  });

  it('handles null data', async () => {
    const response = successResponse(null, 'Deleted successfully');

    const body = await response.json();
    expect(body.data).toBeNull();
    expect(body.success).toBe(true);
  });

  it('handles string data', async () => {
    const response = successResponse('hello', 'Greeting');

    const body = await response.json();
    expect(body.data).toBe('hello');
  });
});

describe('errorResponse', () => {
  it('returns a JSON response with success false and default status 400', async () => {
    const response = errorResponse('VALIDATION_ERROR', 'Invalid input');

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        field: null,
      },
    });
  });

  it('includes field when provided', async () => {
    const response = errorResponse('VALIDATION_ERROR', 'Required', 'email');

    const body = await response.json();
    expect(body.error.field).toBe('email');
  });

  it('uses custom status code when provided', async () => {
    const response = errorResponse('UNAUTHORIZED', 'Login required', undefined, 401);

    expect(response.status).toBe(401);
  });

  it('handles 500 status', async () => {
    const response = errorResponse('INTERNAL_ERROR', 'Server error', undefined, 500);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });

  it('sets field to null when not provided', async () => {
    const response = errorResponse('NOT_FOUND', 'Resource not found');

    const body = await response.json();
    expect(body.error.field).toBeNull();
  });
});
