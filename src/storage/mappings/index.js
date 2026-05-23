import { createStore } from '../../utils/storage.js';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

const FILE_PATH = `${config.storage.dir}/mappings.json`;

const store = createStore(FILE_PATH, { users: [] });

export async function findByUserId(telegramUserId) {
  await store.load();
  return store.get().users.find(u => u.telegramUserId === telegramUserId) || null;
}

export async function upsertMapping(telegramUserId, channelId) {
  await store.load();
  const s = store.get();
  const existing = s.users.find(u => u.telegramUserId === telegramUserId);
  if (existing) {
    existing.channelId = channelId;
    existing.updatedAt = new Date().toISOString();
  } else {
    s.users.push({
      telegramUserId,
      channelId,
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  await store.save();
  return findByUserId(telegramUserId);
}

export async function markVerified(telegramUserId) {
  await store.load();
  const s = store.get();
  let user = s.users.find(u => u.telegramUserId === telegramUserId);
  if (user) {
    user.verified = true;
    user.updatedAt = new Date().toISOString();
  } else {
    user = {
      telegramUserId,
      channelId: null,
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    s.users.push(user);
  }
  await store.save();
  logger.info({ telegramUserId }, 'User marked as verified');
  return user;
}

export async function getChannelForUser(telegramUserId) {
  await store.load();
  const s = store.get();
  const user = s.users.find(u => u.telegramUserId === telegramUserId);
  if (user && user.verified && user.channelId) {
    return user.channelId;
  }
  return null;
}

export async function getAllUsers() {
  await store.load();
  return [...store.get().users];
}

export async function loadMappings() {
  await store.load();
  logger.info({ userCount: store.get().users.length }, 'Mappings loaded');
}
