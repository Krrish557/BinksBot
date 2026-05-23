import { streamTrack, streamHead } from '../controllers/stream.js';

export default async function streamRoutes(app) {
  app.get('/stream/:trackId', streamTrack);
  app.head('/stream/:trackId', streamHead);
}
