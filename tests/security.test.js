import { describe, it, expect, beforeAll } from 'vitest';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { auth } from '../src/api/middleware/auth.js';

const VALID_TOKEN = 'test-token-123';
const INVALID_TOKEN = 'wrong-token';

let app;

beforeAll(async () => {
  process.env.API_AUTH_TOKEN = VALID_TOKEN;

  app = Fastify();
  await app.register(cors);

  app.get('/health', async () => ({ status: 'ok' }));

  app.get('/library/:telegramUserId', { preHandler: [auth] }, async () => ({ tracks: [] }));
  app.get('/tracks/:trackId', { preHandler: [auth] }, async () => ({}));
  app.get('/stream/:trackId', { preHandler: [auth] }, async () => ({}));
  app.get('/search', { preHandler: [auth] }, async () => ({ results: [] }));
  app.get('/artwork/:trackId', { preHandler: [auth] }, async () => ({}));

  await app.ready();
});

describe('API Security', () => {
  it('public route is accessible without token', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
  });

  it('protected route rejects missing token', async () => {
    const res = await app.inject({ method: 'GET', url: '/library/test' });
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('protected route rejects invalid token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/library/test',
      headers: { 'x-api-token': INVALID_TOKEN },
    });
    expect(res.statusCode).toBe(401);
  });

  it('protected route accepts valid token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/library/test',
      headers: { 'x-api-token': VALID_TOKEN },
    });
    expect(res.statusCode).toBe(200);
  });
});
