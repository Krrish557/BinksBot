import { z } from 'zod';
import { getTrack } from '../../storage/indexes/index.js';
import { NotFoundError } from '../../utils/errors.js';
import { formatTrack } from '../utils/responseFormat.js';

const trackParamsSchema = z.object({
  trackId: z.string().min(1, 'trackId is required'),
});

export async function getTrackById(request, reply) {
  const { trackId } = trackParamsSchema.parse(request.params);

  const track = await getTrack(trackId);
  if (!track) {
    throw new NotFoundError('Track not found');
  }

  return {
    ...formatTrack(track),
    bitrate: track.bitrate || null,
    mimeType: track.mimeType || 'audio/mpeg',
    fileSize: track.fileSize || null,
    createdAt: track.createdAt,
  };
}
