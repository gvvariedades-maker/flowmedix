import { defineConfig, devices } from '@playwright/test';

const ci = !!process.env.CI;

const projects = ci
  ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
  : [
      { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
      { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
      { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
    ];

/**
 * CI: servidor via `next build` + `next start` (mais estável que dev).
 * Local: `next dev` com reuse.
 */
export default defineConfig({
  testDir: './e2e',

  timeout: 60 * 1000,

  expect: {
    timeout: 5000,
  },

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: ci
    ? [['html'], ['list'], ['github']]
    : [['html'], ['list']],

  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retry-with-video',
    trace: 'retry-with-trace',
  },

  projects,

  webServer: ci
    ? {
        command: 'npm run build && npm run start',
        url: 'http://localhost:3000',
        reuseExistingServer: false,
        timeout: 300_000,
        env: {
          ...process.env,
          E2E_ADMIN_BYPASS: 'true',
          E2E_DASHBOARD_BYPASS: 'true',
          NEXT_PUBLIC_E2E_DASHBOARD_BYPASS: 'true',
        },
      }
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        // false: garante E2E_*_BYPASS no processo do Next (reuse sem env quebra /simulados)
        reuseExistingServer: false,
        timeout: 180_000,
        env: {
          ...process.env,
          E2E_ADMIN_BYPASS: 'true',
          E2E_DASHBOARD_BYPASS: 'true',
          NEXT_PUBLIC_E2E_DASHBOARD_BYPASS: 'true',
        },
      },
});
