import { unlinkSync, existsSync } from 'node:fs';
import { getBot } from '../services/client.js';
import { extractMetadata } from '../../media/metadata/index.js';
import { extractArtwork, saveArtwork } from '../../media/artwork/index.js';
import { addTrack, updateTrack } from '../../storage/indexes/index.js';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../utils/errors.js';

export async function processAudio({ file, telegramUserId, channelId, chatId, messageId, skipCopy }) {
  const botApi = getBot().api;

  let storedMessageId = messageId;

  if (!skipCopy) {
    try {
      const copiedMessage = await botApi.copyMessage(channelId, chatId, messageId);
      storedMessageId = copiedMessage.message_id;
      logger.info(
        { telegramUserId, channelId, storedMessageId },
        'Audio copied to storage channel'
      );
    } catch (err) {
      logger.error({ err, channelId }, 'Failed to copy message to channel');
      throw new AppError(
        'Failed to save audio to storage channel. Check bot permissions.',
        'COPY_FAILED',
        500
      );
    }
  }

  let metadata;
  let artworkBuffer = null;
  let tempPath = null;

  try {
    metadata = await extractMetadata(file.file_id, file.file_name);
    tempPath = metadata.extractionPath;
    if (tempPath && existsSync(tempPath)) {
      artworkBuffer = await extractArtwork(tempPath);
    }
  } catch (err) {
    logger.warn({ err }, 'Metadata extraction failed, proceeding with defaults');
    metadata = {
      title: file.file_name || null,
      artist: null,
      album: null,
      duration: null,
      bitrate: null,
      mimeType: null,
    };
  } finally {
    if (tempPath && existsSync(tempPath)) {
      try {
        unlinkSync(tempPath);
      } catch (cleanupErr) {
        logger.warn({ err: cleanupErr }, 'Failed to clean up temp file');
      }
    }
  }

  let track;
  try {
    track = await addTrack({
      telegramFileId: file.file_id,
      messageId: storedMessageId,
      channelId,
      telegramUserId,
      title: metadata.title,
      artist: metadata.artist,
      album: metadata.album,
      duration: metadata.duration,
      bitrate: metadata.bitrate,
      mimeType: metadata.mimeType || file.mime_type,
      fileSize: file.file_size,
    });
  } catch (err) {
    logger.error({ err }, 'Failed to index track');
    throw new AppError('Failed to index track metadata', 'INDEX_FAILED', 500);
  }

  if (artworkBuffer) {
    const artworkPath = await saveArtwork(track.trackId, artworkBuffer);
    if (artworkPath) {
      await updateTrack(track.trackId, { artworkPath });
      track.artworkPath = artworkPath;
    }
  }

  logger.info({ trackId: track.trackId, title: track.title }, 'Track indexed successfully');

  return {
    trackId: track.trackId,
    title: track.title,
    artist: track.artist,
    album: track.album,
    duration: track.duration,
    bitrate: track.bitrate,
    mimeType: track.mimeType,
    artworkPath: track.artworkPath,
  };
}
