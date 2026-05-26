import { searchHandler } from '../controllers/search.js';
import { auth } from '../middleware/auth.js';

export default async function searchRoutes(app) {
  app.get('/search', { preHandler: [auth] }, searchHandler);
}
