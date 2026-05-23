import { z } from 'zod';
import { requestVerification, confirmVerification } from '../../telegram/services/verification.js';
import { connectChannel } from '../../telegram/channels/index.js';

const verificationRequestSchema = z.object({
  telegramUserId: z.string().min(1, 'telegramUserId is required'),
});

const verificationConfirmSchema = z.object({
  telegramUserId: z.string().min(1, 'telegramUserId is required'),
  code: z.string().length(6, 'Code must be exactly 6 digits'),
});

const validateChannelSchema = z.object({
  telegramUserId: z.string().min(1, 'telegramUserId is required'),
  channelId: z.string().min(1, 'channelId is required'),
});

export async function requestVerificationHandler(request, reply) {
  const { telegramUserId } = verificationRequestSchema.parse(request.body);
  return requestVerification(telegramUserId);
}

export async function confirmVerificationHandler(request, reply) {
  const { telegramUserId, code } = verificationConfirmSchema.parse(request.body);
  return confirmVerification(telegramUserId, code);
}

export async function validateChannelHandler(request, reply) {
  const { telegramUserId, channelId } = validateChannelSchema.parse(request.body);
  return connectChannel(telegramUserId, channelId);
}
