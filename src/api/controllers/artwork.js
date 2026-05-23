import { z } from 'zod';
import { serveArtwork } from '../../media/artwork/index.js';
import { getTrack } from '../../storage/indexes/index.js';
import { NotFoundError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

const artworkParamsSchema = z.object({
  trackId: z.string().min(1, 'trackId is required'),
});

export async function getArtwork(request, reply) {
  const { trackId } = artworkParamsSchema.parse(request.params);

  const track = await getTrack(trackId);
  if (!track) {
    throw new NotFoundError('Track not found');
  }

  const artworkBuffer = await serveArtwork(trackId);

  if (!artworkBuffer) {
    throw new NotFoundError('Artwork not found');
  }

  return reply
    .header('Content-Type', 'image/jpeg')
    .header('Content-Length', artworkBuffer.length)
    .header('Cache-Control', 'public, max-age=86400')
    .send(artworkBuffer);
}
