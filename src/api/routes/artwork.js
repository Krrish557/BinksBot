import { getArtwork } from '../controllers/artwork.js';
import { auth } from '../middleware/auth.js';

export default async function artworkRoutes(app) {
  app.get('/artwork/:trackId', { preHandler: [auth] }, getArtwork);
}
