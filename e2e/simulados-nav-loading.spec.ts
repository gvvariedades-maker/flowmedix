import { expect, test, type Page, type Request, type Route } from '@playwright/test';
import { SIMULADOS_NAV_PENDING_TIMEOUT_MS } from '../lib/simulado/simuladosPendingMark';
import { HUB_NAV_PENDING_PHASE_ATTR } from '../lib/layout/hubNavPending';
import { vitrineStableLocalStorageInitScript } from './helpers/vitrineE2e';

/**
 * Onda 1 Simulados — feedback `/estudar` → `/simulados`.
 * Next 16.2 segura a tela atual até o RSC; o shell mostra skeleton no click.
 * Após 8 s o pending vira slow-loading e não some até ready, erro ou abandono.
 */

const RSC_DELAY_MS = 800;
const FEEDBACK_BUDGET_MS = 100;
/** JS não garante os 8s exatos no CI; margem só na asserção. */
const SLOW_LOADING_ASSERT_TIMEOUT_MS = SIMULADOS_NAV_PENDING_TIMEOUT_MS + 10_000;

type HubHangGate = {
  hold: Promise<void>;
  release: () => void;
  entered: number;
  held: string[];
  missed: string[];
  seen: string[];
};

function createHubHangGate(): HubHangGate {
  let settled = false;
  let resolveHold = () => {};
  const hold = new Promise<void>((resolve) => {
    resolveHold = resolve;
  });
  return {
    hold,
    entered: 0,
    held: [],
    missed: [],
    seen: [],
    release() {
      if (settled) return;
      settled = true;
      resolveHold();
    },
  };
}

function summarizeFlight(request: Request): string {
  const headers = request.headers();
  let pathname = request.url();
  try {
    pathname = new URL(request.url()).pathname;
  } catch {
    /* keep raw url */
  }
  return [
    request.resourceType(),
    pathname,
    `rsc=${headers['rsc'] ?? ''}`,
    `next-url=${headers['next-url'] ?? ''}`,
    `prefetch=${headers['next-router-prefetch'] ?? ''}`,
    `tree=${headers['next-router-state-tree'] ? '1' : ''}`,
  ].join(' ');
}

function looksLikeNextFlight(request: Request): boolean {
  const url = request.url();
  const headers = request.headers();
  const accept = headers['accept'] ?? '';
  const type = request.resourceType();
  return (
    url.includes('_rsc') ||
    headers['rsc'] === '1' ||
    Boolean(headers['next-router-state-tree']) ||
    accept.includes('text/x-component') ||
    type === 'fetch' ||
    type === 'xhr' ||
    type === 'other'
  );
}

function targetsSimuladosHub(request: Request): boolean {
  const headers = request.headers();
  let pathname = '';
  try {
    pathname = new URL(request.url()).pathname;
  } catch {
    return false;
  }
  const nextUrl = (headers['next-url'] ?? '').split('?')[0];
  return (
    pathname === '/simulados' ||
    pathname.startsWith('/simulados/') ||
    nextUrl === '/simulados' ||
    nextUrl.startsWith('/simulados/')
  );
}

function isSimuladosRsc(request: Request): boolean {
  if (!targetsSimuladosHub(request)) return false;
  const url = request.url();
  const headers = request.headers();
  return (
    url.includes('_rsc') ||
    headers['rsc'] === '1' ||
    headers['next-router-prefetch'] === '1' ||
    Boolean(headers['next-router-state-tree'])
  );
}

/**
 * Flight cliente para `/simulados`, inclusive `/estudar?_rsc` com Next-Url.
 * Prefetch no header não seleciona nem exclui — o clique também o envia.
 */
function isSimuladosClientFlight(request: Request): boolean {
  if (request.resourceType() === 'document') return false;
  if (!targetsSimuladosHub(request)) return false;
  const nextUrl = (request.headers()['next-url'] ?? '').split('?')[0];
  if (nextUrl === '/simulados' || nextUrl.startsWith('/simulados/')) return true;
  return looksLikeNextFlight(request) || isSimuladosRsc(request);
}

