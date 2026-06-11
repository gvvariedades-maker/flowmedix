import type { Page } from '@playwright/test';
import { GABARITA_BASE, gotoGabaritaAuthenticated } from './gabaritaAuditAuth';

/** Fecha modal "Comece por Aqui!" se estiver aberto. */
export async function dismissGabaritaOnboarding(page: Page): Promise<void> {
  const modal = page.getByRole('heading', { name: 'Comece por Aqui!' });
  if (!(await modal.isVisible().catch(() => false))) return;

  await page.getByText('Não mostrar novamente').click({ force: true }).catch(() => {});

  const dialog = page.getByRole('dialog');
  const closeAttempts = [
    () => dialog.locator('button').last().click({ force: true }),
    () => dialog.locator('button').first().click({ force: true }),
    () => page.locator('[role="dialog"] button:has(svg)').first().click({ force: true }),
    () => page.keyboard.press('Escape'),
  ];

  for (const attempt of closeAttempts) {
    try {
      await attempt();
      await page.waitForTimeout(400);
      if (!(await modal.isVisible().catch(() => false))) return;
    } catch {
      /* próxima estratégia */
    }
  }

  // Radix às vezes mantém o overlay — clique fora do vídeo
  await page.mouse.click(40, 40).catch(() => {});
  await page.waitForTimeout(300);
}

/**
 * Abre fluxo de questões a partir de /practice.
 * Prefere disciplina pequena (menos passos) com fallback para Enfermagem.
 */
export async function openGabaritaPracticeFlow(page: Page): Promise<void> {
  const ok = await gotoGabaritaAuthenticated(page, '/practice');
  if (!ok) throw new Error('Não autenticado em /practice');

  await dismissGabaritaOnboarding(page);

  const disciplinePatterns = [
    /Legislação Pública/i,
    /HU\s*Brasil|EBSERH/i,
    /Espec[ií]fica de Enfermagem/i,
    /Legislação do SUS/i,
  ];

  let opened = false;
  for (const pattern of disciplinePatterns) {
    const candidates = [
      page.getByRole('button', { name: pattern }).first(),
      page.locator('main').getByText(pattern).first(),
      page.locator('main').filter({ hasText: pattern }).locator('a, button, [role="button"]').first(),
    ];
    for (const card of candidates) {
      if (await card.isVisible().catch(() => false)) {
        await card.scrollIntoViewIfNeeded().catch(() => {});
        await card.click({ force: true });
        opened = true;
        break;
      }
    }
    if (opened) break;
  }

  if (!opened) {
    const anyDiscipline = page.locator('main').getByText(/questões/i).first();
    await anyDiscipline.scrollIntoViewIfNeeded().catch(() => {});
    await anyDiscipline.click({ force: true, timeout: 15_000 });
  }

  await page.waitForTimeout(1_500);
}

/** Avança até tela com enunciado/alternativas (player). */
export async function reachGabaritaQuestionPlayer(page: Page): Promise<boolean> {
  // Alguns fluxos: disciplina → tópico → questão
  for (let step = 0; step < 4; step++) {
    if (await isGabaritaQuestionScreen(page)) return true;

    const startBtn = page
      .getByRole('button', { name: /iniciar|começar|resolver|próxim|continuar|estudar/i })
      .first();
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click();
      await page.waitForTimeout(1_200);
      continue;
    }

    const topicCard = page
      .getByRole('button')
      .filter({ hasText: /questões|tópico|assunto|módulo/i })
      .first();
    if (await topicCard.isVisible().catch(() => false)) {
      await topicCard.click();
      await page.waitForTimeout(1_200);
      continue;
    }

    const listItem = page.locator('main a[href*="practice"], main button').first();
    if (await listItem.isVisible().catch(() => false)) {
      await listItem.click();
      await page.waitForTimeout(1_200);
      continue;
    }

    break;
  }

  return isGabaritaQuestionScreen(page);
}

export async function isGabaritaQuestionScreen(page: Page): Promise<boolean> {
  const hasAlternatives =
    (await page.getByRole('radio').count()) >= 2 ||
    (await page.locator('[role="radio"], input[type="radio"]').count()) >= 2;

  const hasQuestionText =
    (await page.locator('main p, main [class*="question"], main article').count()) > 2;

  const notPracticeGrid = !(await page
    .getByRole('heading', { name: 'Selecione uma Disciplina' })
    .isVisible()
    .catch(() => false));

  return notPracticeGrid && (hasAlternatives || hasQuestionText);
}

export async function captureGabaritaPlayerScreenshots(
  page: Page,
  outDir: string,
  viewport: 'desktop' | 'mobile',
): Promise<{ player: boolean; intermediate: boolean; path: string }> {
  const suffix = viewport;
  const intermediatePath = `${outDir}/T4-discipline-list-${suffix}.png`;
  const playerPath = `${outDir}/T5-player-${suffix}.png`;

  await openGabaritaPracticeFlow(page);

  // T4 — após escolher disciplina (lista de tópicos ou filtros)
  await page.screenshot({ path: intermediatePath, fullPage: viewport === 'desktop' });
  const intermediate = !page.url().endsWith('/practice') || (await page.url()).includes('?');

  const player = await reachGabaritaQuestionPlayer(page);
  if (player) {
    await page.screenshot({ path: playerPath, fullPage: false });
  }

  return { player, intermediate, path: page.url() };
}

export function gabaritaPlayerUrlHint(): string {
  return `${GABARITA_BASE}/practice`;
}
