import { z } from 'zod';
import { searchTracks } from '../../storage/indexes/index.js';
import { formatTrack } from '../utils/responseFormat.js';

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  telegramUserId: z.string().optional(),
});

export async function searchHandler(request, reply) {
  const { q, telegramUserId } = searchQuerySchema.parse(request.query);

  const results = await searchTracks(q, telegramUserId || null);

  const normalized = results.map(formatTrack);

  return {
    query: q,
    results: normalized,
    total: normalized.length,
  };
}
