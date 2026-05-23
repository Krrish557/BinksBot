export function registerMessageHandler(bot) {
  bot.on('msg:text', async (ctx) => {
    if (ctx.msg.text.startsWith('/')) return;
    await ctx.reply('Send me an audio file to add to your Binks library! 🎵');
  });
}
