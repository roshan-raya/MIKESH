import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir:'tests/e2e',
  use:{baseURL:'http://127.0.0.1:3100',browserName:'chromium'},
  webServer:{command:`npm run ${process.env.E2E_USE_PRODUCTION?'start':'dev'} -- --hostname 127.0.0.1 --port 3100`,url:'http://127.0.0.1:3100/login',reuseExistingServer:!process.env.CI},
});
