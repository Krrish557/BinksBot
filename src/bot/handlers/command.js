import { InlineKeyboard } from 'grammy';
import { markUserStartedBot } from '../../telegram/services/verification.js';

const ONBOARDING_URL = 'https://binks.app/onboarding';

export function registerCommandHandler(bot) {
  bot.command('start', async (ctx) => {
    const userId = String(ctx.from.id);
    markUserStartedBot(userId);

    const keyboard = new InlineKeyboard()
      .copyText('📋 Copy User ID', userId)
      .row()
      .url('🔗 Open Onboarding Page', ONBOARDING_URL);

    await ctx.reply(
      '👋 Welcome to Binks!\n\n' +
      'Follow these steps to get started:\n\n' +
      'Step 1 — Verify your identity:\n' +
      'Your Telegram User ID is below. Copy it and paste it into the Binks onboarding page.\n\n' +
      `Your User ID: \`${userId}\`\n\n` +
      'Step 2 — Connect your storage channel:\n' +
      '1. Create a new Telegram channel (public or private)\n' +
      '2. Add this bot (@' + (ctx.me?.username || 'BinksBot') + ') as an admin to the channel\n' +
      '3. Send any message in the channel, then forward that message to me here\n\n' +
      'Step 3 — After forwarding, I\'ll give you the Channel ID to enter in the onboarding page.',
      {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      }
    );
  });

  bot.command('help', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .url('📂 BinksBot Repo', 'https://github.com/Krrish557/BinksBot')
      .url('🌐 BinksConnect', 'https://github.com/Krrish557/BinksConnect');

    await ctx.reply(
      '📖 Binks Bot Help\n\n' +
      '*Commands:*\n' +
      '/start — Start the bot and begin setup\n' +
      '/help — Show this help message\n' +
      '/ping — Check if the bot is online\n' +
      '/id — Get your User ID or lookup a channel ID\n' +
      '      Public channels: use with @username or t.me link\n' +
      '      Private channels: forward a message from the channel to this bot\n\n' +
      '*Step-by-Step Setup:*\n' +
      '1. Send /start to see your User ID\n' +
      '2. Copy your User ID and enter it in the Binks onboarding page\n' +
      '3. Create a new Telegram channel (public or private)\n' +
      '4. Add this bot as an admin to your channel\n' +
      '5. Send any message in the channel, then forward that message to this bot\n' +
      '6. Copy the Channel ID and enter it in the Binks onboarding page\n' +
      '7. Done! Now send audio files to this bot and they\'ll be saved to your channel\n\n' +
      '*Usage Tips:*\n' +
      '• Send audio files directly to add to your library\n' +
      '• Forward a channel message to get its Channel ID\n' +
      '• Click the copy buttons for one-tap copying of IDs',
      {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      }
    );
  });
}
