import { getTrackById } from '../controllers/tracks.js';

export default async function trackRoutes(app) {
  app.get('/tracks/:trackId', getTrackById);
}
