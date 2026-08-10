/**
 * Capturas **after** — Editorial Premium Dashboard (prompt §22).
 * Saída: artifacts/editorial-premium-dashboard-after/
 *
 * Cenários:
 * 1–2 estudar (com/sem query disciplina) · 5 empty filter · 6 progresso · 7 simulados
 * 8 mobile 390×844 · 9 desktop 1366×768 · 10 desktop 1440×900
 * (3–4 progresso parcial/concluído dependem de dados reais — cobertos na vitrine enfermagem)
 *
 * Rodar:
 *   npx playwright test e2e/capture-editorial-premium-after.spec.ts --project=chromium --workers=1
 */
import fs from 'fs';
import path from 'path';
import { test, expect, type Page } from '@playwright/test';
import {
  gotoVitrineE2e,
  vitrineStableLocalStorageInitScript,
} from './helpers/vitrineE2e';

const OUT_DIR = path.join(
  process.cwd(),
  'artifacts/editorial-premium-dashboard-after',
);

const VIEWPORTS = [
  { id: '390x844', width: 390, height: 844 },
  { id: '1366x768', width: 1366, height: 768 },
  { id: '1440x900', width: 1440, height: 900 },
] as const;

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function snap(page: Page, filename: string) {
  ensureOutDir();
  await page.screenshot({
    path: path.join(OUT_DIR, filename),
    fullPage: false,
  });
}

async function gotoAndSettle(page: Page, url: string) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  } catch {
    /* captura best-effort */
  }
  await page.locator('body').waitFor({ state: 'attached', timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(1_200);
}

test.describe('Capture after — Editorial Premium Dashboard', () => {
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(vitrineStableLocalStorageInitScript());
  });

  for (const vp of VIEWPORTS) {
    test(`estudar enfermagem ${vp.id}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoVitrineE2e(page, 'disciplina=enfermagem');
      await expect(page.locator('[data-vitrine-list-ready="true"]')).toBeAttached({
        timeout: 30_000,
      });
      await snap(page, `estudar-enfermagem-${vp.id}.png`);
    });
  }

  test('estudar hub sem disciplina 1366x768 (sem retomada típica E2E)', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await gotoVitrineE2e(page, '');
    await snap(page, 'estudar-hub-1366x768.png');
  });

  test('filtro sem resultados 1366x768', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await gotoVitrineE2e(
      page,
      `disciplina=enfermagem&banca=${encodeURIComponent('__e2e_empty_filter__')}`,
    );
    await snap(page, 'estudar-empty-filter-1366x768.png');
  });

  for (const vp of [
    { id: '390x844', width: 390, height: 844 },
    { id: '1366x768', width: 1366, height: 768 },
  ] as const) {
    test(`progresso ${vp.id}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoAndSettle(page, '/progresso');
      await snap(page, `progresso-${vp.id}.png`);
    });

    test(`desempenho simulados ${vp.id}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoAndSettle(page, '/desempenho/simulados');
      await snap(page, `desempenho-simulados-${vp.id}.png`);
    });
  }
});
