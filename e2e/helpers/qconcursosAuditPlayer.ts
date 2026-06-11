import type { Page } from '@playwright/test';
import {
  QCONCURSOS_VITRINE_ENFERMAGEM_URL,
  gotoQConcursosAuthenticated,
} from './qconcursosAuditAuth';
import {
  dismissQConcursosOverlays,
  waitForQConcursosVitrine,
} from './qconcursosAuditVitrine';
import {
  extractQConcursosPlayerInventory,
  type QConcursosPlayerInventory,
} from './qconcursosAuditMap';

export type QConcursosPlayerCapture = {
  player: boolean;
  answered: boolean;
  url: string;
  before: QConcursosPlayerInventory;
  after: QConcursosPlayerInventory | null;
};

/** Abre vitrine enfermagem e entra na primeira questão da lista. */
export async function openQConcursosPlayerFromVitrine(page: Page): Promise<boolean> {
  const ok = await gotoQConcursosAuthenticated(page, QCONCURSOS_VITRINE_ENFERMAGEM_URL);
  if (!ok) return false;

  await waitForQConcursosVitrine(page);

  const questionLink = page
    .locator('main a[href*="/questoes-de-concursos/questoes/"]')
    .filter({ hasNot: page.getByText(/Filtrar|Meus Filtros/i) })
    .first();

  const inlineQuestion = page.locator('main').getByText(/^Q\d{5,}/i).first();
  if (await inlineQuestion.isVisible().catch(() => false)) {
    await inlineQuestion.scrollIntoViewIfNeeded();
    await dismissQConcursosOverlays(page);
    return isQConcursosQuestionScreen(page);
  }

  if (await questionLink.isVisible().catch(() => false)) {
    await questionLink.scrollIntoViewIfNeeded().catch(() => {});
    await questionLink.click({ force: true });
    await page.waitForTimeout(1_500);
    await dismissQConcursosOverlays(page);

    if (await isQConcursosQuestionScreen(page)) return true;

    try {
      await page.waitForURL(/\/questoes-de-concursos\/questoes\/[a-f0-9-]+/i, {
        timeout: 8_000,
      });
      return isQConcursosQuestionScreen(page);
    } catch {
      return isQConcursosQuestionScreen(page);
    }
  }

  return false;
}

export async function isQConcursosQuestionScreen(page: Page): Promise<boolean> {
  const main = page.locator('main');
  const onQuestionUrl = /\/questoes-de-concursos\/questoes\/[a-f0-9-]+/i.test(page.url());
  const hasQuestionId = (await main.getByText(/^Q\d{5,}/i).count()) > 0;
  const hasAlternatives =
    (await main.locator('input[type="radio"]').count()) >= 2 ||
    (await main.getByText(/^\([A-E]\)/).count()) >= 2 ||
    (await main.getByText(/^[A-E]\)/).count()) >= 2;

  return (onQuestionUrl || hasQuestionId) && hasAlternatives;
}

/** Seleciona primeira alternativa visível e confirma resposta. */
export async function tryAnswerQConcursosQuestion(page: Page): Promise<boolean> {
  if (!(await isQConcursosQuestionScreen(page))) return false;

  const main = page.locator('main');
  const radio = main.locator('input[type="radio"]').first();
  if (await radio.isVisible().catch(() => false)) {
    await radio.check({ force: true }).catch(() => radio.click({ force: true }));
  } else {
    const altParen = main.getByText(/^\([A-E]\)/).first();
    const altLabel = main.getByText(/^[A-E]\)/).first();
    if (await altParen.isVisible().catch(() => false)) {
      await altParen.click({ force: true });
    } else if (await altLabel.isVisible().catch(() => false)) {
      await altLabel.click({ force: true });
    } else {
      return false;
    }
  }

  await page.waitForTimeout(400);

  const confirmButtons = [
    page.getByRole('button', { name: /responder|confirmar|verificar|gabarito/i }).first(),
    page.locator('main input[type="submit"]').first(),
  ];

  for (const btn of confirmButtons) {
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ force: true });
      await page.waitForTimeout(1_500);
      break;
    }
  }

  const body = await page.locator('main').innerText().catch(() => '');
  return (
    /você acertou|você errou|resposta correta|gabarito|comentário/i.test(body) ||
    (await page.locator('[class*="correct"], [class*="incorrect"], [class*="answered"]').count()) > 0
  );
}

export async function captureQConcursosPlayerFlow(
  page: Page,
  outDir: string,
  viewport: 'desktop' | 'mobile',
): Promise<QConcursosPlayerCapture> {
  const suffix = viewport;
  const empty: QConcursosPlayerCapture = {
    player: false,
    answered: false,
    url: page.url(),
    before: await extractQConcursosPlayerInventory(page),
    after: null,
  };

  const opened = await openQConcursosPlayerFromVitrine(page);
  if (!opened || !(await isQConcursosQuestionScreen(page))) {
    return { ...empty, url: page.url() };
  }

  await page.screenshot({
    path: `${outDir}/T5-player-${suffix}.png`,
    fullPage: viewport === 'desktop',
  });

  const before = await extractQConcursosPlayerInventory(page);
  const answered = await tryAnswerQConcursosQuestion(page);

  let after: QConcursosPlayerInventory | null = null;
  if (answered) {
    await page.waitForTimeout(800);
    await page.screenshot({
      path: `${outDir}/T6-feedback-${suffix}.png`,
      fullPage: viewport === 'desktop',
    });
    after = await extractQConcursosPlayerInventory(page);
  }

  return {
    player: true,
    answered,
    url: page.url(),
    before,
    after,
  };
}

/** Expande menu do usuário logado para descobrir rotas extras. */
export async function openQConcursosUserMenu(page: Page): Promise<void> {
  await dismissQConcursosOverlays(page);

  const triggers = [
    page.locator('header [class*="avatar"], header [class*="user"], header img[alt*="perfil" i]').first(),
    page.getByRole('button', { name: /perfil|conta|menu/i }).first(),
    page.locator('header button:has(img)').last(),
  ];

  for (const t of triggers) {
    if (await t.isVisible().catch(() => false)) {
      await t.click({ force: true }).catch(() => {});
      await page.waitForTimeout(600);
      return;
    }
  }
}
