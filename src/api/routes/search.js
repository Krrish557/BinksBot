import { searchHandler } from '../controllers/search.js';

export default async function searchRoutes(app) {
  app.get('/search', searchHandler);
}
