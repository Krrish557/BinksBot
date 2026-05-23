import { getArtwork } from '../controllers/artwork.js';

export default async function artworkRoutes(app) {
  app.get('/artwork/:trackId', getArtwork);
}
