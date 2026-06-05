import { test, expect, type Page, devices } from '@playwright/test';

/** Paginação sticky e BottomNav são `md:hidden` — forçar viewport mobile no CI (só chromium desktop). */
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

async function waitVitrineListReady(page: Page) {
  await expect(page.locator('[data-vitrine-slot-ready="true"]')).toBeAttached({ timeout: 15_000 });
  await expect(page.locator('[data-vitrine-list-ready="true"]')).toBeAttached({ timeout: 15_000 });
}

function bottomNav(page: Page) {
  return page.locator('nav.fixed.bottom-0[aria-label="Navegação rápida"]');
}

/** Barra sticky mobile (variant="sticky") — acima do BottomNav. */
function stickyPagination(page: Page) {
  return page.locator('nav.fixed.inset-x-0[aria-label="Paginação da vitrine"]');
}

function vitrineCards(page: Page) {
  return page.locator('[data-vitrine-list-ready="true"] > div');
}

/**
 * Vitrine mobile — paginação sticky acima do BottomNav e navegação ?page=2.
 * Rodar: npm run test:e2e:vitrine-pagination
 */
test.describe('Vitrine — paginação mobile sticky', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('avant.estudoReverso.welcomeShown', 'true');
      } catch {
        /* storage indisponível */
      }
    });
    await gotoEstudar(page);
  });

  test('barra sticky visível quando há mais de uma página', async ({ page }) => {
    await waitVitrineListReady(page);

    const sticky = stickyPagination(page);
    await expect(sticky).toBeVisible({ timeout: 10_000 });
    await expect(sticky.getByText(/Página 1 de \d+/)).toBeVisible();

    const inlineNav = page.locator(
      'nav.mt-6.hidden[aria-label="Paginação da vitrine"]',
    );
    await expect(inlineNav).toBeHidden();
  });

  test('botões Anterior/Próxima ficam acima do BottomNav', async ({ page }) => {
    await waitVitrineListReady(page);

    const nav = bottomNav(page);
    await expect(nav).toBeVisible({ timeout: 15_000 });

    const navBox = await nav.boundingBox();
    expect(navBox).not.toBeNull();

    const proxima = stickyPagination(page).getByRole('button', { name: 'Próxima' });
    await expect(proxima).toBeVisible();
    const proximaBox = await proxima.boundingBox();
    expect(proximaBox).not.toBeNull();

    expect(proximaBox!.y + proximaBox!.height).toBeLessThanOrEqual(navBox!.y + 2);

    const anterior = stickyPagination(page).getByRole('button', { name: 'Anterior' });
    const anteriorBox = await anterior.boundingBox();
    expect(anteriorBox).not.toBeNull();
    expect(anteriorBox!.y + anteriorBox!.height).toBeLessThanOrEqual(navBox!.y + 2);
  });

  test('Próxima navega para page=2 e atualiza contador de assuntos', async ({ page }) => {
    await waitVitrineListReady(page);

    const proxima = page.getByTestId('vitrine-pagination-next-sticky');
    await expect(proxima).toBeVisible();
    await expect(stickyPagination(page).getByText(/Página 1 de 2/)).toBeVisible();
    await expect(proxima).toBeEnabled();

    await expect(async () => {
      await proxima.click();
      await expect(page).toHaveURL(/[?&]page=2/);
    }).toPass({ timeout: 20_000 });

    await waitVitrineListReady(page);
    await expect(page.getByText(/Mostrando 13[\u2013-]/)).toBeVisible({ timeout: 10_000 });
    await expect(stickyPagination(page).getByText(/Página 2 de 2/)).toBeVisible();
  });

  test('último card da lista não fica sob a paginação sticky', async ({ page }) => {
    await waitVitrineListReady(page);

    const sticky = stickyPagination(page);
    await expect(sticky).toBeVisible({ timeout: 10_000 });

    const cards = vitrineCards(page);
    await expect(cards.first()).toBeVisible();
    const lastCard = cards.last();

    await page.locator('main.overflow-y-auto').evaluate((main) => {
      main.scrollTop = main.scrollHeight - main.clientHeight;
    });

    await expect
      .poll(async () => {
        const stickyBox = await sticky.boundingBox();
        const cardBox = await lastCard.boundingBox();
        if (!stickyBox || !cardBox) return false;
        return cardBox.y + cardBox.height <= stickyBox.y + 2;
      })
      .toBe(true);

    const stickyBox = await sticky.boundingBox();
    const cardBox = await lastCard.boundingBox();
    expect(stickyBox).not.toBeNull();
    expect(cardBox).not.toBeNull();
    expect(cardBox!.y + cardBox!.height).toBeLessThanOrEqual(stickyBox!.y + 2);
  });

  test('último card da lista não fica sob o BottomNav', async ({ page }) => {
    await waitVitrineListReady(page);

    const nav = bottomNav(page);
    await expect(nav).toBeVisible({ timeout: 15_000 });

    const cards = vitrineCards(page);
    await expect(cards.first()).toBeVisible();
    const lastCard = cards.last();

    await page.locator('main.overflow-y-auto').evaluate((main) => {
      main.scrollTop = main.scrollHeight - main.clientHeight;
    });

    await expect
      .poll(async () => {
        const navBox = await nav.boundingBox();
        const cardBox = await lastCard.boundingBox();
        if (!navBox || !cardBox) return false;
        return cardBox.y + cardBox.height <= navBox.y + 2;
      })
      .toBe(true);

    const navBox = await nav.boundingBox();
    const cardBox = await lastCard.boundingBox();
    expect(navBox).not.toBeNull();
    expect(cardBox).not.toBeNull();
    expect(cardBox!.y + cardBox!.height).toBeLessThanOrEqual(navBox!.y + 2);

    const notUnderNav = await page.evaluate(({ navSelector }) => {
      const navEl = document.querySelector(navSelector);
      if (!navEl) return { ok: false as const, reason: 'nav-missing' };

      const list = document.querySelector('[data-vitrine-list-ready="true"]');
      if (!list) return { ok: false as const, reason: 'list-missing' };

      const cardEls = list.querySelectorAll(':scope > div');
      const card = cardEls[cardEls.length - 1] as HTMLElement | undefined;
      if (!card) return { ok: false as const, reason: 'no-cards' };

      const rect = card.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const hit = document.elementFromPoint(x, y);
      if (!hit) return { ok: false as const, reason: 'no-hit' };

      return { ok: !navEl.contains(hit), tag: hit.tagName };
    }, { navSelector: 'nav[aria-label="Navegação rápida"]' });

    expect(notUnderNav.ok, notUnderNav.reason ?? 'card under nav').toBe(true);
  });
});
