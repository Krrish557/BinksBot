import { validateChannelAccess } from '../services/validator.js';
import { findByUserId, upsertMapping } from '../../storage/mappings/index.js';
import { logger } from '../../utils/logger.js';
import { ValidationError } from '../../utils/errors.js';

export async function connectChannel(telegramUserId, channelId) {
  const user = await findByUserId(telegramUserId);
  if (!user || !user.verified) {
    throw new ValidationError(
      'User is not verified. Complete verification before connecting a channel.'
    );
  }

  const { valid, errors } = await validateChannelAccess(channelId);
  if (!valid) {
    throw new ValidationError(errors.join(' '));
  }

  await upsertMapping(telegramUserId, channelId);
  logger.info({ telegramUserId, channelId }, 'Channel connected successfully');

  return { success: true, channelId };
}
