import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * 
 * Execute: npx playwright test
 * UI Mode: npx playwright test --ui
 */
export default defineConfig({
  testDir: './e2e',
  
  // Timeout para cada teste
  timeout: 30 * 1000,
  
  // Timeout para expect
  expect: {
    timeout: 5000,
  },
  
  // Executa testes em paralelo
  fullyParallel: true,
  
  // Falha no CI se você deixar test.only
  forbidOnly: !!process.env.CI,
  
  // Retry apenas no CI
  retries: process.env.CI ? 2 : 0,
  
  // Workers no CI, todos localmente
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html'],
    ['list'],
    process.env.CI ? ['github'] : ['list'],
  ],
  
  // Compartilha configuração entre projetos
  use: {
    // URL base para testes
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    
    // Screenshot apenas em falhas
    screenshot: 'only-on-failure',
    
    // Video apenas em retry
    video: 'retry-with-video',
    
    // Trace apenas em retry
    trace: 'retry-with-trace',
  },

  // Configuração de projetos (browsers)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Servidor de desenvolvimento
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
