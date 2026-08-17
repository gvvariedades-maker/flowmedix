import { expect, test, type Page, type Request } from '@playwright/test';
import { CADERNOS_NAV_PENDING_TIMEOUT_MS } from '../lib/cadernos/cadernosPendingMark';
import { HUB_NAV_PENDING_PHASE_ATTR } from '../lib/layout/hubNavPending';
import { vitrineStableLocalStorageInitScript } from './helpers/vitrineE2e';

/**
 * Onda 1 Cadernos — feedback `/estudar` → `/cadernos`.
 * Next 16.2 segura a tela atual até o RSC; o shell mostra skeleton no click.
 * Após 8 s o pending vira slow-loading e não some até ready, erro ou abandono.
 */

const RSC_DELAY_MS = 800;
const FEEDBACK_BUDGET_MS = 100;
/** Atraso RSC > limiar de 8s, para o overlay virar slow-loading sem hang infinito. */
const RSC_BEYOND_SLOW_MS = CADERNOS_NAV_PENDING_TIMEOUT_MS + 15_000;
/** JS não garante os 8s exatos no CI; margem só na asserção. */
const SLOW_LOADING_ASSERT_TIMEOUT_MS = CADERNOS_NAV_PENDING_TIMEOUT_MS + 10_000;

function isCadernosRsc(request: Request): boolean {
  const url = request.url();
  if (!url.includes('/cadernos')) return false;
  const headers = request.headers();
  return (
    url.includes('_rsc') ||
    headers['rsc'] === '1' ||
    headers['next-router-prefetch'] === '1' ||
    Boolean(headers['next-router-state-tree'])
  );
}

/** Flight cliente para `/cadernos` (RSC, fetch/xhr, Next-Url). Document fica de fora. */
function isCadernosClientFlight(request: Request): boolean {
  if (request.resourceType() === 'document') return false;
  const headers = request.headers();
  let pathname = '';
  try {
    pathname = new URL(request.url()).pathname;
  } catch {
    return false;
  }
  const nextUrl = (headers['next-url'] ?? '').split('?')[0];
  const targetsCadernos =
    pathname === '/cadernos' ||
    pathname.startsWith('/cadernos/') ||
    nextUrl === '/cadernos' ||
    nextUrl.startsWith('/cadernos/');
  if (!targetsCadernos) return false;
  if (isCadernosRsc(request)) return true;
  const accept = headers['accept'] ?? '';
  if (accept.includes('text/x-component')) return true;
  return request.resourceType() === 'fetch' || request.resourceType() === 'xhr';
}

async function interceptCadernosRsc(page: Page) {
  await page.route('**/cadernos**', async (route) => {
    const request = route.request();
    if (request.resourceType() === 'document') {
      await route.continue();
      return;
    }
    if (!isCadernosRsc(request) && request.resourceType() !== 'fetch') {
      await route.continue();
      return;
    }
    await new Promise((r) => setTimeout(r, RSC_DELAY_MS));
    try {
      await route.continue();
    } catch {
      /* nav superseded */
    }
  });
}

async function hangCadernosRsc(page: Page) {
  await page.route('**/*', async (route) => {
    const request = route.request();
    if (request.resourceType() === 'document' || !isCadernosClientFlight(request)) {
      await route.continue();
      return;
    }
    await new Promise((r) => setTimeout(r, RSC_BEYOND_SLOW_MS));
    try {
      await route.continue();
    } catch {
      /* nav superseded */
    }
  });
}

function visibleCadernosLoading(page: Page) {
  return page.getByTestId('cadernos-loading').filter({ visible: true });
}

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

async function installCadernosClickToSkeletonProbe(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as {
      __cadernosT0: number;
      __cadernosSkeleton: number;
    };
    w.__cadernosT0 = 0;
    w.__cadernosSkeleton = 0;
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
    const stampSkeleton = () => {
      if (w.__cadernosSkeleton) return;
      const matches = document.querySelectorAll('[data-cadernos-loading="lista"]');
      for (const el of matches) {
        if (el.closest('[hidden]')) continue;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        w.__cadernosSkeleton = performance.now();
        return;
      }
    };
    new MutationObserver(stampSkeleton).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  });
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
}

