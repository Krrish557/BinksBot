import { InlineKeyboard } from 'grammy';
import { logger } from '../../utils/logger.js';

const ONBOARDING_URL = 'https://binks.app/onboarding';

export function registerIdCommand(bot) {
  bot.command('id', async (ctx) => {
    try {
      const userId = String(ctx.from?.id);
      const replied = ctx.message?.reply_to_message;

      if (replied?.forward_origin?.chat) {
        const channelId = String(replied.forward_origin.chat.id);
        const keyboard = new InlineKeyboard()
          .copyText('📋 Copy User ID', userId)
          .copyText('📋 Copy Channel ID', channelId);

        return await ctx.reply(
          `User ID: \`${userId}\`\nForwarded Channel ID: \`${channelId}\``,
          {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
          }
        );
      }

      const text = ctx.message?.text || '';
      const args = text.split(' ').slice(1);

      if (args.length === 0) {
        const keyboard = new InlineKeyboard()
          .copyText('📋 Copy User ID', userId);

        return await ctx.reply(
          `Your User ID: \`${userId}\``,
          {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
          }
        );
      }

      const input = args[0].trim();

      if (
        input.startsWith('https://t.me/+') ||
        input.startsWith('https://telegram.me/+')
      ) {
        return await ctx.reply(
          'Private invite links are unsupported by Telegram Bot API.\n\n' +
          'To get a private channel ID:\n' +
          '1. Add the bot to the channel\n' +
          '2. Send any message in the channel\n' +
          '3. Forward that message to the bot'
        );
      }

      let username = input;

      if (input.startsWith('https://t.me/')) {
        username = input
          .replace('https://t.me/', '')
          .split('/')[0];
      }

      if (!username.startsWith('@')) {
        username = `@${username}`;
      }

      const chat = await ctx.api.getChat(username);
      const channelId = String(chat.id);

      const keyboard = new InlineKeyboard()
        .copyText('📋 Copy User ID', userId)
        .copyText('📋 Copy Channel ID', channelId);

      await ctx.reply(
        `User ID: \`${userId}\`\nChannel ID: \`${channelId}\``,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        }
      );

    } catch (error) {
      logger.error({ err: error }, 'Failed to get chat info');

      await ctx.reply(
        'Failed to fetch channel ID.\n\n' +
        'Possible reasons:\n' +
        '- Invalid username\n' +
        '- Channel does not exist\n' +
        '- Bot is not inside the channel\n' +
        '- Channel is private'
      );
    }
  });

  bot.on('message:forward_origin', async (ctx, next) => {
    try {
      const msg = ctx.message;

      if (msg.audio || (msg.document && msg.document.mime_type?.startsWith('audio/'))) {
        await next();
        return;
      }

      const forwardChat = msg.forward_origin?.chat;

      if (!forwardChat) return;

      const userId = String(ctx.from?.id);
      const channelId = String(forwardChat.id);

      const keyboard = new InlineKeyboard()
        .copyText('📋 Copy Channel ID', channelId)
        .row()
        .url('🔗 Continue in Onboarding', ONBOARDING_URL);

      await ctx.reply(
        '✅ Channel detected!\n\n' +
        `Channel Name: ${forwardChat.title || 'Unknown'}\n` +
        `Channel ID: \`${channelId}\`\n\n` +
        'Step 3 — Copy the Channel ID above and paste it into the Binks onboarding page.\n\n' +
        'Once you complete onboarding in the app, you can start sending me audio files! 🎵',
        {
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        }
      );

    } catch (error) {
      logger.error({ err: error }, 'Failed to process forward origin');
    }
  });
}
