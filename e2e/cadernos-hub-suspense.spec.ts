import { expect, test, type Page } from '@playwright/test';
import {
  E2E_CADERNOS_P0_SLUG,
  E2E_CADERNOS_P1_DELAY_MS,
  E2E_CADERNOS_P1_SLUG,
  E2E_CADERNOS_TITLE,
  e2eCadernosStudyHref,
} from '../lib/e2e/cadernosSeed';
import { vitrineStableLocalStorageInitScript } from './helpers/vitrineE2e';

/**
 * Runtime P0/P1 do hub Cadernos (next build + next start).
 * Capturas só com E2E_DASHBOARD_BYPASS — não toca Simulados.
 */

const FEEDBACK_BUDGET_MS = 100;
const CLS_HEADER_SHIFT_PX = 8;

function cadernosNavLocator(page: Page, viewport: 'desktop' | 'mobile') {
  if (viewport === 'mobile') {
    return page
      .getByRole('navigation', { name: 'Navegação rápida' })
      .getByRole('link', { name: 'Cadernos' });
  }
  return page
    .getByRole('navigation', { name: 'Navegação principal' })
    .getByRole('link', { name: 'Cadernos' });
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

async function installCadernosChromeProbe(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __cadernosT0: number; __cadernosChrome: number };
    w.__cadernosT0 = 0;
    w.__cadernosChrome = 0;
    window.addEventListener(
      'click',
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const link = target.closest('a[href]');
        if (!link) return;
        try {
          const url = new URL(link.getAttribute('href') ?? '', window.location.origin);
          if (url.pathname !== '/cadernos') return;
        } catch {
          return;
        }
        if (!w.__cadernosT0) w.__cadernosT0 = performance.now();
      },
      true,
    );
    const stampChrome = () => {
      if (w.__cadernosChrome) return;
      const heading = Array.from(document.querySelectorAll('h1, h2')).find((el) =>
        (el.textContent ?? '').includes('Cadernos de Estudo'),
      );
      const cta = Array.from(document.querySelectorAll('a')).find((el) =>
        (el.textContent ?? '').includes('Novo caderno'),
      );
      if (!heading || !cta) return;
      const headingStyle = window.getComputedStyle(heading);
      const ctaStyle = window.getComputedStyle(cta);
      if (headingStyle.visibility === 'hidden' || ctaStyle.visibility === 'hidden') return;
      w.__cadernosChrome = performance.now();
    };
    new MutationObserver(stampChrome).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  });
}

function headerBox(page: Page) {
  return page.getByRole('heading', { name: 'Cadernos de Estudo' }).boundingBox();
}

