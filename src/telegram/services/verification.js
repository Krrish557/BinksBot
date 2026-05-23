import { getBot } from './client.js';
import { markVerified } from '../../storage/mappings/index.js';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../utils/errors.js';

const codes = new Map();
const knownUsers = new Set();

export function markUserStartedBot(telegramUserId) {
  knownUsers.add(telegramUserId);
}

function generateCode(telegramUserId) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  codes.set(telegramUserId, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
  return code;
}

export async function requestVerification(telegramUserId) {
  const bot = getBot();

  if (!knownUsers.has(telegramUserId)) {
    throw new AppError(
      'You must send /start to the bot before requesting verification.',
      'USER_NOT_STARTED',
      400
    );
  }

  const code = generateCode(telegramUserId);

  try {
    await bot.api.sendMessage(
      telegramUserId,
      `🔐 Your Binks verification code:\n\n${code}\n\nThis code expires in 10 minutes.`
    );
    logger.info({ telegramUserId }, 'Verification code sent');
    return { success: true, message: 'Verification code sent to your Telegram DM' };
  } catch (err) {
    codes.delete(telegramUserId);
    logger.error({ err, telegramUserId }, 'Failed to send verification code');
    throw new AppError(
      'Failed to send verification code. Ensure you have messaged the bot first.',
      'SEND_FAILED',
      500
    );
  }
}

export async function confirmVerification(telegramUserId, code) {
  const stored = codes.get(telegramUserId);
  if (!stored) {
    throw new AppError('No verification code was requested', 'VERIFICATION_FAILED', 400);
  }
  if (Date.now() > stored.expiresAt) {
    codes.delete(telegramUserId);
    throw new AppError('Verification code has expired', 'VERIFICATION_FAILED', 400);
  }
  if (stored.code !== code) {
    throw new AppError('Invalid verification code', 'VERIFICATION_FAILED', 400);
  }

  codes.delete(telegramUserId);
  await markVerified(telegramUserId);
  logger.info({ telegramUserId }, 'User verified successfully');
  return { success: true, message: 'Verification successful' };
}
