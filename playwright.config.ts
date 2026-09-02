import { defineConfig, devices } from '@playwright/test';
import { getVercelProtectionHeaders } from './lib/perf/vercelProtection';
import { assertE2eTargetSafe } from './lib/e2e/targetSafety';

const rawBaseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const allowStaging = process.env.E2E_STAGING_OPT_IN === 'true';

// Fail-closed guard: bloqueia execução em produção e targets remotos não autorizados
const { baseUrl: validatedBaseUrl } = assertE2eTargetSafe(rawBaseUrl, { allowStaging });

const ci = !!process.env.CI;
/**
 * Servidor de produção (build + start) também localmente via PLAYWRIGHT_PROD=true.
 * Elimina a recompilação lazy do `next dev`, causa-raiz de timeouts/flakiness no E2E mobile.
 */
const prodServer = ci || process.env.PLAYWRIGHT_PROD === 'true';
const vercelProtectionHeaders = getVercelProtectionHeaders();
/** Dev já rodando com E2E_*_BYPASS (ex.: `npm run dev` + este env). */
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === 'true';

/**
 * Segredo do webhook de cache (/api/cache/revalidate).
 * O Next carrega `.env.local` no servidor, mas o processo do Playwright não — sem alinhar
 * o valor entre os dois, o teste manda um secret diferente e recebe 401. Fixamos um valor
 * determinístico no `process.env` (herdado pelo webServer) só quando nenhum já existe.
 * O Next não sobrescreve env já definido a partir do `.env.local`, então ambos ficam iguais.
 */
const E2E_CACHE_WEBHOOK_SECRET = 'e2e-cache-revalidate-secret';
if (!process.env.SUPABASE_WEBHOOK_SECRET?.trim() && !process.env.WEBHOOK_SECRET?.trim()) {
  process.env.SUPABASE_WEBHOOK_SECRET = E2E_CACHE_WEBHOOK_SECRET;
}

const projects = ci
  ? [
      { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      // Mobile no CI: trava regressoes de layout/safe-area no fluxo do aluno.
      { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    ]
  : [
      { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
      { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
      { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
    ];

/**
 * CI (ou PLAYWRIGHT_PROD=true): servidor via `next build` + `next start` (mais estável).
 * Local padrão: `next dev`.
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
    baseURL: validatedBaseUrl,
    ...(Object.keys(vercelProtectionHeaders).length > 0
      ? { extraHTTPHeaders: vercelProtectionHeaders }
      : {}),
    screenshot: 'only-on-failure',
    video: 'retry-with-video',
    trace: 'retry-with-trace',
  },

  projects,

  webServer: skipWebServer
    ? undefined
    : prodServer
    ? {
        command: 'npm run build && npm run start',
        url: 'http://localhost:3000',
        reuseExistingServer: false,
        timeout: 300_000,
        env: {
          ...process.env,
          // `isE2eBypassEnabled` exige CI=true para engatar em produção (NODE_ENV=production).
          // Sem isto, o servidor de prod redireciona tudo para /login. Espelha o ambiente do CI.
          CI: 'true',
          E2E_ADMIN_BYPASS: 'true',
          E2E_DASHBOARD_BYPASS: 'true',
          NEXT_PUBLIC_E2E_DASHBOARD_BYPASS: 'true',
        },
      }
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        // true local: evita "port already in use" quando dev já está rodando.
        // Use PLAYWRIGHT_SKIP_WEBSERVER=true se o dev local não tiver E2E_*_BYPASS.
        reuseExistingServer: !ci,
        timeout: 180_000,
        env: {
          ...process.env,
          E2E_ADMIN_BYPASS: 'true',
          E2E_DASHBOARD_BYPASS: 'true',
          NEXT_PUBLIC_E2E_DASHBOARD_BYPASS: 'true',
        },
      },
});
