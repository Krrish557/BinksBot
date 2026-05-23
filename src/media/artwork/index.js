import { readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseFile } from 'music-metadata';
import sharp from 'sharp';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

const ARTWORK_DIR = join(config.storage.dir, 'artwork');

export async function ensureArtworkDir() {
  await mkdir(ARTWORK_DIR, { recursive: true });
}

export async function extractArtwork(filePath) {
  try {
    const metadata = await parseFile(filePath);
    const pic = metadata.common.picture;

    if (!pic || pic.length === 0) {
      return null;
    }

    const picture = pic[0];
    const imageBuffer = picture.data;

    let optimized;
    try {
      optimized = await sharp(imageBuffer)
        .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
    } catch (sharpErr) {
      logger.warn({ err: sharpErr }, 'Sharp optimization failed, using raw artwork');
      optimized = imageBuffer;
    }

    return optimized;
  } catch (err) {
    logger.warn({ err }, 'Artwork extraction failed');
    return null;
  }
}

export async function saveArtwork(trackId, imageBuffer) {
  if (!imageBuffer) return null;

  await ensureArtworkDir();

  const artworkPath = join(ARTWORK_DIR, `${trackId}.jpg`);

  try {
    await writeFile(artworkPath, imageBuffer);
    logger.info({ trackId }, 'Artwork saved');
    return artworkPath;
  } catch (err) {
    logger.error({ err, trackId }, 'Failed to save artwork');
    return null;
  }
}

export async function getArtworkPath(trackId) {
  const artworkPath = join(ARTWORK_DIR, `${trackId}.jpg`);
  if (existsSync(artworkPath)) {
    return artworkPath;
  }
  return null;
}

export async function serveArtwork(trackId) {
  const artworkPath = await getArtworkPath(trackId);
  if (!artworkPath) {
    return null;
  }

  const buffer = await readFile(artworkPath);
  return buffer;
}

export async function deleteArtwork(trackId) {
  try {
    const artworkPath = join(ARTWORK_DIR, `${trackId}.jpg`);
    if (existsSync(artworkPath)) {
      await unlink(artworkPath);
    }
  } catch (err) {
    logger.warn({ err, trackId }, 'Failed to delete artwork');
  }
}
