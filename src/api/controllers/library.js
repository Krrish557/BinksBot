import { z } from 'zod';
import { getTracksByUser } from '../../storage/indexes/index.js';
import { NotFoundError } from '../../utils/errors.js';

const libraryParamsSchema = z.object({
  telegramUserId: z.string().min(1, 'telegramUserId is required'),
});

export async function getLibrary(request, reply) {
  const { telegramUserId } = libraryParamsSchema.parse(request.params);

  const tracks = await getTracksByUser(telegramUserId);

  const normalized = tracks.map(t => ({
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
    tracks: normalized,
    total: normalized.length,
    telegramUserId,
  };
}
