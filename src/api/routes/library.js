import { getLibrary } from '../controllers/library.js';

export default async function libraryRoutes(app) {
  app.get('/library/:telegramUserId', getLibrary);
}
