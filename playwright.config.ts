import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/liah',
  testMatch: /.*\.e2e\.spec\.ts/,
  timeout: 30_000,
  webServer: {
    command: 'bun run dev -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173/',
    reuseExistingServer: true,
    timeout: 60_000
  },
  use: {
    baseURL: 'http://127.0.0.1:5173/',
    headless: true,
    trace: 'on-first-retry'
  }
});
