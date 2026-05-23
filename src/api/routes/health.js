import { getHealth } from '../controllers/health.js';

export default async function healthRoutes(app) {
  app.get('/health', getHealth);
}
