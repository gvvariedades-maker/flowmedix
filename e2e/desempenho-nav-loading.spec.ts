import { expect, test, type Page, type Request, type Route } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { DESEMPENHO_NAV_PENDING_TIMEOUT_MS } from '../lib/desempenho/desempenhoPendingMark';
import { HUB_NAV_PENDING_PHASE_ATTR } from '../lib/layout/hubNavPending';
import { vitrineStableLocalStorageInitScript } from './helpers/vitrineE2e';

/**
 * Onda 1 — feedback de navegação `/estudar` → `/desempenho`.
 *
 * E2E bypass deixa o RSC instantâneo; atrasamos o flight real para o skeleton
 * ficar visível até o hub. O delay é sintético — TTFB de produção não muda.
 *
 * Relatório: artifacts/desempenho-nav-wave1-timings.json
 * clickToFeedbackMs = click (window capture) → skeleton visível.
 */

const RSC_DELAY_MS = 800;
const FEEDBACK_BUDGET_MS = 100;
const SLOW_LOADING_ASSERT_TIMEOUT_MS = DESEMPENHO_NAV_PENDING_TIMEOUT_MS + 10_000;

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

const REPORT_PATH = resolve(process.cwd(), 'artifacts/desempenho-nav-wave1-timings.json');

