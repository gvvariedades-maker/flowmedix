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

async function answerAndEnterReverseStudy(page: import('@playwright/test').Page): Promise<void> {
  const option = page.locator('button.btn-option-editorial, button.btn-option').filter({
    hasText: /.+/,
  });
  const optionCount = await option.count();
  if (optionCount === 0) return;

  await option.first().click();
  const confirm = page.getByRole('button', { name: /confirmar resposta/i });
  await expect(confirm).toBeVisible({ timeout: 10_000 });
  await confirm.click();

  await expect(page.getByText(/você acertou|você errou/i)).toBeVisible({ timeout: 15_000 });

  const activate = page.getByRole('button', { name: /ativar estudo reverso/i });
  await expect(activate).toBeVisible({ timeout: 10_000 });
  await activate.click();
  await page.waitForTimeout(800);
}

async function captureReverseStudySlides(
  page: import('@playwright/test').Page,
  player: import('@playwright/test').Locator,
): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await player.screenshot({
      path: path.join(OUT_DIR, `0${i + 3}-slide${i + 1}.png`),
      type: 'png',
    });

    if (i < 3) {
      // Rodapé do player (btn-editorial-primary); variantes logic_flow tap têm outro "Próximo" no slide.
      const next = player.locator('button.btn-editorial-primary').filter({ hasText: /^próximo/i });
      await expect(next).toBeVisible({ timeout: 10_000 });
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
    await expect(player).toBeVisible();
    await page.waitForTimeout(800);
    await player.screenshot({ path: path.join(OUT_DIR, '01-enunciado.png'), type: 'png' });

    await answerAndEnterReverseStudy(page);
    await player.screenshot({ path: path.join(OUT_DIR, '02-feedback.png'), type: 'png' });
    await captureReverseStudySlides(page, player);
  });
});
