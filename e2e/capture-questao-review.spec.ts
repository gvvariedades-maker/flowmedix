/**
 * Captura questão-review — enunciado, feedback e 4 slides NeuroSlides.
 *
 *   npm run capture:questao-review -- --slug=...
 *   npm run capture:questao-review -- --lote=imunizacao-g07
 *   npm run capture:questao-review -- --anchor-key=calendario_infantil --anchors-registry=data/catalog-migration/imunizacao-golden-anchors.json
 */
import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';

const slug = process.env.CAPTURE_QUESTAO_SLUG ?? '';
const source = process.env.CAPTURE_QUESTAO_SOURCE ?? 'local';
const viewportPreset = process.env.CAPTURE_QUESTAO_VIEWPORT ?? 'desktop';
const OUT_DIR =
  process.env.CAPTURE_QUESTAO_OUT_DIR ??
  path.join(process.cwd(), 'artifacts/questao-review', slug || 'unknown');

const onboardingDismissScript = () => {
  const microtipKeys = [
    'reverse-study.option-elimination',
    'reverse-study.answer-before-feedback',
    'reverse-study.feedback-learning',
    'reverse-study.reverse-study-intro',
    'reverse-study.dots-meaning',
    'reverse-study.concept-map',
    'reverse-study.golden-rule',
    'reverse-study.logic-flow',
    'reverse-study.danger-zone',
    'reverse-study.study-completed',
  ];
  for (const key of microtipKeys) {
    window.localStorage.setItem(`avant.microtip.${key}`, 'true');
  }
  window.localStorage.setItem('avant-estudo-reverso-welcome-seen', 'true');
};

type PlaywrightPage = import('@playwright/test').Page;
type PlaywrightLocator = import('@playwright/test').Locator;

/** Overlay do estudo reverso (preview: absolute z-30; live: fixed). */
function getReverseStudyShell(player: PlaywrightLocator): PlaywrightLocator {
  return player.locator('div.z-30.flex.flex-col.overflow-hidden').first();
}

/** Completa interações in-slide (logic_flow tap, danger_zone compare) antes do screenshot. */
async function advanceInSlideInteractions(shell: PlaywrightLocator, page: PlaywrightPage): Promise<void> {
  for (let attempt = 0; attempt < 24; attempt++) {
    const tapNext = shell.locator('button.bg-sky-500').first();
    if (await tapNext.isVisible().catch(() => false)) {
      if (await tapNext.isEnabled().catch(() => false)) {
        await tapNext.click();
        await page.waitForTimeout(250);
        continue;
      }
    }

    const stepBtn = shell.getByRole('button', { name: /próximo passo/i }).first();
    const stepVisible = await stepBtn.isVisible().catch(() => false);
    const stepEnabled = stepVisible ? await stepBtn.isEnabled().catch(() => false) : false;
    if (!stepVisible || !stepEnabled) break;
    await stepBtn.click();
    await page.waitForTimeout(250);
  }

  for (let attempt = 0; attempt < 12; attempt++) {
    const revealBtn = shell
      .locator('button')
      .filter({ hasText: /toque para ver/i })
      .first();
    if (!(await revealBtn.isVisible().catch(() => false))) break;
    if (!(await revealBtn.isEnabled().catch(() => false))) break;
    await revealBtn.click();
    await page.waitForTimeout(250);
  }

  for (let attempt = 0; attempt < 8; attempt++) {
    const trapBtn = shell.locator('button[aria-expanded="false"]').first();
    if (!(await trapBtn.isVisible().catch(() => false))) break;
    await trapBtn.click();
    await page.waitForTimeout(250);
  }
}

async function answerQuestion(page: PlaywrightPage, player: PlaywrightLocator): Promise<void> {
  const option = player.getByRole('radio').first();
  await expect(option).toBeVisible({ timeout: 90_000 });
  await option.click();

  const confirm = player.getByRole('button', { name: /confirmar resposta/i });
  await expect(confirm).toBeVisible({ timeout: 15_000 });
  await confirm.click();
  await expect(player.getByText(/você acertou|você errou/i)).toBeVisible({ timeout: 15_000 });
}

async function enterReverseStudy(page: PlaywrightPage, player: PlaywrightLocator): Promise<PlaywrightLocator> {
  const activate = player.getByRole('button', { name: /ativar estudo reverso/i });
  await expect(activate).toBeVisible({ timeout: 10_000 });
  await activate.click();

  const shell = getReverseStudyShell(player);
  await expect(shell).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(500);
  return shell;
}

function getStudyFooterNextButton(player: PlaywrightLocator): PlaywrightLocator {
  return player
    .locator('button.btn-editorial-primary')
    .filter({ hasText: /^Próximo/i })
    .filter({ hasNotText: /questão/i });
}
async function captureReverseStudySlides(
  page: PlaywrightPage,
  player: PlaywrightLocator,
  shell: PlaywrightLocator,
): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await advanceInSlideInteractions(shell, page);
    await shell.scrollIntoViewIfNeeded();
    await shell.screenshot({
      path: path.join(OUT_DIR, `0${i + 3}-slide${i + 1}.png`),
      type: 'png',
    });

    if (i < 3) {
      const next = getStudyFooterNextButton(player);
      await expect(next).toBeVisible({ timeout: 15_000 });
      await next.click();
      await page.waitForTimeout(700);
    }
  }
}

test.describe('Captura questao-review', () => {
  test.skip(!slug, 'Defina CAPTURE_QUESTAO_SLUG ou --slug/--lote no wrapper');

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Capture questao-review — manual/nightly');
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(onboardingDismissScript);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    fs.mkdirSync(OUT_DIR, { recursive: true });
  });

  test(`captura ${slug}`, async ({ page }) => {
    test.setTimeout(300_000);

    const viewport =
      viewportPreset === 'mobile-375'
        ? { width: 375, height: 812 }
        : { width: 1280, height: 900 };
    await page.setViewportSize(viewport);

    const url = `/dev/questao-review?slug=${encodeURIComponent(slug)}&source=${encodeURIComponent(source)}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180_000 });
    await expect(page.getByTestId('questao-review-root')).toBeVisible({ timeout: 90_000 });

    const player = page.getByTestId('questao-review-player');
    await expect(player).toBeVisible({ timeout: 90_000 });
    await expect(player.getByRole('radio').first()).toBeVisible({ timeout: 90_000 });
    await page.waitForTimeout(400);
    await player.screenshot({ path: path.join(OUT_DIR, '01-enunciado.png'), type: 'png' });

    await answerQuestion(page, player);
    await player.screenshot({ path: path.join(OUT_DIR, '02-feedback.png'), type: 'png' });

    const studyShell = await enterReverseStudy(page, player);
    await captureReverseStudySlides(page, player, studyShell);
  });
});
