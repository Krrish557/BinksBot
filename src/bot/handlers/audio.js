import { getChannelForUser } from '../../storage/mappings/index.js';
import { processAudio } from '../../telegram/uploads/index.js';
import { logger } from '../../utils/logger.js';

export function registerAudioHandler(bot) {
  bot.on('msg:audio', async (ctx) => {
    await handleAudio(ctx, ctx.msg.audio);
  });

  bot.on('msg:document', async (ctx) => {
    const doc = ctx.msg.document;
    if (doc.mime_type && doc.mime_type.startsWith('audio/')) {
      await handleAudio(ctx, doc);
    }
  });
}

async function handleAudio(ctx, file) {
  const telegramUserId = String(ctx.from.id);

  const channelId = await getChannelForUser(telegramUserId);
  if (!channelId) {
    await ctx.reply(
      '❌ No storage channel connected.\n\n' +
      'Open the Binks app, verify your account, and connect a Telegram channel first.'
    );
    return;
  }

  try {
    const result = await processAudio({
      file,
      telegramUserId,
      channelId,
      chatId: ctx.chat.id,
      messageId: ctx.msg.message_id,
    });

    const title = result.title || 'Unknown track';
    await ctx.reply(`✅ Saved "${title}" to your Binks library`);

    logger.info({ telegramUserId, trackId: result.trackId, title }, 'Audio uploaded');
  } catch (err) {
    logger.error({ err, telegramUserId }, 'Audio processing failed');
    await ctx.reply(`❌ Could not save this file: ${err.message}`);
  }
}
