import { test, expect } from '@playwright/test';
import { E2E_ESTUDAR_BANCA } from '../lib/e2e/constants';
import {
  gotoVitrineE2e,
  waitVitrineListReady,
  VITRINE_E2E_STORAGE_KEYS,
  vitrineStableLocalStorageInitScript,
} from './helpers/vitrineE2e';

const BANCA_QUERY = encodeURIComponent(E2E_ESTUDAR_BANCA);

/**
 * Vitrine premium (PR5): resume, quick filters, stats count-up.
 * Rodar: npx playwright test e2e/vitrine-premium.spec.ts --project=chromium
 */
test.describe('Vitrine premium — PR5', () => {
  test.describe.configure({ mode: 'serial', timeout: 120_000 });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(vitrineStableLocalStorageInitScript());
  });

  test('V1 — resume card, quick filters e stats strip visíveis', async ({ page }) => {
    await gotoVitrineE2e(page, '');

    await expect(page.getByTestId('vitrine-resume-card')).toBeVisible();
    await expect(page.getByTestId('vitrine-quick-filters')).toBeVisible();
    await expect(page.getByTestId('vitrine-catalog-stats')).toBeVisible();
    await expect(page.getByTestId('vitrine-status-all')).toHaveAttribute('aria-selected', 'true');
  });

  test('V2 — filtro rápido pendentes atualiza URL', async ({ page }) => {
    await gotoVitrineE2e(page, `banca=${BANCA_QUERY}`);

    await page.getByTestId('vitrine-status-pending').click();
    await expect(page).toHaveURL(/status=pending/);
  });

  test('V3 — count-up na 1ª visita marca statsSeen', async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.removeItem('avant.vitrine.statsSeen');
        localStorage.setItem('avant.estudoReverso.welcomeShown', 'true');
      } catch {
        /* ignore */
      }
    });

    await page.goto('/estudar', { waitUntil: 'domcontentloaded' });
    await waitVitrineListReady(page);
    await expect(page.getByTestId('vitrine-catalog-stats')).toBeVisible({ timeout: 15_000 });

    await expect(page.getByTestId('vitrine-catalog-stats')).toHaveAttribute(
      'data-vitrine-stats-ready',
      'true',
      { timeout: 5_000 },
    );

    const seen = await page.evaluate(
      (key) => localStorage.getItem(key),
      VITRINE_E2E_STORAGE_KEYS.statsSeen,
    );
    expect(seen).toBe('1');
  });
});
