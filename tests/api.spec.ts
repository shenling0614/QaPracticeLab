import { test, expect } from '@playwright/test';
import { DUPLICATE_MESSAGE, uniqueEmail } from './fixtures';

const VALID_ROLE = 'qa-engineer';

test.describe('Applications API', () => {
  test('creates an application and returns a confirmation', async ({ request }) => {
    const response = await request.post('/api/applications', {
      data: {
        fullName: 'Ling Shen',
        email: uniqueEmail('api-ling'),
        role: VALID_ROLE,
      },
    });

    expect(response.status()).toBe(201);
    await expect(response.json()).resolves.toEqual({ confirmation: 'QA-1001' });
  });

  test('rejects a missing name, email, and role', async ({ request }) => {
    const response = await request.post('/api/applications', {
      data: {},
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.errors).toEqual([
      'Full name is required',
      'Email is required',
      'Role is required',
    ]);
  });

  test('rejects an invalid email', async ({ request }) => {
    const response = await request.post('/api/applications', {
      data: {
        fullName: 'Ada Lovelace',
        email: 'not-an-email',
        role: VALID_ROLE,
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.errors).toContain('Enter a valid email');
  });

  test('rejects a whitespace-only name', async ({ request }) => {
    const response = await request.post('/api/applications', {
      data: {
        fullName: '   ',
        email: uniqueEmail('api-space'),
        role: 'sdet',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.errors).toContain('Full name is required');
  });

  test('rejects a missing role', async ({ request }) => {
    const response = await request.post('/api/applications', {
      data: {
        fullName: 'Ada Lovelace',
        email: uniqueEmail('api-role'),
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.errors).toContain('Role is required');
  });

  test('rejects an email that already applied', async ({ request }) => {
    const response = await request.post('/api/applications', {
      data: {
        fullName: 'Alex Rivera',
        email: 'applied@example.com',
        role: 'sdet',
      },
    });

    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.errors).toEqual([DUPLICATE_MESSAGE]);
  });

  test('rejects a duplicate email regardless of letter case', async ({ request }) => {
    const response = await request.post('/api/applications', {
      data: {
        fullName: 'Alex Rivera',
        email: 'Applied@Example.com',
        role: VALID_ROLE,
      },
    });

    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.errors).toEqual([DUPLICATE_MESSAGE]);
  });
});
