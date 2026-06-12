import { test, expect, type Page, devices } from '@playwright/test';

/** Paginação inline e BottomNav — viewport mobile no CI (só chromium desktop). */
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
  return page.locator('nav[aria-label="Navegação rápida"]');
}

function inlinePagination(page: Page) {
  return page.getByRole('navigation', { name: 'Paginação da vitrine' });
}

function vitrineCards(page: Page) {
  return page.locator('[data-vitrine-list-ready="true"] > div');
}

function dashboardScrollMain(page: Page) {
  return page.locator('main[data-dashboard-main-scroll]');
}

async function scrollMainToBottom(page: Page) {
  await dashboardScrollMain(page).evaluate((main) => {
    main.scrollTop = main.scrollHeight - main.clientHeight;
  });
}

/** BottomNav deve permanecer colado ao rodapé físico (sem scroll manual pós-paginação). */
async function expectBottomNavAnchored(page: Page) {
  await expect
    .poll(async () => {
      const navBox = await bottomNav(page).boundingBox();
      if (!navBox) return false;
      const viewportBottom = await page.evaluate(() => {
        const vv = window.visualViewport;
        return (vv?.height ?? window.innerHeight) + (vv?.offsetTop ?? 0);
      });
      return Math.abs(navBox.y + navBox.height - viewportBottom) <= 4;
    })
    .toBe(true);
}

/**
 * Vitrine mobile — paginação inline no fim da lista e navegação ?page=2.
 * Rodar: npm run test:e2e:vitrine-pagination
 */
test.describe('Vitrine — paginação mobile inline', () => {
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

  test('não existe barra fixed de paginação', async ({ page }) => {
    await waitVitrineListReady(page);

    await expect(page.locator('nav.fixed.inset-x-0[aria-label="Paginação da vitrine"]')).toHaveCount(0);
  });

  test('paginação inline visível após rolar até o fim', async ({ page }) => {
    await waitVitrineListReady(page);

    const pagination = inlinePagination(page);
    await scrollMainToBottom(page);

    await expect(pagination).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('vitrine-pagination-pill')).toHaveText(/1 \/ \d+/);
    await expect(page.getByTestId('vitrine-pagination-prev')).toBeVisible();
    await expect(page.getByTestId('vitrine-pagination-next')).toBeVisible();
  });

  test('botões Anterior/Próxima ficam acima do BottomNav ao rolar até o fim', async ({ page }) => {
    await waitVitrineListReady(page);

    const nav = bottomNav(page);
    await expect(nav).toBeVisible({ timeout: 15_000 });
    await scrollMainToBottom(page);

    const proxima = page.getByTestId('vitrine-pagination-next');
    const anterior = page.getByTestId('vitrine-pagination-prev');
    await proxima.scrollIntoViewIfNeeded();
    await expect(proxima).toBeVisible();

    await expect
      .poll(async () => {
        const navBox = await nav.boundingBox();
        const proximaBox = await proxima.boundingBox();
        const anteriorBox = await anterior.boundingBox();
        if (!navBox || !proximaBox || !anteriorBox) return false;
        return (
          proximaBox.y + proximaBox.height <= navBox.y + 2 &&
          anteriorBox.y + anteriorBox.height <= navBox.y + 2
        );
      })
      .toBe(true);
  });

  test('Próxima navega para page=2 e atualiza contador de assuntos', async ({ page }) => {
    await waitVitrineListReady(page);
    await scrollMainToBottom(page);

    const proxima = page.getByTestId('vitrine-pagination-next');
    await expect(proxima).toBeVisible();
    await expect(page.getByTestId('vitrine-pagination-pill')).toHaveText('1 / 2');
    await expect(proxima).toBeEnabled();

    await expect(async () => {
      await proxima.click();
      await expect(page).toHaveURL(/[?&]page=2/);
    }).toPass({ timeout: 20_000 });

    await waitVitrineListReady(page);
    await expect(page.getByText(/Mostrando 13[\u2013-]/)).toBeVisible({ timeout: 10_000 });
    await expectBottomNavAnchored(page);
    await scrollMainToBottom(page);
    await expect(page.getByTestId('vitrine-pagination-pill')).toHaveText('2 / 2');
  });

  test('BottomNav permanece ancorado ao rodapé logo após Próxima (sem scroll manual)', async ({
    page,
  }) => {
    await waitVitrineListReady(page);
    await scrollMainToBottom(page);

    const proxima = page.getByTestId('vitrine-pagination-next');
    await expect(proxima).toBeVisible();
    await expect(page.getByTestId('vitrine-pagination-pill')).toHaveText(/\d+ \/ \d+/);
    await expect(proxima).toBeEnabled();

    await expect(async () => {
      await proxima.click();
      await expect(page).toHaveURL(/[?&]page=2/);
    }).toPass({ timeout: 20_000 });

    await waitVitrineListReady(page);

    await expectBottomNavAnchored(page);

    const headerBar = page
      .locator('div.sticky.top-0')
      .filter({ has: page.getByRole('button', { name: 'Abrir busca' }) });
    await expect(headerBar).toBeVisible();
    const headerBox = await headerBar.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(headerBox!.y).toBeGreaterThanOrEqual(0);
  });

  test('último card da lista não fica sob a paginação inline', async ({ page }) => {
    await waitVitrineListReady(page);

    const pagination = inlinePagination(page);
    const cards = vitrineCards(page);
    await expect(cards.first()).toBeVisible();
    const lastCard = cards.last();

    await scrollMainToBottom(page);
    await expect(pagination).toBeVisible({ timeout: 10_000 });

    await expect
      .poll(async () => {
        const paginationBox = await pagination.boundingBox();
        const cardBox = await lastCard.boundingBox();
        if (!paginationBox || !cardBox) return false;
        return cardBox.y + cardBox.height <= paginationBox.y + 2;
      })
      .toBe(true);

    const paginationBox = await pagination.boundingBox();
    const cardBox = await lastCard.boundingBox();
    expect(paginationBox).not.toBeNull();
    expect(cardBox).not.toBeNull();
    expect(cardBox!.y + cardBox!.height).toBeLessThanOrEqual(paginationBox!.y + 2);
  });

  test('último card da lista não fica sob o BottomNav', async ({ page }) => {
    await waitVitrineListReady(page);

    const nav = bottomNav(page);
    await expect(nav).toBeVisible({ timeout: 15_000 });

    const cards = vitrineCards(page);
    await expect(cards.first()).toBeVisible();
    const lastCard = cards.last();

    await scrollMainToBottom(page);

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
