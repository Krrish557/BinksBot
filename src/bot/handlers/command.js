import { markUserStartedBot } from '../../telegram/services/verification.js';

export function registerCommandHandler(bot) {
  bot.command('start', async (ctx) => {
    markUserStartedBot(String(ctx.from.id));
    await ctx.reply(
      '👋 Welcome to Binks!\n\n' +
      'I help store your music in your personal Binks library.\n\n' +
      'To get started:\n' +
      '1. Open the Binks app\n' +
      '2. Enter your Telegram User ID to verify\n' +
      '3. Connect your storage channel\n' +
      '4. Send me audio files and I\'ll save them!'
    );
  });

  bot.command('help', async (ctx) => {
    await ctx.reply(
      '📖 Binks Bot Help\n\n' +
      '/start — Start the bot and begin setup\n' +
      '/ping — Check if the bot is online\n' +
      '/help — Show this message\n\n' +
      '/id — ' +
      'Send me audio files and I\'ll save them to your Binks library!'
    );
  });
}
