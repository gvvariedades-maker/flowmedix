import { expect, type Page } from '@playwright/test';

/** Fecha cookie banner, top-bar promocional e modais de upsell sem falhar a suíte. */
export async function dismissQConcursosOverlays(page: Page): Promise<void> {
  const cookieAccept = page.getByRole('button', {
    name: /aceitar|concordo|entendi|ok/i,
  });
  if (await cookieAccept.first().isVisible().catch(() => false)) {
    await cookieAccept.first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(400);
  }

  const modalTitles = [/conteúdo sensível/i, /quer mais performance/i, /vire elite/i];
  for (const pattern of modalTitles) {
    if (await page.getByText(pattern).first().isVisible().catch(() => false)) {
      const closeInModal = page
        .locator('[role="dialog"] button, [class*="modal"] button, main ~ div button')
        .filter({ has: page.locator('svg, [class*="close"]') })
        .first();
      if (await closeInModal.isVisible().catch(() => false)) {
        await closeInModal.click({ force: true }).catch(() => {});
      } else {
        await page.keyboard.press('Escape').catch(() => {});
      }
      await page.waitForTimeout(400);
    }
  }

  for (let i = 0; i < 4; i++) {
    const close = page
      .locator(
        '[aria-label*="fechar" i], [aria-label*="close" i], button[class*="close"], [data-dismiss="modal"]',
      )
      .first();
    if (!(await close.isVisible().catch(() => false))) break;
    await close.click({ force: true }).catch(() => {});
    await page.waitForTimeout(350);
  }

  const footerDismiss = page
    .locator('body > div')
    .filter({ hasText: /Plano AVANÇADO|VER PLANOS E PREÇOS/i })
    .locator('button')
    .last();
  if (await footerDismiss.isVisible().catch(() => false)) {
    await footerDismiss.click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);
  }

  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(200);
}

/** Aguarda painel de filtros + contagem de questões (vitrine carregada). */
export async function waitForQConcursosVitrine(page: Page): Promise<void> {
  await dismissQConcursosOverlays(page);

  await expect(page).toHaveURL(/questoes-de-concursos\/questoes/, { timeout: 30_000 });
  await expect(page.getByText(/Foram encontradas|questões encontradas/i).first()).toBeVisible({
    timeout: 30_000,
  });

  // QC duplica rótulos no drawer mobile (hidden no desktop) — escopo em <main>.
  const main = page.locator('main');
  await expect(
    main
      .getByRole('button', { name: /^Filtrar$/i })
      .or(main.getByText(/^Disciplina$/i))
      .first(),
  ).toBeVisible({ timeout: 30_000 });

  await page.waitForTimeout(600);
}

/** No mobile, rola até o bloco de filtros horizontais (já visível na LP de questões). */
export async function openQConcursosMobileFilters(page: Page): Promise<void> {
  const discipline = page.locator('main').getByText(/^Disciplina$/i).first();
  if (await discipline.isVisible().catch(() => false)) {
    await discipline.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
  }
}

/** Primeira questão da lista — útil para T4 (card expandido). */
export async function openFirstQConcursosQuestion(page: Page): Promise<boolean> {
  await waitForQConcursosVitrine(page);

  const questionLink = page
    .locator('a[href*="/questoes-de-concursos/questoes/"]')
    .filter({ hasNot: page.locator('text=/Filtrar|Meus Filtros/i') })
    .first();

  if (!(await questionLink.isVisible().catch(() => false))) return false;

  await questionLink.click({ force: true });
  await page.waitForURL(/\/questoes-de-concursos\/questoes\//, { timeout: 30_000 });
  await dismissQConcursosOverlays(page);
  await page.waitForTimeout(800);
  return true;
}
