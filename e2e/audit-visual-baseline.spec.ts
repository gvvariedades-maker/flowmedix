/**
 * Captura screenshots do AVANT Cyber Clinical v1 para auditoria visual.
 * Saída: docs/auditoria-visual-v2/screenshots/avant-baseline/
 *
 * Requer E2E_DASHBOARD_BYPASS (playwright.config webServer).
 * Executar: npx playwright test e2e/audit-visual-baseline.spec.ts --project=chromium --workers=1
 */
import fs from 'fs';
import path from 'path';
import { test, expect, type Page } from '@playwright/test';
import {
  E2E_ESTUDAR_BANCA,
  E2E_ESTUDAR_SLUG_1,
} from '../lib/e2e/constants';
import {
  gotoVitrineE2e,
  vitrineStableLocalStorageInitScript,
} from './helpers/vitrineE2e';

const OUT_DIR = path.join(process.cwd(), 'docs/auditoria-visual-v2/screenshots/avant-baseline');
const BANCA_QUERY = encodeURIComponent(E2E_ESTUDAR_BANCA);

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

/** Navegação tolerante a redirects/abort do Next (ex.: /conta antes do RSC estabilizar). */
async function gotoAndSnap(page: Page, url: string, filename: string, fullPage = false) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  } catch {
    await page.waitForLoadState('domcontentloaded', { timeout: 15_000 }).catch(() => {});
  }
  await snap(page, filename, fullPage);
}

async function gotoVitrine(page: Page) {
  await gotoVitrineE2e(page, `banca=${BANCA_QUERY}`);
}

async function openPlayer(page: Page) {
  await page.goto(`/estudar/${E2E_ESTUDAR_SLUG_1}?banca=${BANCA_QUERY}`, {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.getByText(/Questão E2E 1:/)).toBeVisible({ timeout: 30_000 });
}

async function showFeedback(page: Page) {
  await openPlayer(page);
  await page.getByRole('radio', { name: /Alternativa A:/i }).click();
  await page.getByRole('button', { name: 'Confirmar Resposta' }).click();
  await expect(page.getByText('Resposta Correta')).toBeVisible({ timeout: 30_000 });
}

async function showNeuroSlides(page: Page) {
  await showFeedback(page);
  await page.getByRole('button', { name: /Ativar Estudo Reverso/i }).click();
  await expect(page.getByRole('button', { name: /Fechar estudo reverso/i })).toBeVisible({
    timeout: 30_000,
  });
}

async function captureStaticPages(page: Page, prefix: 'desktop' | 'mobile') {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/O AVANT foi feito para você/i)).toBeVisible({ timeout: 30_000 });
  await snap(page, `T1-landing-${prefix}.png`, prefix === 'desktop');

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Acesse sua Área' })).toBeVisible({
    timeout: 30_000,
  });
  await snap(page, `T2-login-${prefix}.png`);

  await gotoVitrine(page);
  await snap(page, `T3-vitrine-${prefix}.png`, prefix === 'desktop');

  await gotoAndSnap(page, '/plano-diario', `T7-plano-diario-${prefix}.png`);
  await gotoAndSnap(page, '/conta/assinatura', `T8-conta-${prefix}.png`);
  await gotoAndSnap(page, '/cadernos', `T11-cadernos-${prefix}.png`);
  await gotoAndSnap(page, '/simulados', `T10-simulados-lista-${prefix}.png`);
  await gotoAndSnap(page, '/material/neuroslides', `T-material-${prefix}.png`);
  await gotoAndSnap(
    page,
    '/ajuda/estudo-reverso',
    `T-ajuda-estudo-reverso-${prefix}.png`,
    prefix === 'desktop',
  );
}

test.describe('Auditoria visual — AVANT baseline desktop', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(180_000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(vitrineStableLocalStorageInitScript());
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('páginas estáticas e dashboard', async ({ page }) => {
    await captureStaticPages(page, 'desktop');
  });

  test('T5 player + T6 feedback + T9 neuroslides', async ({ page }) => {
    await openPlayer(page);
    await snap(page, 'T5-player-desktop.png');

    await page.getByRole('radio', { name: /Alternativa A:/i }).click();
    await page.getByRole('button', { name: 'Confirmar Resposta' }).click();
    await expect(page.getByText('Resposta Correta')).toBeVisible({ timeout: 30_000 });
    await snap(page, 'T6-feedback-desktop.png');

    await page.getByRole('button', { name: /Ativar Estudo Reverso/i }).click();
    await expect(page.getByRole('button', { name: /Fechar estudo reverso/i })).toBeVisible({
      timeout: 30_000,
    });
    await snap(page, 'T9-neuroslides-desktop.png');
  });

  test('T10 simulado setup (novo)', async ({ page }) => {
    // Runner exige sessão E2E in-memory (instável entre API e RSC no dev).
    // Setup em /simulados/novo representa o fluxo visual de criação do simulado.
    await page.goto('/simulados/novo', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Novo simulado' })).toBeVisible({
      timeout: 30_000,
    });
    await snap(page, 'T10-simulado-setup-desktop.png');
  });
});

test.describe('Auditoria visual — AVANT baseline mobile', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(180_000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(vitrineStableLocalStorageInitScript());
    await page.setViewportSize({ width: 375, height: 812 });
  });

  test('páginas-chave mobile', async ({ page }) => {
    await captureStaticPages(page, 'mobile');
  });

  test('T5 player + T6 feedback + T9 neuroslides mobile', async ({ page }) => {
    await openPlayer(page);
    await snap(page, 'T5-player-mobile.png');

    await page.getByRole('radio', { name: /Alternativa A:/i }).click();
    await page.getByRole('button', { name: 'Confirmar Resposta' }).click();
    await expect(page.getByText('Resposta Correta')).toBeVisible({ timeout: 30_000 });
    await snap(page, 'T6-feedback-mobile.png');

    await page.getByRole('button', { name: /Ativar Estudo Reverso/i }).click();
    await expect(page.getByRole('button', { name: /Fechar estudo reverso/i })).toBeVisible({
      timeout: 30_000,
    });
    await snap(page, 'T9-neuroslides-mobile.png');
  });

  test('T10 simulado setup (novo) mobile', async ({ page }) => {
    await page.goto('/simulados/novo', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Novo simulado' })).toBeVisible({
      timeout: 30_000,
    });
    await snap(page, 'T10-simulado-setup-mobile.png');
  });
});