function isDesempenhoRsc(request: Request): boolean {
  const url = request.url();
  if (!url.includes('/desempenho')) return false;
  const headers = request.headers();
  return (
    url.includes('_rsc') ||
    headers['rsc'] === '1' ||
    headers['next-router-prefetch'] === '1' ||
    Boolean(headers['next-router-state-tree'])
  );
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

function targetsDesempenhoHub(request: Request): boolean {
  const headers = request.headers();
  let pathname = '';
  try {
    pathname = new URL(request.url()).pathname;
  } catch {
    return false;
  }
  const nextUrl = (headers['next-url'] ?? '').split('?')[0];
  return (
    pathname === '/desempenho' ||
    pathname.startsWith('/desempenho/') ||
    nextUrl === '/desempenho' ||
    nextUrl.startsWith('/desempenho/')
  );
}

/**
 * Flight cliente para `/desempenho`, inclusive `/estudar?_rsc` com Next-Url.
 * Prefetch no header não seleciona nem exclui — o clique também o envia.
 */
function isDesempenhoClientFlight(request: Request): boolean {
  if (request.resourceType() === 'document') return false;
  if (!targetsDesempenhoHub(request)) return false;
  const nextUrl = (request.headers()['next-url'] ?? '').split('?')[0];
  if (nextUrl === '/desempenho' || nextUrl.startsWith('/desempenho/')) return true;
  return looksLikeNextFlight(request) || isDesempenhoRsc(request);
}

async function interceptDesempenhoRsc(page: Page) {
  await page.route('**/desempenho**', async (route) => {
    const request = route.request();
    if (request.resourceType() === 'document') {
      await route.continue();
      return;
    }
    if (!isDesempenhoRsc(request) && request.resourceType() !== 'fetch') {
      await route.continue();
      return;
    }
    await new Promise((r) => setTimeout(r, RSC_DELAY_MS));
    try {
      await route.continue();
    } catch {
      /* request already canceled (nav superseded / page closed) */
    }
  });
  await page.route('**/estudar**', async (route) => {
    const request = route.request();
    if (request.resourceType() === 'document') {
      await route.continue();
      return;
    }
    const nextUrl = (request.headers()['next-url'] ?? '').split('?')[0];
    if (nextUrl !== '/desempenho') {
      await route.continue();
      return;
    }
    await new Promise((r) => setTimeout(r, RSC_DELAY_MS));
    try {
      await route.continue();
    } catch {
      /* request already canceled (nav superseded / page closed) */
    }
  });
}

/** Flights do hub ficam no gate do teste até `release()` — sem timer e sem abort. */
async function hangDesempenhoRsc(page: Page, gate: HubHangGate) {
  page.on('request', (request) => {
    if (looksLikeNextFlight(request) || targetsDesempenhoHub(request)) {
      gate.seen.push(summarizeFlight(request));
    }
  });
  const handle = async (route: Route) => {
    const request = route.request();
    if (request.resourceType() === 'document' || !isDesempenhoClientFlight(request)) {
      if (request.resourceType() !== 'document' && targetsDesempenhoHub(request)) {
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
      /* request already canceled (nav superseded / page closed) */
    }
  };
  await page.route('**/desempenho**', handle);
  await page.route('**/estudar**', handle);
}

function visibleEstudoLoading(page: Page) {
  return page.getByTestId('desempenho-estudo-loading').filter({ visible: true });
}

function visibleEstudoHeading(page: Page) {
  return page.getByRole('heading', { name: 'Meu desempenho' }).filter({ visible: true });
}

function desempenhoNavLocator(page: Page, viewport: 'desktop' | 'mobile') {
  if (viewport === 'mobile') {
    return page
      .getByRole('navigation', { name: 'Navegação rápida' })
      .getByRole('link', { name: 'Desempenho' });
  }
  return page
    .getByRole('navigation', { name: 'Navegação principal' })
    .getByRole('link', { name: 'Desempenho' });
}

async function preparePage(page: Page) {
  await page.addInitScript(vitrineStableLocalStorageInitScript());
}

async function gotoEstudarDashboard(page: Page) {
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

/** Compila `/desempenho` sem cachear o RSC na página que vamos medir. */
async function warmupDesempenhoCompile(page: Page) {
  const warmup = await page.context().newPage();
  try {
    await warmup.addInitScript(vitrineStableLocalStorageInitScript());
    await warmup.goto('/desempenho', { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await warmup
      .locator('[data-desempenho-hub="estudo"]')
      .waitFor({ state: 'attached', timeout: 60_000 });
  } finally {
    await warmup.close();
  }
}

type NavTimings = {
  viewport: string;
  rscDelayMs: number;
  clickToFeedbackMs: number;
  clickToPendingAttrMs: number | null;
  clickToFirstContentMs: number;
  rscTtfbMs: number | null;
  renderAfterRscMs: number | null;
  feedbackSource: 'skeleton' | 'content';
};

async function installClickToSkeletonProbe(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as {
      __desempT0: number;
      __desempSkeleton: number;
    };
    w.__desempT0 = 0;
    w.__desempSkeleton = 0;
    window.addEventListener(
      'click',
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const link = target.closest('a[href]');
        if (!link) return;
        try {
          const url = new URL(link.getAttribute('href') ?? '', window.location.origin);
          if (url.pathname !== '/desempenho') return;
        } catch {
          return;
        }
        if (!w.__desempT0) w.__desempT0 = performance.now();
      },
      true,
    );
    const stampSkeleton = () => {
      if (w.__desempSkeleton) return;
      const matches = document.querySelectorAll('[data-desempenho-loading="estudo"]');
      for (const el of matches) {
        if (el.closest('[hidden]')) continue;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        w.__desempSkeleton = performance.now();
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

async function measureNav(page: Page, viewport: 'desktop' | 'mobile'): Promise<NavTimings> {
  let rscTtfbMs: number | null = null;

  page.on('response', (response) => {
    const req = response.request();
    if (!isDesempenhoRsc(req)) return;
    if (req.headers()['next-router-prefetch'] === '1') return;
    if (rscTtfbMs != null) return;
    const start = req.timing()?.responseStart;
    if (typeof start === 'number' && Number.isFinite(start)) {
      rscTtfbMs = Math.round(start);
    }
  });

  await warmupDesempenhoCompile(page);
  await gotoEstudarDashboard(page);
  const navLink = desempenhoNavLocator(page, viewport);
  await expect(navLink).toBeVisible({ timeout: 60_000 });

  await installClickToSkeletonProbe(page);

  const skeleton = page.locator('[data-desempenho-loading="estudo"]').filter({ visible: true });
  const hub = page.locator('[data-desempenho-hub="estudo"]');
  const pendingAttr = page.locator('html[data-desempenho-nav-pending="true"]');

  const skeletonAt = skeleton
    .waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => Date.now());
  const pendingAttrAt = pendingAttr
    .waitFor({ state: 'attached', timeout: 15_000 })
    .then(() => Date.now())
    .catch(() => null);
  const hubAt = hub.waitFor({ state: 'attached', timeout: 30_000 }).then(() => Date.now());

  const t0 = Date.now();
  await navLink.click({ noWaitAfter: true, force: true });

  const first = await Promise.race([
    skeletonAt.then((t) => ({ source: 'skeleton' as const, t })),
    hubAt.then((t) => ({ source: 'content' as const, t })),
  ]);
  const hubT = await hubAt;
  const pendingAttrT = await pendingAttrAt;
  const clickToSkeletonMs = await page.evaluate(() => {
    const w = window as unknown as { __desempT0: number; __desempSkeleton: number };
    if (!w.__desempT0 || !w.__desempSkeleton) return null;
    return Math.round(w.__desempSkeleton - w.__desempT0);
  });

  return {
    viewport,
    rscDelayMs: RSC_DELAY_MS,
    clickToFeedbackMs: clickToSkeletonMs ?? first.t - t0,
    clickToPendingAttrMs: pendingAttrT == null ? null : pendingAttrT - t0,
    clickToFirstContentMs: hubT - t0,
    rscTtfbMs,
    renderAfterRscMs: rscTtfbMs != null ? Math.max(0, hubT - t0 - rscTtfbMs) : null,
    feedbackSource: first.source,
  };
}

function appendReport(entry: NavTimings) {
  mkdirSync(resolve(process.cwd(), 'artifacts'), { recursive: true });
  const note =
    'Delay RSC sintético de 800ms. TTFB de produção não é este número. clickToFeedbackMs = click (window capture) → skeleton visível (MutationObserver + flushSync). clickToPendingAttrMs inclui overhead do Playwright click().';
  let existing: { measuredAt: string; note: string; entries: NavTimings[] } = {
    measuredAt: new Date().toISOString(),
    note,
    entries: [],
  };
  try {
    const parsed = JSON.parse(readFileSync(REPORT_PATH, 'utf8')) as typeof existing;
    existing = { ...parsed, measuredAt: new Date().toISOString(), note };
  } catch {
    /* first run */
  }
  existing.entries = existing.entries.filter((item) => item.viewport !== entry.viewport);
  existing.entries.push(entry);
  writeFileSync(REPORT_PATH, JSON.stringify(existing, null, 2), 'utf8');
}

test.describe('Desempenho nav wave 1 — loading.tsx', () => {
  test.use({ serviceWorkers: 'block' });

  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  test('desktop: skeleton em ≤100ms no click; hub depois; sem dialog', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await interceptDesempenhoRsc(page);

    const timings = await measureNav(page, 'desktop');
    appendReport(timings);

    expect(timings.feedbackSource).toBe('skeleton');
    expect(timings.clickToFeedbackMs).toBeLessThanOrEqual(FEEDBACK_BUDGET_MS);
    // Hub pode chegar rápido no CI se o RSC já estiver em cache; o delay sintético
    // só precisa deixar o skeleton observável, não inflar clickToFirstContentMs.

    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Meu desempenho' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Praticar na vitrine' })).toBeVisible();
    await expect(page.getByLabel('Placar de estudo')).toBeVisible();
  });

  test('mobile: skeleton em ≤100ms no click; conteúdo acima do BottomNav', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'Mobile Chrome', 'mobile só no Pixel 5');
    test.setTimeout(180_000);
    await interceptDesempenhoRsc(page);

    const timings = await measureNav(page, 'mobile');
    appendReport(timings);

    expect(timings.feedbackSource).toBe('skeleton');
    expect(timings.clickToFeedbackMs).toBeLessThanOrEqual(FEEDBACK_BUDGET_MS);

    const nav = page.getByRole('navigation', { name: 'Navegação rápida' });
    await expect(nav).toBeVisible();

    const overlap = await page.evaluate(() => {
      const navEl = document.querySelector<HTMLElement>('nav[aria-label="Navegação rápida"]');
      const hub = document.querySelector<HTMLElement>('[data-desempenho-hub="estudo"]');
      if (!navEl || !hub) return true;
      const navBox = navEl.getBoundingClientRect();
      return [...hub.querySelectorAll<HTMLElement>('a, button, h2')].some((el) => {
        const r = el.getBoundingClientRect();
        if (r.height < 2 || r.width < 2) return false;
        return r.bottom > navBox.top + 1 && r.top < navBox.bottom - 1;
      });
    });
    expect(overlap).toBe(false);
  });

  test('desktop: Enter no link marca pending e mostra skeleton', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await interceptDesempenhoRsc(page);
    await warmupDesempenhoCompile(page);
    await gotoEstudarDashboard(page);
    const navLink = desempenhoNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.focus();
    await page.keyboard.press('Enter');
    await expect(visibleEstudoLoading(page)).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('html[data-desempenho-nav-pending="true"]')).toBeAttached();
    await expect(page.locator('[data-desempenho-hub="estudo"]')).toBeVisible({ timeout: 20_000 });
  });

  test('desktop: Ctrl/Meta-click não marca pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await gotoEstudarDashboard(page);
    const navLink = desempenhoNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });

    const popupPromise = page.waitForEvent('popup', { timeout: 2_000 }).catch(() => null);
    await navLink.click({ modifiers: ['ControlOrMeta'], noWaitAfter: true });
    const popup = await popupPromise;
    if (popup) await popup.close();

    await page.evaluate(() => new Promise((r) => setTimeout(r, 400)));
    await expect(page.locator('html[data-desempenho-nav-pending="true"]')).toHaveCount(0);
    await expect(visibleEstudoLoading(page)).toHaveCount(0);
  });

  test('desktop: pointerdown sem click não marca pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await gotoEstudarDashboard(page);
    const navLink = desempenhoNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.dispatchEvent('pointerdown');
    await navLink.dispatchEvent('pointercancel');
    await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
    await expect(page.locator('html[data-desempenho-nav-pending="true"]')).toHaveCount(0);
    await expect(visibleEstudoLoading(page)).toHaveCount(0);
  });

  test('desktop: voltar no histórico limpa o pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await interceptDesempenhoRsc(page);
    await warmupDesempenhoCompile(page);
    await gotoEstudarDashboard(page);
    const navLink = desempenhoNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.click({ noWaitAfter: true });
    await expect(visibleEstudoLoading(page)).toBeVisible({ timeout: 5_000 });
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('html[data-desempenho-nav-pending="true"]')).toHaveCount(0, {
      timeout: 5_000,
    });
    await expect(visibleEstudoLoading(page)).toHaveCount(0);
  });

  test('desktop: abandono para outra rota limpa o pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await interceptDesempenhoRsc(page);
    await warmupDesempenhoCompile(page);
    await gotoEstudarDashboard(page);
    const navLink = desempenhoNavLocator(page, 'desktop');
    await expect(navLink).toBeVisible({ timeout: 60_000 });
    await navLink.click({ noWaitAfter: true });
    await expect(visibleEstudoLoading(page)).toBeVisible({ timeout: 5_000 });
    await page
      .getByRole('navigation', { name: 'Navegação principal' })
      .getByRole('link', { name: 'Cadernos' })
      .click();
    await expect(page.locator('html[data-desempenho-nav-pending="true"]')).toHaveCount(0, {
      timeout: 8_000,
    });
    await expect(visibleEstudoLoading(page)).toHaveCount(0);
  });

  test('desktop: hang do RSC vira slow-loading e não limpa pending', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    const gate = createHubHangGate();
    await hangDesempenhoRsc(page, gate);
    try {
      await gotoEstudarDashboard(page);
      const navLink = desempenhoNavLocator(page, 'desktop');
      await expect(navLink).toBeVisible({ timeout: 60_000 });
      await navLink.click({ noWaitAfter: true, force: true });
      await expect(page.locator('html[data-desempenho-nav-pending="true"]')).toBeAttached();
      await expect(visibleEstudoLoading(page)).toBeVisible({ timeout: 5_000 });
      await expect
        .poll(() => gate.entered, {
          timeout: 5_000,
          message: `handler não reteve flight desempenho; held=${gate.held.join(' | ') || '∅'} missed=${gate.missed.join(' | ') || '∅'} seen=${gate.seen.join(' | ') || '∅'}`,
        })
        .toBeGreaterThan(0);
      await expect
        .poll(
          async () => {
            const stillPending = await page.locator('html[data-desempenho-nav-pending="true"]').count();
            if (stillPending === 0) return 'cleared';
            return page.locator('html').getAttribute(HUB_NAV_PENDING_PHASE_ATTR);
          },
          { timeout: SLOW_LOADING_ASSERT_TIMEOUT_MS },
        )
        .toBe('slow-loading');
      await expect(page.locator('html[data-desempenho-nav-pending="true"]')).toBeAttached();
      await expect(page.getByRole('status', { name: 'Ainda carregando desempenho' })).toBeVisible();
      expect(gate.entered).toBeGreaterThan(0);
    } finally {
      gate.release();
    }
  });

  test('desktop: erro de carga ainda limpa pending via hub marker', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await interceptDesempenhoRsc(page);
    await gotoEstudarDashboard(page);
    await page.goto('/desempenho?captura=erro', {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await expect(page.locator('[data-desempenho-hub="estudo"]')).toBeAttached({ timeout: 20_000 });
    await expect(page.getByRole('alert', { name: 'Erro ao carregar desempenho' })).toBeVisible();
    await expect(page.locator('html[data-desempenho-nav-pending="true"]')).toHaveCount(0);
  });

  test('desktop: Tab no loading não prende o foco; header sem shift', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'desktop só no Chromium');
    test.setTimeout(180_000);
    await interceptDesempenhoRsc(page);
    await gotoEstudarDashboard(page);
    await expect(desempenhoNavLocator(page, 'desktop')).toBeVisible({ timeout: 60_000 });
    await desempenhoNavLocator(page, 'desktop').click({ noWaitAfter: true });
    await expect(visibleEstudoLoading(page)).toBeVisible({ timeout: 5_000 });

    await expect(page.locator('main > div[hidden]')).toBeAttached();
    const cta = page.getByRole('link', { name: 'Praticar na vitrine' }).filter({ visible: true });
    await expect(cta).toBeVisible();
    await cta.focus();
    await expect(cta).toBeFocused();
    await page.keyboard.press('Tab');
    const focusedInsideHidden = await page.evaluate(() => {
      const hiddenRoot = document.querySelector('main [hidden]');
      return hiddenRoot?.contains(document.activeElement) ?? false;
    });
    expect(focusedInsideHidden).toBe(false);
    await expect(page.getByRole('dialog')).toHaveCount(0);

    const headerBefore = await visibleEstudoHeading(page).evaluate((el) =>
      el.getBoundingClientRect().height,
    );

    await expect(page.locator('[data-desempenho-hub="estudo"]').filter({ visible: true })).toBeVisible(
      { timeout: 20_000 },
    );

    const headerAfter = await visibleEstudoHeading(page).evaluate((el) =>
      el.getBoundingClientRect().height,
    );
    expect(Math.abs(headerAfter - headerBefore)).toBeLessThanOrEqual(2);
  });
});
