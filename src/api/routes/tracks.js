import { getTrackById } from '../controllers/tracks.js';
import { auth } from '../middleware/auth.js';

export default async function trackRoutes(app) {
  app.get('/tracks/:trackId', { preHandler: [auth] }, getTrackById);
}
