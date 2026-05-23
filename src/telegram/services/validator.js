import { getBot, ensureBotReady } from './client.js';
import { logger } from '../../utils/logger.js';

export async function validateChannelAccess(channelId) {
  await ensureBotReady();
  const bot = getBot();
  const errors = [];

  try {
    const chat = await bot.api.getChat(channelId);
    if (!chat) {
      errors.push('Channel not found');
      return { valid: false, errors };
    }
  } catch (err) {
    logger.error({ err, channelId }, 'Failed to access channel');
    const desc = err.description || err.message;
    if (desc.includes('chat not found')) {
      errors.push('Channel not found. Verify the channel ID is correct.');
    } else if (desc.includes('bot was kicked')) {
      errors.push('Bot was removed from the channel.');
    } else if (desc.includes('bot is not a member')) {
      errors.push('Bot is not in the channel. Add the bot as an administrator.');
    } else {
      errors.push(`Cannot access channel: ${desc}`);
    }
    return { valid: false, errors };
  }

  try {
    const botMember = await bot.api.getChatMember(channelId, bot.botInfo.id);
    if (botMember.status !== 'administrator' && botMember.status !== 'creator') {
      errors.push('Bot must be an administrator in the channel.');
      return { valid: false, errors };
    }
    if (botMember.can_send_messages === false) {
      errors.push('Bot lacks permission to send messages in the channel.');
      return { valid: false, errors };
    }
  } catch (err) {
    logger.error({ err, channelId }, 'Failed to check bot permissions');
    errors.push(`Cannot verify permissions: ${err.description || err.message}`);
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}