async function warmupCadernosCompile(page: Page) {
  const warmup = await page.context().newPage();
  try {
    await warmup.addInitScript(vitrineStableLocalStorageInitScript());
    await warmup.goto('/cadernos', { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await warmup.locator('[data-cadernos-hub="lista"]').waitFor({ state: 'attached', timeout: 60_000 });
  } finally {
    await warmup.close();
  }
}

test.describe('Cadernos nav — loading.tsx', () => {
  test('desktop: skeleton no click; lista depois; sem dialog', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await interceptCadernosRsc(page);
    await warmupCadernosCompile(page);
    await gotoEstudarDashboard(page);

    const navLink = cadernosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });

    await installCadernosClickToSkeletonProbe(page);
    await navLink.click({ noWaitAfter: true, force: true });
    await expect(visibleCadernosLoading(page)).toBeVisible({ timeout: 15_000 });
    const clickToFeedbackMs = await page.evaluate(() => {
      const w = window as unknown as { __cadernosT0: number; __cadernosSkeleton: number };
      if (!w.__cadernosT0 || !w.__cadernosSkeleton) return null;
      return Math.round(w.__cadernosSkeleton - w.__cadernosT0);
    });

    expect(clickToFeedbackMs).not.toBeNull();
    expect(clickToFeedbackMs).toBeLessThanOrEqual(FEEDBACK_BUDGET_MS);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('[data-cadernos-hub="lista"]')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('heading', { name: 'Cadernos de Estudo' })).toBeVisible();
  });

  test('mobile: skeleton no click em ≤100ms; BottomNav utilizável', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Mobile Chrome', 'mobile só no Pixel 5');
    test.setTimeout(180_000);
    await interceptCadernosRsc(page);
    await warmupCadernosCompile(page);
    await gotoEstudarDashboard(page);

    const navLink = cadernosNavLocator(page, 'mobile');
    await expect(navLink).toBeVisible({ timeout: 60_000 });

    await installCadernosClickToSkeletonProbe(page);
    await navLink.click({ noWaitAfter: true, force: true });
    await expect(visibleCadernosLoading(page)).toBeVisible({ timeout: 15_000 });
    const clickToFeedbackMs = await page.evaluate(() => {
      const w = window as unknown as { __cadernosT0: number; __cadernosSkeleton: number };
      if (!w.__cadernosT0 || !w.__cadernosSkeleton) return null;
      return Math.round(w.__cadernosSkeleton - w.__cadernosT0);
    });

    expect(clickToFeedbackMs).not.toBeNull();
    expect(clickToFeedbackMs).toBeLessThanOrEqual(FEEDBACK_BUDGET_MS);
    await expect(page.getByRole('navigation', { name: 'Navegação rápida' })).toBeVisible();
    await expect(page.locator('[data-cadernos-hub="lista"]')).toBeVisible({ timeout: 20_000 });
  });

  test('desktop: Enter no link marca pending e mostra skeleton', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await interceptCadernosRsc(page);
    await warmupCadernosCompile(page);
    await gotoEstudarDashboard(page);
    const navLink = cadernosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.focus();
    await page.keyboard.press('Enter');
    await expect(visibleCadernosLoading(page)).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('html[data-cadernos-nav-pending="true"]')).toBeAttached();
    await expect(page.locator('[data-cadernos-hub="lista"]')).toBeVisible({ timeout: 20_000 });
  });

  test('desktop: Ctrl/Meta-click não marca pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(120_000);
    await gotoEstudarDashboard(page);
    const navLink = cadernosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });

    const popupPromise = page.waitForEvent('popup', { timeout: 2_000 }).catch(() => null);
    await navLink.click({ modifiers: ['ControlOrMeta'], noWaitAfter: true });
    const popup = await popupPromise;
    if (popup) await popup.close();

    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
    await expect(page.locator('html[data-cadernos-nav-pending="true"]')).toHaveCount(0);
    await expect(visibleCadernosLoading(page)).toHaveCount(0);
  });

  test('desktop: pointerdown sem click não marca pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(120_000);
    await gotoEstudarDashboard(page);
    const navLink = cadernosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.dispatchEvent('pointerdown');
    await navLink.dispatchEvent('pointercancel');
    await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
    await expect(page.locator('html[data-cadernos-nav-pending="true"]')).toHaveCount(0);
    await expect(visibleCadernosLoading(page)).toHaveCount(0);
  });

  test('desktop: voltar no histórico limpa o pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await interceptCadernosRsc(page);
    await warmupCadernosCompile(page);
    await gotoEstudarDashboard(page);
    const navLink = cadernosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.click({ noWaitAfter: true });
    await expect(visibleCadernosLoading(page)).toBeVisible({ timeout: 5_000 });
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('html[data-cadernos-nav-pending="true"]')).toHaveCount(0, {
      timeout: 5_000,
    });
    await expect(visibleCadernosLoading(page)).toHaveCount(0);
  });

  test('desktop: abandono para outra rota limpa o pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await interceptCadernosRsc(page);
    await warmupCadernosCompile(page);
    await gotoEstudarDashboard(page);
    const navLink = cadernosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.click({ noWaitAfter: true });
    await expect(visibleCadernosLoading(page)).toBeVisible({ timeout: 5_000 });
    await page
      .getByRole('navigation', { name: 'Navegação principal' })
      .getByRole('link', { name: 'Desempenho' })
      .click();
    await expect(page.locator('html[data-cadernos-nav-pending="true"]')).toHaveCount(0, {
      timeout: 8_000,
    });
    await expect(visibleCadernosLoading(page)).toHaveCount(0);
  });

  test('desktop: hang do RSC vira slow-loading e não limpa pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await hangCadernosRsc(page);
    await gotoEstudarDashboard(page);
    const navLink = cadernosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.click({ noWaitAfter: true, force: true });
    await expect(page.locator('html[data-cadernos-nav-pending="true"]')).toBeAttached();
    await expect(visibleCadernosLoading(page)).toBeVisible({ timeout: 5_000 });

    await expect
      .poll(
        async () => {
          const stillPending = await page.locator('html[data-cadernos-nav-pending="true"]').count();
          if (stillPending === 0) return 'cleared';
          return page.locator('html').getAttribute(HUB_NAV_PENDING_PHASE_ATTR);
        },
        { timeout: SLOW_LOADING_ASSERT_TIMEOUT_MS },
      )
      .toBe('slow-loading');
    await expect(page.locator('html[data-cadernos-nav-pending="true"]')).toBeAttached();
    await expect(page.getByRole('status', { name: 'Ainda carregando cadernos' })).toBeVisible();

    const desempenhoLink = page
      .getByRole('navigation', { name: 'Navegação principal' })
      .getByRole('link', { name: 'Desempenho' });
    await expect(desempenhoLink).toBeVisible();
    await desempenhoLink.click({ noWaitAfter: true });
    await expect(page.locator('html[data-cadernos-nav-pending="true"]')).toHaveCount(0, {
      timeout: 8_000,
    });
  });

  test('desktop: erro de carga ainda limpa pending via hub marker', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await interceptCadernosRsc(page);
    await gotoEstudarDashboard(page);
    await page.goto('/cadernos?captura=erro', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await expect(page.locator('[data-cadernos-hub="lista"]')).toBeAttached({ timeout: 20_000 });
    await expect(page.getByRole('alert', { name: 'Erro ao carregar cadernos' })).toBeVisible();
    await expect(page.locator('html[data-cadernos-nav-pending="true"]')).toHaveCount(0);
  });
});
