import { createStore } from '../../utils/storage.js';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

const FILE_PATH = `${config.storage.dir}/indexes.json`;

const store = createStore(FILE_PATH, { tracks: [], nextId: 1 });

export async function addTrack(data) {
  await store.load();
  const s = store.get();
  const trackId = `track_${String(s.nextId).padStart(4, '0')}`;
  const track = {
    trackId,
    telegramFileId: data.telegramFileId,
    messageId: data.messageId,
    channelId: data.channelId,
    telegramUserId: data.telegramUserId,
    title: data.title || null,
    artist: data.artist || null,
    album: data.album || null,
    duration: data.duration || null,
    bitrate: data.bitrate || null,
    mimeType: data.mimeType || null,
    fileSize: data.fileSize || null,
    artworkPath: data.artworkPath || null,
    createdAt: new Date().toISOString(),
  };
  s.tracks.push(track);
  s.nextId++;
  await store.save();
  logger.info({ trackId, title: track.title }, 'Track indexed');
  return track;
}

export async function getTracksByUser(telegramUserId) {
  await store.load();
  return store.get().tracks.filter(t => t.telegramUserId === telegramUserId);
}

export async function getTrack(trackId) {
  await store.load();
  return store.get().tracks.find(t => t.trackId === trackId) || null;
}

export async function getAllTracks() {
  await store.load();
  return [...store.get().tracks];
}

export async function searchTracks(query, telegramUserId) {
  await store.load();
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return store.get().tracks.filter(t => {
    if (telegramUserId && t.telegramUserId !== telegramUserId) return false;
    return (
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.artist && t.artist.toLowerCase().includes(q)) ||
      (t.album && t.album.toLowerCase().includes(q))
    );
  });
}

export async function updateTrack(trackId, updates) {
  await store.load();
  const s = store.get();
  const index = s.tracks.findIndex(t => t.trackId === trackId);
  if (index === -1) return null;
  s.tracks[index] = { ...s.tracks[index], ...updates };
  await store.save();
  return s.tracks[index];
}

export async function loadIndexes() {
  await store.load();
  logger.info({ trackCount: store.get().tracks.length }, 'Indexes loaded');
}
