import { z } from 'zod';
import { createStreamResponse } from '../../telegram/streams/index.js';
import { getTrack } from '../../storage/indexes/index.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError } from '../../utils/errors.js';

const streamParamsSchema = z.object({
  trackId: z.string().min(1, 'trackId is required'),
});

export async function streamTrack(request, reply) {
  const { trackId } = streamParamsSchema.parse(request.params);

  const rangeHeader = request.headers.range;

  const result = await createStreamResponse(trackId, rangeHeader);

  const statusCode = rangeHeader && result.statusCode === 206 ? 206 : 200;

  reply.hijack();

  reply.raw.writeHead(statusCode, {
    'Content-Type': result.headers['Content-Type'] || 'audio/mpeg',
    'Accept-Ranges': result.headers['Accept-Ranges'] || 'bytes',
    ...(result.headers['Content-Range'] ? { 'Content-Range': result.headers['Content-Range'] } : {}),
    ...(result.headers['Content-Length'] ? { 'Content-Length': result.headers['Content-Length'] } : {}),
    ...(result.headers['X-File-Size'] ? { 'X-File-Size': result.headers['X-File-Size'] } : {}),
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
  });

  const streamTimeout = setTimeout(() => {
    logger.warn({ trackId }, 'Stream timeout reached');
    if (!reply.raw.destroyed) {
      reply.raw.destroy(new Error('Stream timeout'));
    }
  }, 120000);

  result.body.on('error', (streamErr) => {
    clearTimeout(streamTimeout);
    if (streamErr?.code === 'UND_ERR_ABORTED') {
      logger.warn({ trackId }, 'Stream aborted (client disconnected)');
    } else {
      logger.error({ err: streamErr, trackId }, 'Stream error');
    }
    if (!reply.raw.destroyed) {
      reply.raw.destroy();
    }
  });

  reply.raw.on('close', () => {
    clearTimeout(streamTimeout);
    result.body.destroy();
  });

  reply.raw.on('finish', () => {
    clearTimeout(streamTimeout);
  });

  result.body.pipe(reply.raw);
}

export async function streamHead(request, reply) {
  const { trackId } = streamParamsSchema.parse(request.params);

  const track = await getTrack(trackId);
  if (!track) {
    throw new NotFoundError('Track not found');
  }

  const contentLength = track.fileSize || 0;
  const contentType = track.mimeType || 'audio/mpeg';

  return reply
    .header('Content-Type', contentType)
    .header('Accept-Ranges', 'bytes')
    .header('Content-Length', String(contentLength))
    .header('Cache-Control', 'no-cache')
    .header('Access-Control-Allow-Origin', '*')
    .code(200)
    .send();
}
