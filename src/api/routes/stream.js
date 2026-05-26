import { streamTrack, streamHead } from '../controllers/stream.js';
import { auth } from '../middleware/auth.js';

export default async function streamRoutes(app) {
  app.get('/stream/:trackId', { preHandler: [auth] }, streamTrack);
  app.head('/stream/:trackId', { preHandler: [auth] }, streamHead);
}
