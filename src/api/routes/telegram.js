import {
  requestVerificationHandler,
  confirmVerificationHandler,
  validateChannelHandler,
} from '../controllers/telegram.js';

export default async function telegramRoutes(app) {
  app.post('/telegram/request-verification', requestVerificationHandler);
  app.post('/telegram/verify-code', confirmVerificationHandler);
  app.post('/telegram/validate', validateChannelHandler);
}
