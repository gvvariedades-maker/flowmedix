/**
 * Gera screenshots reais (Curativos/LPP) em public/mockups/.
 *
 *   npm run capture:hero-mockups
 *   PLAYWRIGHT_SKIP_WEBSERVER=true npm run capture:hero-mockups   # com `npm run dev` já rodando
 *   PLAYWRIGHT_PROD=true npm run capture:hero-mockups           # build + start (mais estável)
 */
import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import { HERO_CAPTURE_DPR } from '../lib/marketing/heroCaptureDimensions';

const OUT_DIR = path.join(process.cwd(), 'public/mockups');
const CAPTURE_URL = '/dev/hero-mockups';

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

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
  window.localStorage.setItem('avant:caderno-onboarding-banner-snooze-until', 'true');
};

test.describe('Captura hero mockups — Curativos/LPP', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(240_000);
  test.use({ deviceScaleFactor: HERO_CAPTURE_DPR });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Captura de mockups — rodar manualmente fora do CI');
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(onboardingDismissScript);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    ensureOutDir();
  });

  test('gera laptop, tablet e phone (retina, proporção da moldura)', async ({ page }) => {
    await page.goto(CAPTURE_URL, { waitUntil: 'domcontentloaded', timeout: 180_000 });
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => document.fonts.ready);

    const laptopScreen = page.getByTestId('hero-laptop-screen');
    await expect(laptopScreen).toBeVisible({ timeout: 90_000 });
    await expect(laptopScreen.getByText(/lesão por pressão|Curativos/i).first()).toBeVisible({
      timeout: 30_000,
    });
    await page.waitForTimeout(600);
    await laptopScreen.screenshot({ path: path.join(OUT_DIR, 'laptop-player.png'), type: 'png' });

    const tabletScreen = page.getByTestId('hero-tablet-screen');
    await expect(tabletScreen.getByText(/Prevenção de LPP|Alívio de pressão/i).first()).toBeVisible({
      timeout: 30_000,
    });
    await page.waitForTimeout(600);
    await tabletScreen.screenshot({ path: path.join(OUT_DIR, 'tablet-neuroslide.png'), type: 'png' });

    const phoneScreen = page.getByTestId('hero-phone-screen');
    await expect(phoneScreen).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(600);
    await phoneScreen.screenshot({ path: path.join(OUT_DIR, 'phone-questao.png'), type: 'png' });
  });
});
