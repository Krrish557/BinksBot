import { config } from '../../config/index.js';

export async function auth(request, reply) {
  if (!config.api.authToken) return;

  const token = request.headers['x-api-token'] || request.query.api_token;
  if (!token || token !== config.api.authToken) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
}
