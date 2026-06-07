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
    await page.getByTestId('dashboard-drawer-overlay').click({ force: true });
    await expect(page.locator('#dashboard-mobile-drawer')).not.toBeVisible({ timeout: 10_000 });
  });

  test('D4 — Escape fecha drawer', async ({ page }) => {
    await gotoEstudar(page);
    await maisButton(page).click();
    await expect(page.locator('#dashboard-mobile-drawer')).toBeVisible({ timeout: 10_000 });
    await page.keyboard.press('Escape');
    await expect(page.locator('#dashboard-mobile-drawer')).not.toBeVisible({ timeout: 10_000 });
  });

  test('D5 — link Como usar navega e fecha drawer', async ({ page }) => {
    await gotoEstudar(page);
    await maisButton(page).click();
    await expect(page.locator('#dashboard-mobile-drawer')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('link', { name: 'Como usar (tutorial)' }).click();
    await expect(page).toHaveURL(/\/ajuda/, { timeout: 15_000 });
    await expect(page.locator('#dashboard-mobile-drawer')).not.toBeVisible({ timeout: 10_000 });
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

    const assuntoBtn = page.getByRole('button', { name: new RegExp(E2E_ESTUDAR_TITULO_AULA) });
    await assuntoBtn.click({ force: true });
    const entrar = page
      .locator(`a[href*="/estudar/${E2E_ESTUDAR_SLUG_1}"]`)
      .filter({ hasText: 'Entrar no assunto' })
      .first();
    await entrar.click({ force: true });
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

  test('D9 — drawer aberto: link Estudar não navega', async ({ page }) => {
    await page.goto('/ajuda', { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfVisible(page);
    await maisButton(page).click();
    await expect(page.locator('#dashboard-mobile-drawer')).toBeVisible({ timeout: 10_000 });

    await bottomNav(page).locator('a[href="/estudar"]').click({ force: true });
    await expect(page).toHaveURL(/\/ajuda/, { timeout: 5_000 });
    await expect(page.locator('#dashboard-mobile-drawer')).toBeVisible({ timeout: 5_000 });
  });

  test('D10 — rota do drawer: botão Mais com estado ativo', async ({ page }) => {
    await page.goto('/ajuda', { waitUntil: 'domcontentloaded' });
    await dismissWelcomeIfVisible(page);

    const mais = bottomNav(page).getByRole('button', { name: 'Abrir menu' });
    await expect(mais).toHaveAttribute('aria-current', 'page');
    await expect(mais.locator('span', { hasText: 'Mais' })).toHaveClass(/text-\[#00f2ff\]/);
  });
});
