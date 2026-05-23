import { Bot } from 'grammy';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

let botInstance = null;
let initPromise = null;

export function getBot() {
  if (!botInstance) {
    botInstance = new Bot(config.bot.token);
    initPromise = botInstance.init().catch(err => {
      logger.error({ err }, 'Bot init failed');
      botInstance = null;
      initPromise = null;
    });
  }
  return botInstance;
}

export async function ensureBotReady() {
  getBot();
  if (initPromise) await initPromise;
}

export async function stopBot() {
  if (botInstance) {
    await botInstance.stop();
    logger.info('Telegram bot stopped');
  }
}
