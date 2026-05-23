import { getAllUsers } from '../../storage/mappings/index.js';
import { processAudio } from '../../telegram/uploads/index.js';
import { logger } from '../../utils/logger.js';

export function registerChannelPostHandler(bot) {
  bot.on('channel_post:audio', async (ctx) => {
    await handleChannelAudio(ctx, ctx.channelPost.audio);
  });

  bot.on('channel_post:document', async (ctx) => {
    const doc = ctx.channelPost.document;
    if (doc.mime_type && doc.mime_type.startsWith('audio/')) {
      await handleChannelAudio(ctx, doc);
    }
  });
}

async function handleChannelAudio(ctx, file) {
  const channelId = String(ctx.chat.id);

  const allUsers = await getAllUsers();
  const mapping = allUsers.find(u => u.channelId === channelId && u.verified);
  if (!mapping) return;

  const telegramUserId = mapping.telegramUserId;

  try {
    const result = await processAudio({
      file,
      telegramUserId,
      channelId,
      chatId: channelId,
      messageId: ctx.channelPost.message_id,
      skipCopy: true,
    });

    logger.info({ telegramUserId, channelId, trackId: result.trackId, title: result.title }, 'Channel audio indexed');
  } catch (err) {
    logger.error({ err, telegramUserId, channelId }, 'Channel audio processing failed');
  }
}