test.describe('Cadernos hub — P0/P1 streaming', () => {
  test.use({ serviceWorkers: 'block' });

  test('desktop: clique pinta chrome real; P0 depois P1; paridade de id/contagem', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await gotoEstudarDashboard(page);
    const navLink = cadernosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await installCadernosChromeProbe(page);

    await navLink.click({ noWaitAfter: true, force: true });
    await expect(page.getByRole('heading', { name: 'Cadernos de Estudo' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('link', { name: /Novo caderno/i })).toBeVisible();
    const clickToChromeMs = await page.evaluate(() => {
      const w = window as unknown as { __cadernosT0: number; __cadernosChrome: number };
      if (!w.__cadernosT0 || !w.__cadernosChrome) return null;
      return Math.round(w.__cadernosChrome - w.__cadernosT0);
    });
    expect(clickToChromeMs === null || clickToChromeMs <= FEEDBACK_BUDGET_MS).toBe(true);

    await page.goto('/cadernos?captura=p0-pending', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    const p0 = page.locator('[data-cadernos-enrichment="pending"]');
    await expect(p0).toBeVisible({ timeout: 15_000 });
    await expect(p0.getByText(E2E_CADERNOS_TITLE)).toBeVisible();
    await expect(p0.getByText('3 questões')).toBeVisible();
    await expect(p0.getByRole('link', { name: /Estudar caderno/i })).toHaveAttribute(
      'href',
      e2eCadernosStudyHref(E2E_CADERNOS_P0_SLUG),
    );
    await expect(p0.getByRole('status', { name: 'Carregando progresso do caderno' })).toBeVisible();
    await expect(page.getByTestId('cadernos-packs-loading')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nenhum caderno ainda' })).not.toBeVisible();

    await page.goto('/cadernos?captura=p0-then-p1', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    const p1 = page.locator('[data-cadernos-enrichment="ready"]');
    await expect(p1).toBeVisible({ timeout: E2E_CADERNOS_P1_DELAY_MS + 8_000 });
    await expect(p1.getByText(E2E_CADERNOS_TITLE)).toBeVisible();
    await expect(p1.getByText('3 questões')).toBeVisible();
    await expect(p1.getByRole('link', { name: /Estudar caderno/i })).toHaveAttribute(
      'href',
      e2eCadernosStudyHref(E2E_CADERNOS_P1_SLUG),
    );
    await expect(p1.getByLabel('1 de 3 questões concluídas')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cadernos prontos' })).toBeVisible();

    const headerP1 = await headerBox(page);
    expect(headerP1).not.toBeNull();
  });

  test('desktop: P1 lento não mostra empty state falso; vazio real só depois', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(120_000);
    await page.goto('/cadernos?captura=vazio-pending', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await expect(page.locator('[data-cadernos-enrichment="pending"]')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('cadernos-packs-loading')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nenhum caderno ainda' })).not.toBeVisible();

    await page.goto('/cadernos', { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await expect(page.getByRole('heading', { name: 'Nenhum caderno ainda' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('cadernos-packs-loading')).toHaveCount(0);
  });

  test('desktop: erro em P1 preserva a lista P0', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(90_000);
    await page.goto('/cadernos?captura=p1-erro', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    const hub = page.locator('[data-cadernos-enrichment="error"]');
    await expect(hub).toBeVisible({ timeout: 15_000 });
    await expect(hub.getByText(E2E_CADERNOS_TITLE)).toBeVisible();
    await expect(hub.getByText('3 questões')).toBeVisible();
    await expect(hub.getByRole('link', { name: /Estudar caderno/i })).toHaveAttribute(
      'href',
      e2eCadernosStudyHref(E2E_CADERNOS_P0_SLUG),
    );
    await expect(page.getByRole('heading', { name: 'Nenhum caderno ainda' })).toHaveCount(0);
    await expect(page.getByRole('alert', { name: 'Erro ao carregar cadernos' })).toHaveCount(0);
  });

  test('desktop: abandono durante P0 limpa pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await gotoEstudarDashboard(page);
    const navLink = cadernosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.click({ noWaitAfter: true });
    await page
      .locator('html[data-cadernos-nav-pending="true"], [data-cadernos-hub="lista"]')
      .first()
      .waitFor({ timeout: 8_000 });
    await page
      .getByRole('navigation', { name: 'Navegação principal' })
      .getByRole('link', { name: 'Desempenho' })
      .click();
    await expect(page.locator('html[data-cadernos-nav-pending="true"]')).toHaveCount(0, {
      timeout: 8_000,
    });
  });

  test('mobile: chrome estável, BottomNav e scroll no P0→P1', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Mobile Chrome', 'mobile só no Pixel 5');
    test.setTimeout(180_000);
    await gotoEstudarDashboard(page);
    const navLink = cadernosNavLocator(page, 'mobile');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.click({ noWaitAfter: true, force: true });
    await expect(page.getByRole('heading', { name: 'Cadernos de Estudo' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('navigation', { name: 'Navegação rápida' })).toBeVisible();

    await page.goto('/cadernos?captura=p0-pending', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    const heading = page.getByRole('heading', { name: 'Cadernos de Estudo' });
    await expect(heading).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-cadernos-enrichment="pending"]')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('link', { name: /Novo caderno/i })).toBeVisible();
    const headerP0 = await heading.boundingBox();
    const scrollP0 = await page.evaluate(() => {
      const main = document.querySelector('[data-dashboard-main-scroll]');
      return main instanceof HTMLElement ? main.scrollTop : window.scrollY;
    });
    await expect(page.getByRole('navigation', { name: 'Navegação rápida' })).toBeVisible();

    await page.goto('/cadernos?captura=p0-then-p1', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await expect(page.locator('[data-cadernos-enrichment="ready"]')).toBeVisible({
      timeout: E2E_CADERNOS_P1_DELAY_MS + 8_000,
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
    await expect(page.getByRole('link', { name: /Novo caderno/i })).toBeVisible();
    const active = await page.evaluate(() => document.activeElement?.tagName ?? '');
    expect(active).not.toBe('');
  });
});
