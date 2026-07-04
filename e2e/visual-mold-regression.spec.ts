/**
 * e2e/visual-mold-regression.spec.ts — snapshot L3 por pedagogical_branch.
 *
 *   npm run test:e2e:visual-molds
 *   PLAYWRIGHT_SKIP_WEBSERVER=true npm run test:e2e:visual-molds
 */
import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import {
  assertSlidePanelsLegibleAt375,
  DESKTOP_VIEWPORT,
  expectSlidePanels,
  gotoBranch,
  loadAnchorFooterRules,
  loadVisualAnchors,
  MOBILE_NARROW_VIEWPORT,
  onboardingDismissScript,
  PNI_IMUNIZACAO_BRANCHES,
  VIAS_BRANCHES,
  screenshotSlidePanels,
  SLIDE_COUNT,
  writeVisualMoldSummary,
} from './helpers/visualMoldE2e';

const OUT_DIR = path.join(process.cwd(), 'artifacts/visual-mold-regression');

function loadBranches(): string[] {
  return Object.keys(loadVisualAnchors());
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
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
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

test.describe('PNI Imunização — 4 moldes bespoke', () => {
  test.describe.configure({ mode: 'parallel', timeout: 120_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression PNI — nightly/manual only');
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

  const anchors = loadVisualAnchors();

  for (const branch of PNI_IMUNIZACAO_BRANCHES) {
    test(`PNI ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`PNI ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('PNI imunizacao_cadeia_frio — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'imunizacao_cadeia_frio';
    const anchor = anchors[branch];
    const footerRules = loadAnchorFooterRules(anchor.json_path);

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await assertSlidePanelsLegibleAt375(page, footerRules);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });
});

test.describe('Vias de Administração — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Vias — nightly/manual only');
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

  for (const branch of VIAS_BRANCHES) {
    test(`Vias ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Vias ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Vias via_vf_absorcao — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'via_vf_absorcao';

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await expectSlidePanels(page);

    const panel = page.getByTestId('mold-slide-1');
    await panel.scrollIntoViewIfNeeded();
    const overflowX = await panel.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(overflowX).toBe(false);
    const text = (await panel.innerText()).toLowerCase();
    expect(text).toContain('trilho');
    expect(text).toMatch(/subcut|sc/);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Vias — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'vias-de-administracao',
      branches: VIAS_BRANCHES,
      pass: true,
      detail: `Playwright L3 Vias — ${VIAS_BRANCHES.length} branches (desktop + mobile-375 + DoD via_vf_absorcao); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('vias-de-administracao');
  });
});
