/**
 * Gera screenshots reais (Curativos/LPP) em public/mockups/.
 *
 *   PLAYWRIGHT_SKIP_WEBSERVER=true npx playwright test e2e/capture-hero-mockups.spec.ts --project=chromium
 */
import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';

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

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(onboardingDismissScript);
    ensureOutDir();
  });

  test('gera laptop, tablet e phone', async ({ page }) => {
    await page.goto(CAPTURE_URL, { waitUntil: 'load', timeout: 120_000 });
    await expect(page.getByTestId('hero-laptop')).toBeVisible({ timeout: 90_000 });
    await page.waitForTimeout(2500);

    const laptop = page.getByTestId('hero-laptop');
    await laptop.screenshot({ path: path.join(OUT_DIR, 'laptop-player.png') });

    const tablet = page.getByTestId('hero-tablet');
    await expect(tablet.getByText(/Prevenção de LPP|MAPA/i).first()).toBeVisible({
      timeout: 30_000,
    });
    await tablet.screenshot({ path: path.join(OUT_DIR, 'tablet-neuroslide.png') });

    const phone = page.getByTestId('hero-phone');
    await phone.screenshot({ path: path.join(OUT_DIR, 'phone-questao.png') });
  });
});
