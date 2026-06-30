/**
 * Captura questão-review — enunciado, feedback e 4 slides.
 *
 *   npm run capture:questao-review -- --slug=...
 */
import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';

const slug = process.env.CAPTURE_QUESTAO_SLUG ?? '';
const source = process.env.CAPTURE_QUESTAO_SOURCE ?? 'local';
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

test.describe('Captura questao-review', () => {
  test.skip(!slug, 'Defina CAPTURE_QUESTAO_SLUG ou --slug no wrapper');

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
    await page.setViewportSize({ width: 1280, height: 900 });
    const url = `/dev/questao-review?slug=${encodeURIComponent(slug)}&source=${encodeURIComponent(source)}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 180_000 });
    await expect(page.getByTestId('questao-review-root')).toBeVisible({ timeout: 90_000 });

    const player = page.getByTestId('questao-review-player');
    await expect(player).toBeVisible();
    await page.waitForTimeout(800);
    await player.screenshot({ path: path.join(OUT_DIR, '01-enunciado.png'), type: 'png' });

    const correctBtn = page.locator('button.btn-option-editorial, button.btn-option').filter({
      hasText: /.+/,
    });
    const optionCount = await correctBtn.count();
    if (optionCount > 0) {
      await correctBtn.first().click();
      const confirm = page.getByRole('button', { name: /confirmar|responder/i });
      if (await confirm.isVisible({ timeout: 5000 }).catch(() => false)) {
        await confirm.click();
      }
      await page.waitForTimeout(1200);
      await player.screenshot({ path: path.join(OUT_DIR, '02-feedback.png'), type: 'png' });

      for (let i = 0; i < 4; i++) {
        const next = page.getByRole('button', { name: /próximo|continuar|avançar|tap/i }).first();
        if (await next.isVisible({ timeout: 8000 }).catch(() => false)) {
          await next.click();
          await page.waitForTimeout(600);
        }
        await player.screenshot({
          path: path.join(OUT_DIR, `0${i + 3}-slide${i + 1}.png`),
          type: 'png',
        });
      }
    }
  });
});
