import { expect, type Page } from '@playwright/test';
import { E2E_ESTUDAR_BANCA } from '../../lib/e2e/constants';

export const VITRINE_E2E_STORAGE_KEYS = {
  statsSeen: 'avant.vitrine.statsSeen',
  view: 'avant.vitrine.view',
  welcomeShown: 'avant.estudoReverso.welcomeShown',
} as const;

/** Estado estável da vitrine premium (sem welcome modal nem count-up em andamento). */
export function vitrineStableLocalStorageInitScript() {
  return () => {
    try {
      localStorage.setItem('avant.estudoReverso.welcomeShown', 'true');
      localStorage.setItem('avant.vitrine.statsSeen', '1');
      localStorage.setItem('avant.vitrine.view', 'grid');
    } catch {
      /* storage indisponível */
    }
  };
}

export async function waitVitrineListReady(page: Page) {
  await expect(page.locator('[data-vitrine-slot-ready="true"]')).toBeAttached({ timeout: 30_000 });
  await expect(page.locator('[data-vitrine-list-ready="true"]')).toBeAttached({ timeout: 30_000 });
}

export async function waitVitrineCatalogStatsReady(page: Page) {
  await expect(page.getByTestId('vitrine-catalog-stats')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('vitrine-catalog-stats')).toHaveAttribute(
    'data-vitrine-stats-ready',
    'true',
    { timeout: 10_000 },
  );
}

export async function gotoVitrineE2e(page: Page, query?: string) {
  const path =
    query === undefined
      ? `/estudar?banca=${encodeURIComponent(E2E_ESTUDAR_BANCA)}`
      : query
        ? `/estudar?${query}`
        : '/estudar';
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await waitVitrineListReady(page);
  await waitVitrineCatalogStatsReady(page);
}

export async function dismissWelcomeIfVisible(page: Page) {
  const skip = page.getByRole('button', { name: 'Não mostrar novamente' });
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
    return;
  }
  const close = page.getByRole('button', { name: 'Fechar introdução' });
  if (await close.isVisible().catch(() => false)) {
    await close.click();
  }
}
