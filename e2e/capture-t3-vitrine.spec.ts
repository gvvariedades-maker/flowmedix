/**
 * Captura apenas T3 vitrine (desktop + mobile) — editorial v2.
 * Rodar: npm run capture:t3-vitrine
 */
import fs from 'fs';
import path from 'path';
import { test, type Page } from '@playwright/test';
import { gotoVitrineE2e, vitrineStableLocalStorageInitScript } from './helpers/vitrineE2e';

const OUT_DIR = path.join(
  process.cwd(),
  'docs/auditoria-visual-v2/screenshots/avant-editorial-v2',
);

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function snap(page: Page, filename: string, fullPage = false) {
  ensureOutDir();
  await page.screenshot({
    path: path.join(OUT_DIR, filename),
    fullPage,
  });
}

test.describe('Capture T3 vitrine', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(vitrineStableLocalStorageInitScript());
  });

  test('T3-vitrine-desktop.png', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoVitrineE2e(page, '');
    await snap(page, 'T3-vitrine-desktop.png', true);
  });

  test('T3-vitrine-mobile.png', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoVitrineE2e(page, '');
    await snap(page, 'T3-vitrine-mobile.png');
  });
});
