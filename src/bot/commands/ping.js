export function registerPingCommand(bot) {
  bot.command('ping', async (ctx) => {
    await ctx.reply('pong');
  });
}
