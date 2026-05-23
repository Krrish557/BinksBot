import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  BOT_TOKEN: z.string().min(1, 'BOT_TOKEN is required'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  STORAGE_DIR: z.string().default('./data'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const messages = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${messages}`);
  }
  return result.data;
}

const env = validateEnv();

export const config = {
  bot: {
    token: env.BOT_TOKEN,
  },
  server: {
    port: env.PORT,
    host: env.HOST,
  },
  storage: {
    dir: env.STORAGE_DIR,
  },
  env: env.NODE_ENV,
  log: {
    level: env.LOG_LEVEL,
  },
};