/** Document `/simulados` — em prod o bypass E2E serviria o hub na hora se o hang só pegasse RSC. */
function isSimuladosDocumentNav(request: Request): boolean {
  if (request.resourceType() !== 'document') return false;
  try {
    const pathname = new URL(request.url()).pathname;
    return pathname === '/simulados' || pathname.startsWith('/simulados/');
  } catch {
    return false;
  }
}

async function interceptSimuladosRsc(page: Page) {
  await page.route('**/simulados**', async (route) => {
    const request = route.request();
    const delayDocument = isSimuladosDocumentNav(request);
    const delayFlight =
      request.resourceType() !== 'document' &&
      (isSimuladosRsc(request) || request.resourceType() === 'fetch');
    if (!delayDocument && !delayFlight) {
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

async function hangSimuladosRsc(page: Page, gate: HubHangGate) {
  page.on('request', (request) => {
    if (looksLikeNextFlight(request) || targetsSimuladosHub(request)) {
      gate.seen.push(summarizeFlight(request));
    }
  });
  const handle = async (route: Route) => {
    const request = route.request();
    const hang = isSimuladosDocumentNav(request) || isSimuladosClientFlight(request);
    if (!hang) {
      if (request.resourceType() !== 'document' && targetsSimuladosHub(request)) {
        gate.missed.push(summarizeFlight(request));
      }
      await route.fallback();
      return;
    }
    gate.entered += 1;
    gate.held.push(summarizeFlight(request));
    await gate.hold;
    try {
      await route.continue();
    } catch {
      /* nav superseded */
    }
  };
  await page.route('**/simulados**', handle);
  await page.route('**/estudar**', handle);
}

function visibleSimuladosLoading(page: Page) {
  return page.getByTestId('simulados-loading').filter({ visible: true });
}

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

async function installSimuladosClickToSkeletonProbe(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as {
      __simuladosT0: number;
      __simuladosSkeleton: number;
    };
    w.__simuladosT0 = 0;
    w.__simuladosSkeleton = 0;
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
    const stampSkeleton = () => {
      if (w.__simuladosSkeleton) return;
      const matches = document.querySelectorAll('[data-simulados-loading="lista"]');
      for (const el of matches) {
        if (el.closest('[hidden]')) continue;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        w.__simuladosSkeleton = performance.now();
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
  await expect(page.locator('html[data-theme="editorial"]')).toBeAttached({ timeout: 15_000 });
}

async function warmupSimuladosCompile(page: Page) {
  const warmup = await page.context().newPage();
  try {
    await warmup.addInitScript(vitrineStableLocalStorageInitScript());
    await warmup.goto('/simulados', { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await warmup.locator('[data-simulados-hub="lista"]').waitFor({ state: 'attached', timeout: 60_000 });
  } finally {
    await warmup.close();
  }
}

test.describe('Simulados nav — loading.tsx', () => {
  test.use({ serviceWorkers: 'block' });

  test('desktop: skeleton no click; lista depois; sem dialog', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await interceptSimuladosRsc(page);
    await warmupSimuladosCompile(page);
    await gotoEstudarDashboard(page);

    const navLink = simuladosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });

    await installSimuladosClickToSkeletonProbe(page);
    await navLink.click({ noWaitAfter: true, force: true });
    await expect(visibleSimuladosLoading(page)).toBeVisible({ timeout: 15_000 });
    const clickToFeedbackMs = await page.evaluate(() => {
      const w = window as unknown as { __simuladosT0: number; __simuladosSkeleton: number };
      if (!w.__simuladosT0 || !w.__simuladosSkeleton) return null;
      return Math.round(w.__simuladosSkeleton - w.__simuladosT0);
    });

    expect(clickToFeedbackMs).not.toBeNull();
    expect(clickToFeedbackMs).toBeLessThanOrEqual(FEEDBACK_BUDGET_MS);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('[data-simulados-hub="lista"]')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('heading', { name: 'Simulados', level: 1 })).toBeVisible();
  });

  test('mobile: skeleton no click em ≤100ms; BottomNav utilizável', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Mobile Chrome', 'mobile só no Pixel 5');
    test.setTimeout(180_000);
    await interceptSimuladosRsc(page);
    await warmupSimuladosCompile(page);
    await gotoEstudarDashboard(page);

    const navLink = simuladosNavLocator(page, 'mobile');
    await expect(navLink).toBeVisible({ timeout: 60_000 });

    await installSimuladosClickToSkeletonProbe(page);
    await navLink.click({ noWaitAfter: true, force: true });
    await expect(visibleSimuladosLoading(page)).toBeVisible({ timeout: 15_000 });
    const clickToFeedbackMs = await page.evaluate(() => {
      const w = window as unknown as { __simuladosT0: number; __simuladosSkeleton: number };
      if (!w.__simuladosT0 || !w.__simuladosSkeleton) return null;
      return Math.round(w.__simuladosSkeleton - w.__simuladosT0);
    });

    expect(clickToFeedbackMs).not.toBeNull();
    expect(clickToFeedbackMs).toBeLessThanOrEqual(FEEDBACK_BUDGET_MS);
    await expect(page.getByRole('navigation', { name: 'Navegação rápida' })).toBeVisible();
    await expect(page.locator('[data-simulados-hub="lista"]')).toBeVisible({ timeout: 20_000 });
  });

  test('desktop: Enter no link marca pending e mostra skeleton', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await interceptSimuladosRsc(page);
    await warmupSimuladosCompile(page);
    await gotoEstudarDashboard(page);
    const navLink = simuladosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.focus();
    await Promise.all([
      expect(visibleSimuladosLoading(page)).toBeVisible({ timeout: 5_000 }),
      page.keyboard.press('Enter'),
    ]);
    await expect(page.locator('html[data-simulados-nav-pending="true"]')).toBeAttached();
    await expect(page.locator('[data-simulados-hub="lista"]')).toBeVisible({ timeout: 20_000 });
  });

  test('desktop: Ctrl/Meta-click não marca pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(120_000);
    await gotoEstudarDashboard(page);
    const navLink = simuladosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });

    const popupPromise = page.waitForEvent('popup', { timeout: 2_000 }).catch(() => null);
    await navLink.click({ modifiers: ['ControlOrMeta'], noWaitAfter: true });
    const popup = await popupPromise;
    if (popup) await popup.close();

    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
    await expect(page.locator('html[data-simulados-nav-pending="true"]')).toHaveCount(0);
    await expect(visibleSimuladosLoading(page)).toHaveCount(0);
  });

  test('desktop: analytics /desempenho/simulados não marca pending do hub', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(120_000);
    await gotoEstudarDashboard(page);
    const analyticsLink = page
      .getByRole('navigation', { name: 'Navegação principal' })
      .locator('a[href="/desempenho/simulados"]');
    await expect(analyticsLink).toBeVisible({ timeout: 60_000 });
    await analyticsLink.click({ noWaitAfter: true });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
    await expect(page.locator('html[data-simulados-nav-pending="true"]')).toHaveCount(0);
    await expect(visibleSimuladosLoading(page)).toHaveCount(0);
  });

  test('desktop: pointerdown sem click não marca pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(120_000);
    await gotoEstudarDashboard(page);
    const navLink = simuladosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.dispatchEvent('pointerdown');
    await navLink.dispatchEvent('pointercancel');
    await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
    await expect(page.locator('html[data-simulados-nav-pending="true"]')).toHaveCount(0);
    await expect(visibleSimuladosLoading(page)).toHaveCount(0);
  });

  test('desktop: voltar no histórico limpa o pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await interceptSimuladosRsc(page);
    await warmupSimuladosCompile(page);
    await gotoEstudarDashboard(page);
    const navLink = simuladosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.click({ noWaitAfter: true });
    await expect(visibleSimuladosLoading(page)).toBeVisible({ timeout: 5_000 });
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('html[data-simulados-nav-pending="true"]')).toHaveCount(0, {
      timeout: 5_000,
    });
    await expect(visibleSimuladosLoading(page)).toHaveCount(0);
  });

  test('desktop: abandono para outra rota limpa o pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await interceptSimuladosRsc(page);
    await warmupSimuladosCompile(page);
    await gotoEstudarDashboard(page);
    const navLink = simuladosNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.click({ noWaitAfter: true });
    await expect(visibleSimuladosLoading(page)).toBeVisible({ timeout: 5_000 });
    await page
      .getByRole('navigation', { name: 'Navegação principal' })
      .getByRole('link', { name: 'Desempenho' })
      .click();
    await expect(page.locator('html[data-simulados-nav-pending="true"]')).toHaveCount(0, {
      timeout: 8_000,
    });
    await expect(visibleSimuladosLoading(page)).toHaveCount(0);
  });

  test('desktop: hang do RSC vira slow-loading e não limpa pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    const gate = createHubHangGate();
    await hangSimuladosRsc(page, gate);
    try {
      await gotoEstudarDashboard(page);
      const navLink = simuladosNavLocator(page, 'desktop');
      await expect(navLink).toBeVisible({ timeout: 60_000 });
      await navLink.click({ noWaitAfter: true, force: true });
      await expect
        .poll(async () => page.locator('html').getAttribute('data-simulados-nav-pending'), {
          timeout: 5_000,
          message: `pending não marcou; entered=${gate.entered} held=${gate.held.join(' | ') || '∅'} missed=${gate.missed.join(' | ') || '∅'} seen=${gate.seen.slice(-8).join(' | ') || '∅'}`,
        })
        .toBe('true');
      await expect(visibleSimuladosLoading(page)).toBeVisible({ timeout: 5_000 });
      await expect
        .poll(() => gate.entered, {
          timeout: 5_000,
          message: `handler não reteve flight simulados; held=${gate.held.join(' | ') || '∅'} missed=${gate.missed.join(' | ') || '∅'} seen=${gate.seen.join(' | ') || '∅'}`,
        })
        .toBeGreaterThan(0);

      await expect
        .poll(
          async () => {
            const stillPending = await page.locator('html[data-simulados-nav-pending="true"]').count();
            if (stillPending === 0) return 'cleared';
            return page.locator('html').getAttribute(HUB_NAV_PENDING_PHASE_ATTR);
          },
          { timeout: SLOW_LOADING_ASSERT_TIMEOUT_MS },
        )
        .toBe('slow-loading');
      await expect(page.locator('html[data-simulados-nav-pending="true"]')).toBeAttached();
      await expect(page.getByRole('status', { name: 'Ainda carregando simulados' })).toBeVisible();
      expect(gate.entered).toBeGreaterThan(0);

      const desempenhoLink = page
        .getByRole('navigation', { name: 'Navegação principal' })
        .getByRole('link', { name: 'Desempenho' });
      await expect(desempenhoLink).toBeVisible();
      await desempenhoLink.click({ noWaitAfter: true });
      await expect(page.locator('html[data-simulados-nav-pending="true"]')).toHaveCount(0, {
        timeout: 8_000,
      });
    } finally {
      gate.release();
    }
  });

  test('desktop: erro de carga ainda limpa pending via hub marker', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await interceptSimuladosRsc(page);
    await gotoEstudarDashboard(page);
    await page.goto('/simulados?captura=erro', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await expect(page.locator('[data-simulados-hub="lista"]')).toBeAttached({ timeout: 20_000 });
    await expect(page.getByRole('alert', { name: 'Erro ao carregar simulados' })).toBeVisible();
    await expect(page.locator('html[data-simulados-nav-pending="true"]')).toHaveCount(0);
  });
});
