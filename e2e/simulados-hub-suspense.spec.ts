import { expect, test, type Page } from '@playwright/test';
import {
  E2E_SIMULADOS_OPEN_ID,
  E2E_SIMULADOS_OPEN_TITLE,
  E2E_SIMULADOS_P1_DELAY_MS,
  E2E_SIMULADOS_RECENT_ID,
  E2E_SIMULADOS_RECENT_TITLE,
  e2eSimuladosContinueHref,
} from '../lib/e2e/simuladosHubSeed';
import { vitrineStableLocalStorageInitScript } from './helpers/vitrineE2e';

/**
 * Runtime P0/P1 do hub Simulados (next build + next start).
 * Capturas só com E2E_DASHBOARD_BYPASS — não toca Cadernos.
 */

const FEEDBACK_BUDGET_MS = 100;
const CLS_HEADER_SHIFT_PX = 8;

function simuladosNavLocator(page: Page, viewport: 'desktop' | 'mobile') {
  if (viewport === 'mobile') {
    return page
      .getByRole('navigation', { name: 'Navegação rápida' })
      .getByRole('link', { name: 'Simulados' });
  }
  return page
    .getByRole('navigation', { name: 'Navegação principal' })
    .locator('a[href="/simulados"]');
}

async function gotoEstudarDashboard(page: Page) {
  await page.addInitScript(vitrineStableLocalStorageInitScript());
  await page.goto('/estudar', { waitUntil: 'domcontentloaded', timeout: 90_000 });
  const skipWelcome = page.getByRole('button', { name: 'Não mostrar novamente' });
  if (await skipWelcome.isVisible().catch(() => false)) {
    await skipWelcome.click();
  }
  const closeWelcome = page.getByRole('button', { name: 'Fechar introdução' });
  if (await closeWelcome.isVisible().catch(() => false)) {
    await closeWelcome.click();
  }
  await expect(page.locator('html[data-theme="editorial"]')).toBeAttached({ timeout: 15_000 });
}

async function installSimuladosChromeProbe(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __simuladosT0: number; __simuladosChrome: number };
    w.__simuladosT0 = 0;
    w.__simuladosChrome = 0;
    window.addEventListener(
      'click',
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const link = target.closest('a[href]');
        if (!link) return;
        try {
          const url = new URL(link.getAttribute('href') ?? '', window.location.origin);
          if (url.pathname !== '/simulados') return;
        } catch {
          return;
        }
        if (!w.__simuladosT0) w.__simuladosT0 = performance.now();
      },
      true,
    );
    const stampChrome = () => {
      if (w.__simuladosChrome) return;
      const heading = Array.from(document.querySelectorAll('h1, h2')).find((el) =>
        (el.textContent ?? '').trim() === 'Simulados',
      );
      const cta = Array.from(document.querySelectorAll('a')).find((el) =>
        (el.textContent ?? '').includes('Novo simulado'),
      );
      if (!heading || !cta) return;
      const headingStyle = window.getComputedStyle(heading);
      const ctaStyle = window.getComputedStyle(cta);
      if (headingStyle.visibility === 'hidden' || ctaStyle.visibility === 'hidden') return;
      w.__simuladosChrome = performance.now();
    };
    new MutationObserver(stampChrome).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  });
}

function headerBox(page: Page) {
  return page.getByRole('heading', { name: 'Simulados', level: 1 }).boundingBox();
}

