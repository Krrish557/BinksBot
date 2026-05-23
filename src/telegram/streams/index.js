import { fetchFileStream } from '../services/fileResolver.js';
import { getTrack } from '../../storage/indexes/index.js';
import { logger } from '../../utils/logger.js';
import { NotFoundError } from '../../utils/errors.js';

const SUPPORTED_AUDIO_TYPES = {
  'audio/mpeg': '.mp3',
  'audio/mp4': '.m4a',
  'audio/ogg': '.ogg',
  'audio/wav': '.wav',
  'audio/flac': '.flac',
  'audio/aac': '.aac',
  'audio/opus': '.opus',
  'audio/webm': '.webm',
};

export async function createStreamResponse(trackId, rangeHeader) {
  const track = await getTrack(trackId);
  if (!track) {
    throw new NotFoundError('Track not found');
  }

  logger.info({ trackId, title: track.title }, 'Stream requested');

  const streamResult = await fetchFileStream(track.telegramFileId, rangeHeader);

  const contentType = resolveContentType(track);

  const extraHeaders = {
    'Accept-Ranges': 'bytes',
    'Content-Type': contentType,
  };

  if (streamResult.headers['content-range']) {
    extraHeaders['Content-Range'] = streamResult.headers['content-range'];
  }

  if (streamResult.headers['content-length']) {
    extraHeaders['Content-Length'] = streamResult.headers['content-length'];
  }

  if (streamResult.fileInfo.fileSize) {
    extraHeaders['X-File-Size'] = String(streamResult.fileInfo.fileSize);
  }

  return {
    statusCode: streamResult.statusCode,
    headers: extraHeaders,
    body: streamResult.body,
    fileSize: streamResult.fileInfo.fileSize || track.fileSize,
  };
}

function resolveContentType(track) {
  if (track.mimeType) {
    const type = SUPPORTED_AUDIO_TYPES[track.mimeType];
    if (type) return track.mimeType;
  }
  return 'audio/mpeg';
}
