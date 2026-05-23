import { getBot } from './client.js';
import { config } from '../../config/index.js';
import { AppError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';
import { request } from 'undici';

export async function resolveFile(fileId) {
  try {
    const bot = getBot();
    const tgFile = await bot.api.getFile(fileId);

    if (!tgFile.file_path) {
      throw new AppError('Telegram file path not available', 'FILE_RESOLVE_FAILED', 500);
    }

    const url = `https://api.telegram.org/file/bot${config.bot.token}/${tgFile.file_path}`;

    logger.debug({ fileId, fileSize: tgFile.file_size, filePath: tgFile.file_path }, 'File resolved');

    return {
      fileId: tgFile.file_id,
      fileUniqueId: tgFile.file_unique_id,
      fileSize: tgFile.file_size,
      filePath: tgFile.file_path,
      url,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.error({ err, fileId }, 'Failed to resolve Telegram file');
    throw new AppError('Failed to resolve file from Telegram', 'FILE_RESOLVE_FAILED', 500);
  }
}

export async function fetchFileStream(fileId, rangeHeader) {
  const fileInfo = await resolveFile(fileId);

  const headers = {};
  if (rangeHeader) {
    headers.Range = rangeHeader;
  }

  const response = await request(fileInfo.url, { headers });

  if (response.statusCode === 200 || response.statusCode === 206) {
    logger.debug({ fileId, statusCode: response.statusCode }, 'File stream fetched');
    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body,
      fileInfo,
    };
  }

  throw new AppError(
    `Telegram returned status ${response.statusCode}`,
    'STREAM_FETCH_FAILED',
    502
  );
}

export async function downloadFile(fileId) {
  const fileInfo = await resolveFile(fileId);
  const response = await request(fileInfo.url);

  if (response.statusCode !== 200) {
    throw new AppError(
      `Failed to download file, status ${response.statusCode}`,
      'DOWNLOAD_FAILED',
      502
    );
  }

  const chunks = [];
  for await (const chunk of response.body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
