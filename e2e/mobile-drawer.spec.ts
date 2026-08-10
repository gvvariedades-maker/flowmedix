import { test, expect, type Page, devices } from '@playwright/test';

/** BottomNav e drawer são `md:hidden` — CI usa só projeto chromium (desktop). */
test.use({ ...devices['Pixel 5'] });

async function dismissWelcomeIfVisible(page: Page) {
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

async function gotoEstudar(page: Page) {
  await page.goto('/estudar', { waitUntil: 'domcontentloaded' });
  await dismissWelcomeIfVisible(page);
}

function bottomNav(page: Page) {
  return page.locator('nav[aria-label="Navegação rápida"]');
}

function maisButton(page: Page) {
  return bottomNav(page).getByRole('button', { name: /Abrir menu|Fechar menu/ });
}

/**
 * Drawer mobile (botão Mais). Viewport mobile forçado (CI usa só chromium/desktop).
 * Rodar: npm run test:e2e:drawer
 */
test.describe('Dashboard — drawer mobile (Mais)', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('avant.estudoReverso.welcomeShown', 'true');
      } catch {
        /* storage indisponível */
      }
    });
  });

  test('D1 — /estudar → Mais abre drawer', async ({ page }) => {
    await gotoEstudar(page);
    await maisButton(page).click();
    await expect(page.locator('#dashboard-mobile-drawer')).toBeVisible({ timeout: 10_000 });
  });

  test('D2 — Mais (X) fecha drawer', async ({ page }) => {
    await gotoEstudar(page);
    await maisButton(page).click();
    await expect(page.locator('#dashboard-mobile-drawer')).toBeVisible({ timeout: 10_000 });
    await maisButton(page).click();
    await expect(page.locator('#dashboard-mobile-drawer')).not.toBeVisible({ timeout: 10_000 });
  });

  test('D3 — overlay fecha drawer', async ({ page }) => {
    await gotoEstudar(page);
    await maisButton(page).click();
    await expect(page.locator('#dashboard-mobile-drawer')).toBeVisible({ timeout: 10_000 });
    // Clique por coordenada à direita do painel (15.5rem): evita o detach do node animado
    // (AnimatePresence) que fazia o .click() entrar em loop de retry até o timeout.
    const overlay = page.getByTestId('dashboard-drawer-overlay');
    await expect(overlay).toBeVisible();
    const box = await overlay.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.click(box!.x + box!.width - 12, box!.y + box!.height / 2);
    await expect(page.locator('#dashboard-mobile-drawer')).not.toBeVisible({ timeout: 10_000 });
  });

  test('D4 — Escape fecha drawer', async ({ page }) => {
    await gotoEstudar(page);
    await maisButton(page).click();
    await expect(page.locator('#dashboard-mobile-drawer')).toBeVisible({ timeout: 10_000 });
    await page.keyboard.press('Escape');
    await expect(page.locator('#dashboard-mobile-drawer')).not.toBeVisible({ timeout: 10_000 });
  });

  test('D5 — link Tutorial navega, fecha drawer e marca aria-current', async ({ page }) => {
    await gotoEstudar(page);
    await maisButton(page).click();
    const drawer = page.locator('#dashboard-mobile-drawer');
    await expect(drawer).toBeVisible({ timeout: 10_000 });
    await drawer.getByRole('link', { name: 'Tutorial' }).click();
    await expect(page).toHaveURL(/\/ajuda$/, { timeout: 15_000 });
    await expect(drawer).not.toBeVisible({ timeout: 10_000 });

    await maisButton(page).click();
    await expect(drawer).toBeVisible({ timeout: 10_000 });
    await expect(drawer.getByRole('link', { name: 'Tutorial' })).toHaveAttribute('aria-current', 'page');
  });

  test('D5b — Método reverso ativo em /ajuda/estudo-reverso', async ({ page }) => {
    await page.goto('/ajuda/estudo-reverso', { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfVisible(page);
    await maisButton(page).click();
    const drawer = page.locator('#dashboard-mobile-drawer');
    await expect(drawer).toBeVisible({ timeout: 10_000 });
    await expect(drawer.getByRole('link', { name: 'Método reverso' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(drawer.getByRole('link', { name: 'Tutorial' })).not.toHaveAttribute('aria-current');
  });

  test('D6 — main não rola com drawer aberto', async ({ page }) => {
    await gotoEstudar(page);
    const shellMain = page.locator('main[data-dashboard-main-scroll]');
    await maisButton(page).click();
    await expect(page.locator('#dashboard-mobile-drawer')).toBeVisible({ timeout: 10_000 });

    const overflowY = await shellMain.evaluate((el) => getComputedStyle(el).overflowY);
    expect(overflowY).toBe('hidden');
    const bodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(bodyOverflow).toBe('hidden');
    const touchAction = await page.evaluate(() => document.body.style.touchAction);
    expect(touchAction).toBe('none');
  });

  test('D7 — modal questão bloqueia abertura do drawer', async ({ page }) => {
    test.skip(
      process.env.NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE !== '1',
      'NEXT_PUBLIC_ESTUDAR_MODAL_ROUTE=1 obrigatório para D7 — use npm run test:e2e:modal',
    );

    const { E2E_ESTUDAR_BANCA, E2E_ESTUDAR_SLUG_1, E2E_ESTUDAR_TITULO_AULA } = await import(
      '../lib/e2e/constants'
    );
    const bancaQuery = encodeURIComponent(E2E_ESTUDAR_BANCA);
    await page.goto(`/estudar?banca=${bancaQuery}`, { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfVisible(page);
    await expect(page.getByText(E2E_ESTUDAR_TITULO_AULA)).toBeVisible({ timeout: 15_000 });

    const { garantirPainelAssuntoAberto, vitrineSubjectSheet } = await import('./helpers/vitrineE2e');
    await garantirPainelAssuntoAberto(page, E2E_ESTUDAR_TITULO_AULA);
    const entrar = vitrineSubjectSheet(page, E2E_ESTUDAR_TITULO_AULA).getByRole('link', {
      name: 'Entrar no assunto',
    });
    await entrar.click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 45_000 });

    await maisButton(page).click({ force: true });
    await expect(page.locator('#dashboard-mobile-drawer')).not.toBeVisible({ timeout: 5_000 });
  });

  test('D8 — foco retorna ao botão Mais após fechar', async ({ page }) => {
    await gotoEstudar(page);
    await maisButton(page).click();
    await expect(page.locator('#dashboard-mobile-drawer')).toBeVisible({ timeout: 10_000 });
    await page.keyboard.press('Escape');
    await expect(page.locator('#dashboard-mobile-drawer')).not.toBeVisible({ timeout: 10_000 });
    await expect(maisButton(page)).toBeFocused({ timeout: 10_000 });
  });

  test('D9 — drawer aberto: link Estudar inerte', async ({ page }) => {
    await page.goto('/ajuda', { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfVisible(page);
    await maisButton(page).click();
    await expect(page.locator('#dashboard-mobile-drawer')).toBeVisible({ timeout: 10_000 });

    const estudarLink = bottomNav(page).locator('a[href="/estudar"]');
    await expect(estudarLink).toHaveAttribute('aria-hidden', 'true');
    await expect(page).toHaveURL(/\/ajuda/);
    await expect(page.locator('#dashboard-mobile-drawer')).toBeVisible({ timeout: 5_000 });
  });

  test('D10 — rota do drawer: botão Mais com estado ativo', async ({ page }) => {
    await page.goto('/ajuda', { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfVisible(page);

    const mais = bottomNav(page).getByRole('button', { name: 'Abrir menu' });
    await expect(mais).toHaveAttribute('aria-current', 'page');
    await expect(mais.locator('span', { hasText: 'Mais' })).toHaveClass(/text-slate-800/);
  });

  test('D11 — seção Suporte e WhatsApp acessíveis no drawer', async ({ page }) => {
    await gotoEstudar(page);
    await maisButton(page).click();
    const drawer = page.locator('#dashboard-mobile-drawer');
    await expect(drawer).toBeVisible({ timeout: 10_000 });

    const nav = drawer.getByRole('navigation', { name: 'Navegação principal' });
    await nav.getByText('Suporte', { exact: true }).scrollIntoViewIfNeeded();
    await expect(nav.getByRole('button', { name: 'WhatsApp' })).toBeVisible();
  });

  test('D12 — vitrine: expandir assunto abre subject sheet', async ({ page }) => {
    const { E2E_ESTUDAR_BANCA, E2E_ESTUDAR_TITULO_AULA } = await import('../lib/e2e/constants');
    const bancaQuery = encodeURIComponent(E2E_ESTUDAR_BANCA);
    await page.goto(`/estudar?banca=${bancaQuery}`, { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfVisible(page);
    await expect(page.getByText(E2E_ESTUDAR_TITULO_AULA)).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-vitrine-list-ready="true"]')).toBeAttached({ timeout: 15_000 });

    const assuntoBtn = page.getByRole('button', { name: new RegExp(E2E_ESTUDAR_TITULO_AULA) });
    await assuntoBtn.click();

    const sheet = page.getByRole('dialog', { name: new RegExp(E2E_ESTUDAR_TITULO_AULA) });
    await expect(sheet).toBeVisible({ timeout: 10_000 });
    await expect(sheet.getByRole('link', { name: 'Entrar no assunto' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(sheet).not.toBeVisible({ timeout: 5_000 });
  });
});
