import { Bot } from 'grammy';
import { config } from '../../config/index.js';
import { getBot } from '../../telegram/services/client.js';
import { registerPingCommand } from '../commands/ping.js';
import { registerIdCommand } from '../commands/id.js';
import { registerCommandHandler } from '../handlers/command.js';
import { registerAudioHandler } from '../handlers/audio.js';
import { registerChannelPostHandler } from '../handlers/channelPost.js';
import { registerMessageHandler } from '../handlers/message.js';
import { markUserStartedBot } from '../../telegram/services/verification.js';
import { logger } from '../../utils/logger.js';

export function createBot() {
  const bot = getBot();

  bot.use(async (ctx, next) => {
    if (ctx.from?.id) {
      markUserStartedBot(String(ctx.from.id));
    }
    await next();
  });

  registerPingCommand(bot);
  registerIdCommand(bot);
  registerCommandHandler(bot);
  registerAudioHandler(bot);
  registerChannelPostHandler(bot);
  registerMessageHandler(bot);

  bot.catch((err) => {
    logger.error({ err: err.error }, 'Unhandled bot error');
  });

  return bot;
}
