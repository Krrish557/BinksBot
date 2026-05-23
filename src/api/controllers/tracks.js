import { z } from 'zod';
import { getTrack } from '../../storage/indexes/index.js';
import { NotFoundError } from '../../utils/errors.js';

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
    id: `telegram:${track.trackId}`,
    trackId: track.trackId,
    title: track.title || 'Unknown Track',
    artist: track.artist || 'Unknown Artist',
    album: track.album || null,
    duration: track.duration || 0,
    bitrate: track.bitrate || null,
    mimeType: track.mimeType || 'audio/mpeg',
    fileSize: track.fileSize || null,
    artworkPath: track.artworkPath || null,
    provider: 'telegram',
    createdAt: track.createdAt,
  };
}
