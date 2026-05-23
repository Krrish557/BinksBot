import { z } from 'zod';
import { searchTracks } from '../../storage/indexes/index.js';

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  telegramUserId: z.string().optional(),
});

export async function searchHandler(request, reply) {
  const { q, telegramUserId } = searchQuerySchema.parse(request.query);

  const results = await searchTracks(q, telegramUserId || null);

  const normalized = results.map(t => ({
    id: `telegram:${t.trackId}`,
    trackId: t.trackId,
    title: t.title || 'Unknown Track',
    artist: t.artist || 'Unknown Artist',
    album: t.album || null,
    duration: t.duration || 0,
    artworkPath: t.artworkPath || null,
    provider: 'telegram',
  }));

  return {
    query: q,
    results: normalized,
    total: normalized.length,
  };
}
