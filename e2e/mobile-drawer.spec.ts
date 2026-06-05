import { test, expect, type Page } from '@playwright/test';

async function dismissWelcomeIfVisible(page: Page) {
  const entendi = page.getByRole('button', { name: 'Entendi' });
  if (await entendi.isVisible().catch(() => false)) {
    await entendi.click();
  }
}

async function gotoEstudar(page: Page) {
  await page.goto('/estudar', { waitUntil: 'domcontentloaded' });
  await dismissWelcomeIfVisible(page);
}

function maisButton(page: Page) {
  return page
    .locator('nav.fixed.bottom-0[aria-label="Navegação principal"]')
    .getByRole('button', { name: /Abrir menu|Fechar menu/ });
}

/**
 * Drawer mobile (botão Mais) — mobile viewport via projeto "Mobile Chrome".
 * Rodar: npm run test:e2e:drawer
 */
test.describe('Dashboard — drawer mobile (Mais)', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

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
    const shellMain = page.locator('main.pb-nav-safe');
    await maisButton(page).click();
    await expect(page.locator('#dashboard-mobile-drawer')).toBeVisible({ timeout: 10_000 });

    const overflowY = await shellMain.evaluate((el) => getComputedStyle(el).overflowY);
    expect(overflowY).toBe('hidden');
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
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
});
