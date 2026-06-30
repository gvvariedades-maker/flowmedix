/**
 * e2e/visual-mold-regression.spec.ts — snapshot L3 por pedagogical_branch.
 *
 *   npm run test:e2e -- e2e/visual-mold-regression.spec.ts
 *   PLAYWRIGHT_SKIP_WEBSERVER=true npm run test:e2e -- e2e/visual-mold-regression.spec.ts --project=chromium
 */
import fs from 'fs';
import path from 'path';
import { test, expect, type Page } from '@playwright/test';

const OUT_DIR = path.join(process.cwd(), 'artifacts/visual-mold-regression');
const ANCHORS_PATH = path.join(process.cwd(), 'data/catalog-migration/visual-anchors.json');
const SLIDE_COUNT = 4;

type AnchorEntry = { pedagogical_branch: string };

function loadBranches(): string[] {
  const raw = JSON.parse(fs.readFileSync(ANCHORS_PATH, 'utf8')) as {
    anchors: Record<string, AnchorEntry>;
  };
  return Object.keys(raw.anchors);
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
};

async function gotoBranch(page: Page, branch: string): Promise<void> {
  await page.goto(`/dev/slide-mold-review?branch=${encodeURIComponent(branch)}`, {
    waitUntil: 'domcontentloaded',
    timeout: 120_000,
  });
  await expect(page.getByTestId('slide-mold-review-root')).toBeVisible({ timeout: 60_000 });
  // AvantLessonPlayer é dynamic(ssr:false) — aguardar hidratação antes de interagir com mold-slide-*.
  await expect(page.getByTestId('mold-player').getByTestId('lesson-scroll-body').first()).toBeVisible({
    timeout: 90_000,
  });
}

async function expectSlidePanels(page: Page): Promise<void> {
  for (let i = 1; i <= SLIDE_COUNT; i++) {
    await expect(page.getByTestId(`mold-slide-${i}`)).toBeVisible({ timeout: 30_000 });
  }
  for (let i = 1; i <= SLIDE_COUNT; i++) {
    await page.getByTestId(`mold-slide-${i}`).scrollIntoViewIfNeeded();
  }
}

test.describe('Visual mold regression — L3 branches', () => {
  test.describe.configure({ mode: 'parallel', timeout: 120_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression — nightly/manual only');
    }
  });

  test.beforeEach(async ({ page, browserName }) => {
    if (!process.env.CI && browserName !== 'chromium' && process.env.VISUAL_MOLD_ALL_BROWSERS !== 'true') {
      test.skip();
    }
    await page.addInitScript(onboardingDismissScript);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    fs.mkdirSync(OUT_DIR, { recursive: true });
  });

  for (const branch of loadBranches()) {
    test(`branch ${branch} — desktop slides`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await gotoBranch(page, branch);
      await expectSlidePanels(page);

      for (let i = 1; i <= SLIDE_COUNT; i++) {
        const panel = page.getByTestId(`mold-slide-${i}`);
        await expect(panel).toBeVisible({ timeout: 30_000 });
        await panel.scrollIntoViewIfNeeded();
        const out = path.join(OUT_DIR, `${branch}-desktop-slide${i}.png`);
        await panel.screenshot({ path: out, type: 'png' });
      }
    });

    test(`branch ${branch} — mobile player`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await gotoBranch(page, branch);
      const player = page.getByTestId('mold-player');
      await expect(player.getByTestId('lesson-scroll-body').first()).toBeVisible({ timeout: 90_000 });
      await player.scrollIntoViewIfNeeded();
      await player.screenshot({
        path: path.join(OUT_DIR, `${branch}-mobile-player.png`),
        type: 'png',
      });
    });
  }
});
