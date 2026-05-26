import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      API_AUTH_TOKEN: 'test-token-123',
      BOT_TOKEN: 'test-bot-token',
      STORAGE_DIR: './data',
    },
  },
});
