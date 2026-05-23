import { AppError } from '../../utils/errors.js';
import { ZodError } from 'zod';
import { logger } from '../../utils/logger.js';

export function errorHandler(error, request, reply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: error.errors,
    });
  }

  if (error instanceof AppError) {
    return reply.status(error.status).send({
      error: error.code,
      message: error.message,
    });
  }

  logger.error({ err: error }, 'Unhandled API error');
  return reply.status(500).send({
    error: 'INTERNAL_ERROR',
    message: 'Internal server error',
  });
}
