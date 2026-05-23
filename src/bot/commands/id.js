export function registerIdCommand(bot) {
  // Unified /id command handler
  bot.command('id', async (ctx) => {
    try {
      const userId = String(ctx.from?.id);
      const replied = ctx.message?.reply_to_message;

      // If replying to a forwarded message, show the forward origin channel ID
      if (replied?.forward_origin?.chat) {
        return await ctx.reply(
          `User ID: ${userId}\nForwarded Channel ID: ${replied.forward_origin.chat.id}`
        );
      }

      const text = ctx.message?.text || '';
      const args = text.split(' ').slice(1);

      // No arguments — just user ID
      if (args.length === 0) {
        return await ctx.reply(`User ID: ${userId}`);
      }

      const input = args[0].trim();

      // Reject private invite links
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

      // Handle public t.me links
      if (input.startsWith('https://t.me/')) {
        username = input
          .replace('https://t.me/', '')
          .split('/')[0];
      }

      // Ensure @ prefix
      if (!username.startsWith('@')) {
        username = `@${username}`;
      }

      const chat = await ctx.api.getChat(username);

      await ctx.reply(
        `User ID: ${userId}\nChannel ID: ${chat.id}`
      );

    } catch (error) {
      console.error(error);

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

  // Forwarded message handler — only reply with ID for text messages
  bot.on('message:forward_origin', async (ctx, next) => {
    try {
      const msg = ctx.message;
      const forwardChat = msg.forward_origin?.chat;

      if (!forwardChat) return;

      // For audio/document — pass through so the audio handler can process it
      if (msg.audio || (msg.document && msg.document.mime_type?.startsWith('audio/'))) {
        await next();
        return;
      }

      await ctx.reply(
        `Forwarded Channel ID: ${forwardChat.id}`
      );

    } catch (error) {
      console.error(error);
    }
  });
}