test.describe('Simulados hub — P0/P1 streaming', () => {
  test.use({ serviceWorkers: 'block' });

  test('desktop: clique pinta chrome real; P0 depois P1; paridade de id/contagem', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await gotoEstudarDashboard(page);
    const navLink = simuladosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await installSimuladosChromeProbe(page);

    await navLink.click({ noWaitAfter: true, force: true });
    await expect(page.getByRole('heading', { name: 'Simulados', level: 1 })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('link', { name: /Novo simulado/i })).toBeVisible();
    const clickToChromeMs = await page.evaluate(() => {
      const w = window as unknown as { __simuladosT0: number; __simuladosChrome: number };
      if (!w.__simuladosT0 || !w.__simuladosChrome) return null;
      return Math.round(w.__simuladosChrome - w.__simuladosT0);
    });
    expect(clickToChromeMs === null || clickToChromeMs <= FEEDBACK_BUDGET_MS).toBe(true);

    await page.goto('/simulados?captura=p0-pending', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    const p0 = page.locator('[data-simulados-enrichment="pending"]');
    await expect(p0).toBeVisible({ timeout: 15_000 });
    await expect(p0.getByText(E2E_SIMULADOS_OPEN_TITLE)).toBeVisible();
    await expect(p0.getByText('10 questões')).toBeVisible();
    await expect(p0.getByRole('link', { name: /Continuar simulado/i })).toHaveAttribute(
      'href',
      e2eSimuladosContinueHref(E2E_SIMULADOS_OPEN_ID),
    );
    await expect(page.getByTestId('simulados-history-loading')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nenhum simulado ainda' })).not.toBeVisible();

    await page.goto('/simulados?captura=p0-then-p1', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    const p1 = page.locator('[data-simulados-enrichment="ready"]');
    await expect(p1).toBeVisible({ timeout: E2E_SIMULADOS_P1_DELAY_MS + 8_000 });
    await expect(p1.getByText(E2E_SIMULADOS_OPEN_TITLE)).toBeVisible();
    await expect(p1.getByText('10 questões')).toBeVisible();
    await expect(p1.getByRole('link', { name: /Continuar simulado/i })).toHaveAttribute(
      'href',
      e2eSimuladosContinueHref(E2E_SIMULADOS_OPEN_ID),
    );
    await expect(p1.getByText(E2E_SIMULADOS_RECENT_TITLE)).toBeVisible();
    await expect(p1.getByText('75% acerto')).toBeVisible();
    await expect(p1.getByRole('link', { name: /Ver resumo/i })).toHaveAttribute(
      'href',
      e2eSimuladosContinueHref(E2E_SIMULADOS_RECENT_ID),
    );

    const headerP1 = await headerBox(page);
    expect(headerP1).not.toBeNull();
  });

  test('desktop: P1 lento não mostra empty state falso; vazio real só depois', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(120_000);
    await page.goto('/simulados?captura=vazio-pending', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await expect(page.locator('[data-simulados-enrichment="pending"]')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('simulados-history-loading')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nenhum simulado ainda' })).not.toBeVisible();

    await page.goto('/simulados', { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await expect(page.getByRole('heading', { name: 'Nenhum simulado ainda' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('simulados-history-loading')).toHaveCount(0);
  });

  test('desktop: erro em P1 preserva a lista P0', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(90_000);
    await page.goto('/simulados?captura=p1-erro', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    const hub = page.locator('[data-simulados-enrichment="error"]');
    await expect(hub).toBeVisible({ timeout: 15_000 });
    await expect(hub.getByText(E2E_SIMULADOS_OPEN_TITLE)).toBeVisible();
    await expect(hub.getByText('10 questões')).toBeVisible();
    await expect(hub.getByRole('link', { name: /Continuar simulado/i })).toHaveAttribute(
      'href',
      e2eSimuladosContinueHref(E2E_SIMULADOS_OPEN_ID),
    );
    await expect(page.getByRole('heading', { name: 'Nenhum simulado ainda' })).toHaveCount(0);
    await expect(page.getByRole('alert', { name: 'Erro ao carregar simulados' })).toHaveCount(0);
  });

  test('desktop: abandono durante P0 limpa pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await gotoEstudarDashboard(page);
    const navLink = simuladosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.click({ noWaitAfter: true });
    await page
      .locator('html[data-simulados-nav-pending="true"], [data-simulados-hub="lista"]')
      .first()
      .waitFor({ timeout: 8_000 });
    await page
      .getByRole('navigation', { name: 'Navegação principal' })
      .getByRole('link', { name: 'Desempenho' })
      .click();
    await expect(page.locator('html[data-simulados-nav-pending="true"]')).toHaveCount(0, {
      timeout: 8_000,
    });
  });

  test('mobile: chrome estável, BottomNav e scroll no P0→P1', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Mobile Chrome', 'mobile só no Pixel 5');
    test.setTimeout(180_000);
    await gotoEstudarDashboard(page);
    const navLink = simuladosNavLocator(page, 'mobile');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.click({ noWaitAfter: true, force: true });
    await expect(page.getByRole('heading', { name: 'Simulados', level: 1 })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('navigation', { name: 'Navegação rápida' })).toBeVisible();

    await page.goto('/simulados?captura=p0-pending', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    const heading = page.getByRole('heading', { name: 'Simulados', level: 1 });
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-simulados-enrichment="pending"]')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('link', { name: /Novo simulado/i })).toBeVisible();
    const headerP0 = await heading.boundingBox();
    const scrollP0 = await page.evaluate(() => {
      const main = document.querySelector('[data-dashboard-main-scroll]');
      return main instanceof HTMLElement ? main.scrollTop : window.scrollY;
    });
    await expect(page.getByRole('navigation', { name: 'Navegação rápida' })).toBeVisible();

    await page.goto('/simulados?captura=p0-then-p1', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await expect(page.locator('[data-simulados-enrichment="ready"]')).toBeVisible({
      timeout: E2E_SIMULADOS_P1_DELAY_MS + 8_000,
    });
    await expect(heading).toBeVisible();
    const headerP1 = await heading.boundingBox();
    const scrollP1 = await page.evaluate(() => {
      const main = document.querySelector('[data-dashboard-main-scroll]');
      return main instanceof HTMLElement ? main.scrollTop : window.scrollY;
    });
    expect(headerP0).not.toBeNull();
    expect(headerP1).not.toBeNull();
    expect(Math.abs((headerP1?.y ?? 0) - (headerP0?.y ?? 0))).toBeLessThanOrEqual(CLS_HEADER_SHIFT_PX);
    expect(Math.abs(scrollP1 - scrollP0)).toBeLessThanOrEqual(16);
    await expect(page.getByRole('navigation', { name: 'Navegação rápida' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Novo simulado/i })).toBeVisible();
    const active = await page.evaluate(() => document.activeElement?.tagName ?? '');
    expect(active).not.toBe('');
  });
});
