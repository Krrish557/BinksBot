import { getLibrary } from '../controllers/library.js';
import { auth } from '../middleware/auth.js';

export default async function libraryRoutes(app) {
  app.get('/library/:telegramUserId', { preHandler: [auth] }, getLibrary);
}
