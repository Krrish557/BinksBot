import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { createBot } from './bot/setup/index.js';
import { registerRoutes } from './api/routes/index.js';
import { errorHandler } from './api/middleware/errorHandler.js';
import { loadMappings } from './storage/mappings/index.js';
import { loadIndexes } from './storage/indexes/index.js';

async function main() {
  logger.info({ env: config.env }, 'Starting Binks Telegram Backend...');

  await loadMappings();
  await loadIndexes();
  logger.info('Storage initialized');

  const app = Fastify({
    logger: false,
    bodyLimit: 1048576,
    requestTimeout: 30000,
  });

  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Range', 'Accept-Ranges'],
    exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'X-File-Size'],
  });

  await app.register(multipart, {
    limits: {
      fileSize: 52428800,
    },
  });

  app.setErrorHandler(errorHandler);

  app.addHook('onRequest', async (request) => {
    request.log = logger.child({ reqId: request.id });
  });

  await registerRoutes(app);

  await app.listen({ port: config.server.port, host: config.server.host });
  logger.info({ port: config.server.port, host: config.server.host }, 'HTTP server started');

  const bot = createBot();
  bot.start({
    onStart: () => {
      logger.info('Telegram bot started (polling)');
    },
  });

  const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    await bot.stop();
    await app.close();
    logger.info('Shutdown complete');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start application');
  process.exit(1);
});
