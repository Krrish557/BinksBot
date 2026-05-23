import { request } from 'undici';
import { createWriteStream, unlinkSync, existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { parseFile } from 'music-metadata';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { getBot } from '../../telegram/services/client.js';

export async function extractMetadata(fileId, fileName) {
  const tempDir = join(config.storage.dir, 'temp');
  await mkdir(tempDir, { recursive: true });

  const ext = fileName ? fileName.split('.').pop() || 'bin' : 'bin';
  const tempPath = join(tempDir, `${randomUUID()}.${ext}`);

  try {
    const tgFile = await getBot().api.getFile(fileId);
    if (!tgFile.file_path) {
      throw new Error('No file path returned from Telegram');
    }

    const url = `https://api.telegram.org/file/bot${config.bot.token}/${tgFile.file_path}`;

    const response = await request(url);
    if (response.statusCode !== 200) {
      throw new Error(`Download failed with status ${response.statusCode}`);
    }

    const writeStream = createWriteStream(tempPath);
    await pipeline(response.body, writeStream);

    const metadata = await parseFile(tempPath);
    const { format, common } = metadata;

    return {
      title: common.title || fileName || null,
      artist: common.artist || (common.artists && common.artists[0]) || null,
      album: common.album || null,
      duration: format.duration ? Math.round(format.duration) : null,
      bitrate: format.bitrate || null,
      mimeType: format.container || null,
      extractionPath: tempPath,
    };
  } catch (err) {
    logger.warn({ err, fileId }, 'Metadata extraction failed, using fallback');
    return {
      title: fileName || null,
      artist: null,
      album: null,
      duration: null,
      bitrate: null,
      mimeType: null,
      extractionPath: existsSync(tempPath) ? tempPath : null,
    };
  } finally {
    // Note: caller is responsible for cleanup of extractionPath
    // We keep temp file for artwork extraction
  }
}
