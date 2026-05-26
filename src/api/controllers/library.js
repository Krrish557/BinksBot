import { z } from 'zod';
import { getTracksByUser } from '../../storage/indexes/index.js';
import { NotFoundError } from '../../utils/errors.js';
import { formatTrack } from '../utils/responseFormat.js';

const libraryParamsSchema = z.object({
  telegramUserId: z.string().min(1, 'telegramUserId is required'),
});

export async function getLibrary(request, reply) {
  const { telegramUserId } = libraryParamsSchema.parse(request.params);

  const tracks = await getTracksByUser(telegramUserId);

  const normalized = tracks.map(formatTrack);

  return {
    tracks: normalized,
    total: normalized.length,
    telegramUserId,
  };
}
