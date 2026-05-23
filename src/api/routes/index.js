import healthRoutes from './health.js';
import telegramRoutes from './telegram.js';
import libraryRoutes from './library.js';
import trackRoutes from './tracks.js';
import streamRoutes from './stream.js';
import searchRoutes from './search.js';
import artworkRoutes from './artwork.js';

export async function registerRoutes(app) {
  await healthRoutes(app);
  await telegramRoutes(app);
  await libraryRoutes(app);
  await trackRoutes(app);
  await streamRoutes(app);
  await searchRoutes(app);
  await artworkRoutes(app);
}
