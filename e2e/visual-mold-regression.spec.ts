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
  PNI_BESPOKE_BRANCHES,
  CAM_BRANCHES,
  CAM_BESPOKE_BRANCHES,
  PUNCAO_BRANCHES,
  PUNCAO_BESPOKE_BRANCHES,
  SAUDE_MULHER_BRANCHES,
  CRIANCA_BRANCHES,
  SINAIS_VITAIS_BRANCHES,
  URGENCIAS_BRANCHES,
  VIAS_BRANCHES,
  ADOLESCENTE_BRANCHES,
  PT_CRASE_BRANCHES,
  PT_CRASE_BESPOKE_BRANCHES,
  PT_CLITIC_BRANCHES,
  PT_CLITIC_BESPOKE_BRANCHES,
  PT_TERMOS_BRANCHES,
  PT_TERMOS_BESPOKE_BRANCHES,
  FARMACO_BRANCHES,
  FARMACO_BESPOKE_BRANCHES,
  CALCULO_BRANCHES,
  CALCULO_BESPOKE_BRANCHES,
  RESPIRATORIO_BRANCHES,
  RESPIRATORIO_BESPOKE_BRANCHES,
  MENTAL_BRANCHES,
  MENTAL_BESPOKE_BRANCHES,
  PERIOPERATORIA_BRANCHES,
  PERIOPERATORIA_BESPOKE_BRANCHES,
  SAE_BRANCHES,
  SAE_BESPOKE_BRANCHES,
  FERIDAS_BRANCHES,
  FERIDAS_BESPOKE_BRANCHES,
  CURATIVOS_BRANCHES,
  CURATIVOS_BESPOKE_BRANCHES,
  PROCESSAMENTO_BRANCHES,
  PROCESSAMENTO_BESPOKE_BRANCHES,
  CME_BRANCHES,
  CME_BESPOKE_BRANCHES,
  HISTORIA_BRANCHES,
  HISTORIA_BESPOKE_BRANCHES,
  TRABALHO_BRANCHES,
  TRABALHO_BESPOKE_BRANCHES,
  SEGURANCA_BRANCHES,
  SEGURANCA_BESPOKE_BRANCHES,
  PROMOCAO_BRANCHES,
  PROMOCAO_BESPOKE_BRANCHES,
  BIOSSEG_BRANCHES,
  BIOSSEG_BESPOKE_BRANCHES,
  BACTERIANAS_BRANCHES,
  BACTERIANAS_BESPOKE_BRANCHES,
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
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

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

  test('PNI — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'imunizacao',
      branches: PNI_IMUNIZACAO_BRANCHES,
      pass: true,
      detail: `Playwright L3 PNI — ${PNI_IMUNIZACAO_BRANCHES.length} branches (${PNI_BESPOKE_BRANCHES.length} bespoke + genérico/exceto); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('imunizacao');
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

test.describe('Língua Portuguesa — Crase moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression PT Crase — nightly/manual only');
    }
  });

  test.beforeEach(async ({ page, browserName }) => {
    if (!browserName.includes('chromium') && process.env.VISUAL_MOLD_ALL_BROWSERS !== 'true') {
      test.skip();
    }
    await page.addInitScript(onboardingDismissScript);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    fs.mkdirSync(OUT_DIR, { recursive: true });
  });

  const anchors = loadVisualAnchors();

  for (const branch of PT_CRASE_BRANCHES) {
    test(`PT Crase ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`PT Crase ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  for (const branch of PT_CLITIC_BRANCHES) {
    test(`PT Colocação ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`PT Colocação ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('PT Crase pt_crase — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'pt_crase';
    const anchor = anchors[branch];
    const footerRules = loadAnchorFooterRules(anchor.json_path);

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await assertSlidePanelsLegibleAt375(page, footerRules);
    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('PT Colocação pt_pronomes_colocacao — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'pt_pronomes_colocacao';
    const anchor = anchors[branch];
    const footerRules = loadAnchorFooterRules(anchor.json_path);

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await assertSlidePanelsLegibleAt375(page, footerRules);
    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Língua Portuguesa — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'lingua-portuguesa',
      branches: [...PT_CRASE_BRANCHES, ...PT_CLITIC_BRANCHES],
      pass: true,
      detail: `Playwright L3 PT — Crase ${PT_CRASE_BRANCHES.length} (${PT_CRASE_BESPOKE_BRANCHES.length} funil) + Colocação ${PT_CLITIC_BRANCHES.length} (${PT_CLITIC_BESPOKE_BRANCHES.length} trilho); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('lingua-portuguesa');
  });
});

test.describe('Termos da oração — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression PT Termos — nightly/manual only');
    }
  });

  test.beforeEach(async ({ page, browserName }) => {
    if (!browserName.includes('chromium') && process.env.VISUAL_MOLD_ALL_BROWSERS !== 'true') {
      test.skip();
    }
    await page.addInitScript(onboardingDismissScript);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    fs.mkdirSync(OUT_DIR, { recursive: true });
  });

  const anchors = loadVisualAnchors();

  for (const branch of PT_TERMOS_BRANCHES) {
    test(`PT Termos ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`PT Termos ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('PT Termos pt_termos_oracao — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'pt_termos_oracao';
    const anchor = anchors[branch];
    const footerRules = loadAnchorFooterRules(anchor.json_path);

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await assertSlidePanelsLegibleAt375(page, footerRules);
    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Termos da oração — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'termos-oracao',
      branches: [...PT_TERMOS_BRANCHES],
      pass: true,
      detail: `Playwright L3 PT Termos — ${PT_TERMOS_BRANCHES.length} branches (${PT_TERMOS_BESPOKE_BRANCHES.length} matriz pt-term-matrix 4/4); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('termos-oracao');
  });
});

test.describe('Saúde do Adolescente — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Adolescente — nightly/manual only');
    }
  });

  test.beforeEach(async ({ page, browserName }) => {
    if (!browserName.includes('chromium') && process.env.VISUAL_MOLD_ALL_BROWSERS !== 'true') {
      test.skip();
    }
    await page.addInitScript(onboardingDismissScript);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    fs.mkdirSync(OUT_DIR, { recursive: true });
  });

  for (const branch of ADOLESCENTE_BRANCHES) {
    test(`Adolescente ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Adolescente ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Adolescente — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'saude-adolescente',
      branches: ADOLESCENTE_BRANCHES,
      pass: true,
      detail: `Playwright L3 Adolescente — ${ADOLESCENTE_BRANCHES.length} branches (desktop + mobile-375); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('saude-adolescente');
  });
});

test.describe('Verificação de Sinais Vitais — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression SV — nightly/manual only');
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

  for (const branch of SINAIS_VITAIS_BRANCHES) {
    test(`SV ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`SV ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('SV vitals_pa_tecnica — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'vitals_pa_tecnica';

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await expectSlidePanels(page);

    const panel = page.getByTestId('mold-slide-1');
    await panel.scrollIntoViewIfNeeded();
    const overflowX = await panel.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(overflowX).toBe(false);
    const text = (await panel.innerText()).toLowerCase();
    expect(text).toMatch(/press[aã]o|manguito|aferi/);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('SV — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'sinais-vitais',
      branches: SINAIS_VITAIS_BRANCHES,
      pass: true,
      detail: `Playwright L3 SV — ${SINAIS_VITAIS_BRANCHES.length} branches (desktop + mobile-375 + DoD vitals_pa_tecnica); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('sinais-vitais');
  });
});

test.describe('Urgências e Emergências — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Urgências — nightly/manual only');
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

  for (const branch of URGENCIAS_BRANCHES) {
    test(`Urgências ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Urgências ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Urgências urgencias_rcp_sbv — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'urgencias_rcp_sbv';
    const anchor = anchors[branch];
    const footerRules = loadAnchorFooterRules(anchor.json_path);

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await assertSlidePanelsLegibleAt375(page, footerRules);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Urgências — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'urgencias',
      branches: URGENCIAS_BRANCHES,
      pass: true,
      detail: `Playwright L3 Urgências — ${URGENCIAS_BRANCHES.length} branches (desktop + mobile-375 + DoD urgencias_rcp_sbv); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('urgencias');
  });
});

test.describe('Saúde da Mulher — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Saúde da Mulher — nightly/manual only');
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

  for (const branch of SAUDE_MULHER_BRANCHES) {
    test(`Saúde da Mulher ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Saúde da Mulher ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Saúde da Mulher mulher_prenatal — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'mulher_prenatal';
    const anchor = anchors[branch];
    const footerRules = loadAnchorFooterRules(anchor.json_path);

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await assertSlidePanelsLegibleAt375(page, footerRules);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Saúde da Mulher — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'saude-da-mulher',
      branches: SAUDE_MULHER_BRANCHES,
      pass: true,
      detail: `Playwright L3 Saúde da Mulher — ${SAUDE_MULHER_BRANCHES.length} branches (desktop + mobile-375 + DoD mulher_prenatal); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('saude-da-mulher');
  });
});

test.describe('Saúde da Criança — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Saúde da Criança — nightly/manual only');
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

  for (const branch of CRIANCA_BRANCHES) {
    test(`Saúde da Criança ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Saúde da Criança ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Saúde da Criança crianca_aleitamento_nutricao — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'crianca_aleitamento_nutricao';
    const anchor = anchors[branch];
    const footerRules = loadAnchorFooterRules(anchor.json_path);

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await assertSlidePanelsLegibleAt375(page, footerRules);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Saúde da Criança — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'saude-da-crianca',
      branches: CRIANCA_BRANCHES,
      pass: true,
      detail: `Playwright L3 Saúde da Criança — ${CRIANCA_BRANCHES.length} branches (desktop + mobile-375 + DoD crianca_aleitamento_nutricao); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('saude-da-crianca');
  });
});

test.describe('CAM Cuidados na Administração — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression CAM — nightly/manual only');
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

  for (const branch of CAM_BRANCHES) {
    test(`CAM ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`CAM ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('CAM cam_alto_risco — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'cam_alto_risco';
    const anchor = anchors[branch];
    const footerRules = loadAnchorFooterRules(anchor.json_path);

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await assertSlidePanelsLegibleAt375(page, footerRules);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('CAM — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'cuidados-na-administracao-de-medicamentos',
      branches: CAM_BRANCHES,
      pass: true,
      detail: `Playwright L3 CAM — ${CAM_BRANCHES.length} branches (${CAM_BESPOKE_BRANCHES.length} bespoke + genérico); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('cuidados-na-administracao-de-medicamentos');
  });
});

test.describe('Visual mold regression — Punção Venosa', () => {
  test.describe.configure({ mode: 'serial', timeout: 120_000 });
  const OUT_DIR = path.join(process.cwd(), 'artifacts/visual-mold-regression');

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Punção — nightly/manual only');
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

  for (const branch of PUNCAO_BRANCHES) {
    test(`Punção ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Punção ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Punção puncao_flebite — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'puncao_flebite';
    const anchor = anchors[branch];
    const footerRules = loadAnchorFooterRules(anchor.json_path);

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await assertSlidePanelsLegibleAt375(page, footerRules);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Punção — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'puncao-venosa-e-cuidados-com-cateteres',
      branches: PUNCAO_BRANCHES,
      pass: true,
      detail: `Playwright L3 Punção — ${PUNCAO_BRANCHES.length} branches (${PUNCAO_BESPOKE_BRANCHES.length} bespoke + genérico); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('puncao-venosa-e-cuidados-com-cateteres');
  });
});

test.describe('Farmacodinâmica e Farmacocinética — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Farmacodinâmica — nightly/manual only');
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

  for (const branch of FARMACO_BRANCHES) {
    test(`Farmacodinâmica ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Farmacodinâmica ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Farmacodinâmica farmaco_clinico_protocolo — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'farmaco_clinico_protocolo';
    const anchor = anchors[branch];
    const footerRules = loadAnchorFooterRules(anchor.json_path);

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await assertSlidePanelsLegibleAt375(page, footerRules);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Farmacodinâmica — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'farmacodinamica-e-farmacocinetica',
      branches: FARMACO_BRANCHES,
      pass: true,
      detail: `Playwright L3 Farmacodinâmica — ${FARMACO_BRANCHES.length} branches (${FARMACO_BESPOKE_BRANCHES.length} bespoke + genérico); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('farmacodinamica-e-farmacocinetica');
  });
});

test.describe('Cálculo de Administração de Medicamentos e Infusões — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Cálculo — nightly/manual only');
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

  for (const branch of CALCULO_BRANCHES) {
    test(`Cálculo ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Cálculo ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Cálculo calc_dose_equivalencia — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'calc_dose_equivalencia';
    const anchors = loadVisualAnchors();
    const anchor = anchors[branch];
    const footerRules = loadAnchorFooterRules(anchor.json_path);

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await assertSlidePanelsLegibleAt375(page, footerRules);
    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Cálculo — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'calculo-de-administracao-de-medicamentos-e-infusoes',
      branches: CALCULO_BRANCHES,
      pass: true,
      detail: `Playwright L3 Cálculo — ${CALCULO_BRANCHES.length} branches (${CALCULO_BESPOKE_BRANCHES.length} bespoke + genérico); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('calculo-de-administracao-de-medicamentos-e-infusoes');
  });
});

test.describe('Doenças Respiratórias Crônicas — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Respiratório — nightly/manual only');
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

  for (const branch of RESPIRATORIO_BRANCHES) {
    test(`Respiratório ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Respiratório ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Respiratório respiratorio_dpoc_oxigenio — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'respiratorio_dpoc_oxigenio';

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await expectSlidePanels(page);

    const panel = page.getByTestId('mold-slide-1');
    await panel.scrollIntoViewIfNeeded();
    const overflowX = await panel.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(overflowX).toBe(false);
    const text = (await panel.innerText()).toLowerCase();
    expect(text).toMatch(/dpoc|asma|spo2|oxig/i);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Respiratório — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'respiratorio-cronico',
      branches: RESPIRATORIO_BRANCHES,
      pass: true,
      detail: `Playwright L3 Respiratório — ${RESPIRATORIO_BRANCHES.length} branches (${RESPIRATORIO_BESPOKE_BRANCHES.length} bespoke); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('respiratorio-cronico');
  });
});

test.describe('Infecções no Contexto da Biossegurança — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Biossegurança — nightly/manual only');
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

  for (const branch of BIOSSEG_BRANCHES) {
    test(`Biossegurança ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Biossegurança ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Biossegurança biosseg_iras_itu_cateter — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'biosseg_iras_itu_cateter';

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await expectSlidePanels(page);

    const panel = page.getByTestId('mold-slide-1');
    await panel.scrollIntoViewIfNeeded();
    const overflowX = await panel.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(overflowX).toBe(false);
    const text = (await panel.innerText()).toLowerCase();
    expect(text).toMatch(/itu|cateter|iras|bundle|meato/i);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Biossegurança — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'infeccoes-biosseguranca',
      branches: BIOSSEG_BRANCHES,
      pass: true,
      detail: `Playwright L3 Infecções Biossegurança — ${BIOSSEG_BRANCHES.length} branches (${BIOSSEG_BESPOKE_BRANCHES.length} bespoke); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('infeccoes-biosseguranca');
  });
});

test.describe('Doenças Bacterianas — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Bacterianas — nightly/manual only');
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

  for (const branch of BACTERIANAS_BRANCHES) {
    test(`Bacterianas ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Bacterianas ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Bacterianas bacterianas_tuberculose — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'bacterianas_tuberculose';

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await expectSlidePanels(page);

    const panel = page.getByTestId('mold-slide-1');
    await panel.scrollIntoViewIfNeeded();
    const overflowX = await panel.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(overflowX).toBe(false);
    const text = (await panel.innerText()).toLowerCase();
    expect(text).toMatch(/tubercul|baar|notifica|aeross|precau/i);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Bacterianas bacterianas_agente_etiologico — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'bacterianas_agente_etiologico';

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await expectSlidePanels(page);

    const panel = page.getByTestId('mold-slide-1');
    await panel.scrollIntoViewIfNeeded();
    const overflowX = await panel.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(overflowX).toBe(false);
    const text = (await panel.innerText()).toLowerCase();
    expect(text).toMatch(/bacteri|vírus|fungo|etiolog|reino|intruso/i);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Bacterianas — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'doencas-bacterianas',
      branches: BACTERIANAS_BRANCHES,
      pass: true,
      detail: `Playwright L3 Doenças Bacterianas — ${BACTERIANAS_BRANCHES.length} branches (${BACTERIANAS_BESPOKE_BRANCHES.length} bespoke); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('doencas-bacterianas');
  });
});

test.describe('Saúde Mental — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Saúde Mental — nightly/manual only');
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

  for (const branch of MENTAL_BRANCHES) {
    test(`Saúde Mental ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Saúde Mental ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Saúde Mental mental_crise_caps — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'mental_crise_caps';

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await expectSlidePanels(page);

    const panel = page.getByTestId('mold-slide-1');
    await panel.scrollIntoViewIfNeeded();
    const overflowX = await panel.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(overflowX).toBe(false);
    const text = (await panel.innerText()).toLowerCase();
    expect(text).toMatch(/crise|caps|acolh|conten|agita|exceto|psicomot/i);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Saúde Mental — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'saude-mental',
      branches: MENTAL_BRANCHES,
      pass: true,
      detail: `Playwright L3 Saúde Mental — ${MENTAL_BRANCHES.length} branches (${MENTAL_BESPOKE_BRANCHES.length} bespoke); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('saude-mental');
  });
});

test.describe('Assistência Perioperatória — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Perioperatória — nightly/manual only');
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

  for (const branch of PERIOPERATORIA_BRANCHES) {
    test(`Perioperatória ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Perioperatória ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Perioperatória perioperatorio_pos_operatorio — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'perioperatorio_pos_operatorio';

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await expectSlidePanels(page);

    const panel = page.getByTestId('mold-slide-1');
    await panel.scrollIntoViewIfNeeded();
    const overflowX = await panel.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(overflowX).toBe(false);
    const text = (await panel.innerText()).toLowerCase();
    expect(text).toMatch(/srpa|aldrete|p[oó]s|monitor|recupera/i);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Perioperatória — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'perioperatoria',
      branches: PERIOPERATORIA_BRANCHES,
      pass: true,
      detail: `Playwright L3 Perioperatória — ${PERIOPERATORIA_BRANCHES.length} branches (${PERIOPERATORIA_BESPOKE_BRANCHES.length} bespoke); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('perioperatoria');
  });
});

test.describe('Processo de Enfermagem — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Processo de Enfermagem — nightly/manual only');
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

  for (const branch of SAE_BRANCHES) {
    test(`Processo de Enfermagem ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Processo de Enfermagem ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Processo de Enfermagem sae_documentacao — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'sae_documentacao';

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await expectSlidePanels(page);

    const panel = page.getByTestId('mold-slide-1');
    await panel.scrollIntoViewIfNeeded();
    const overflowX = await panel.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(overflowX).toBe(false);
    const text = (await panel.innerText()).toLowerCase();
    expect(text).toMatch(/anota|documenta|prontu|registro|soapi/i);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Processo de Enfermagem — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'processo-de-enfermagem',
      branches: SAE_BRANCHES,
      pass: true,
      detail: `Playwright L3 Processo de Enfermagem — ${SAE_BRANCHES.length} branches (${SAE_BESPOKE_BRANCHES.length} bespoke); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('processo-de-enfermagem');
  });
});

test.describe('Curativos e Manejo de Feridas — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Curativos — nightly/manual only');
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

  for (const branch of CURATIVOS_BRANCHES) {
    test(`Curativos ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Curativos ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Curativos — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'curativos-e-manejo-de-feridas',
      branches: CURATIVOS_BRANCHES,
      pass: true,
      detail: `Playwright L3 Curativos — ${CURATIVOS_BRANCHES.length} branches (${CURATIVOS_BESPOKE_BRANCHES.length} bespoke/redesign); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('curativos-e-manejo-de-feridas');
  });
});

test.describe('Feridas e Queimaduras — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Feridas — nightly/manual only');
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

  for (const branch of FERIDAS_BRANCHES) {
    test(`Feridas ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Feridas ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Feridas feridas_grau_profundidade — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'feridas_grau_profundidade';

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await expectSlidePanels(page);

    const panel = page.getByTestId('mold-slide-1');
    await panel.scrollIntoViewIfNeeded();
    const overflowX = await panel.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(overflowX).toBe(false);
    const text = (await panel.innerText()).toLowerCase();
    expect(text).toMatch(/grau|profundidade|queimadura|escara/i);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Feridas — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'feridas-e-queimaduras',
      branches: FERIDAS_BRANCHES,
      pass: true,
      detail: `Playwright L3 Feridas — ${FERIDAS_BRANCHES.length} branches (${FERIDAS_BESPOKE_BRANCHES.length} burn-mold bespoke); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('feridas-e-queimaduras');
  });
});

test.describe('Processamento de Artigos e Produtos de Saúde — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Processamento — nightly/manual only');
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

  for (const branch of PROCESSAMENTO_BRANCHES) {
    test(`Processamento ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Processamento ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Processamento — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'processamento',
      branches: PROCESSAMENTO_BRANCHES,
      pass: true,
      detail: `Playwright L3 Processamento — ${PROCESSAMENTO_BRANCHES.length} branches (${PROCESSAMENTO_BESPOKE_BRANCHES.length} reference/VF); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('processamento');
  });
});

test.describe('Enfermagem em Central de Material e Esterilização (CME) — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression CME — nightly/manual only');
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

  for (const branch of CME_BRANCHES) {
    test(`CME ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`CME ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('CME — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'cme',
      branches: CME_BRANCHES,
      pass: true,
      detail: `Playwright L3 CME — ${CME_BRANCHES.length} branches (${CME_BESPOKE_BRANCHES.length} reference/VF); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('cme');
  });
});

test.describe('História da Enfermagem — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression História — nightly/manual only');
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

  for (const branch of HISTORIA_BRANCHES) {
    test(`História ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`História ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('História — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'historia-enfermagem',
      branches: HISTORIA_BRANCHES,
      pass: true,
      detail: `Playwright L3 História — ${HISTORIA_BRANCHES.length} branches (${HISTORIA_BESPOKE_BRANCHES.length} bespoke); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('historia-enfermagem');
  });
});

test.describe('Enfermagem do Trabalho — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Trabalho — nightly/manual only');
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

  for (const branch of TRABALHO_BRANCHES) {
    test(`Trabalho ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Trabalho ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Trabalho trabalho_vf_nr32 — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'trabalho_vf_nr32';

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await expectSlidePanels(page);

    const panel = page.getByTestId('mold-slide-1');
    await panel.scrollIntoViewIfNeeded();
    const overflowX = await panel.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(overflowX).toBe(false);
    const text = (await panel.innerText()).toLowerCase();
    expect(text).toMatch(/nr[\s-]?32|risco|biol[oó]gico|anexo/i);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Trabalho — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'enfermagem-do-trabalho',
      branches: TRABALHO_BRANCHES,
      pass: true,
      detail: `Playwright L3 Trabalho — ${TRABALHO_BRANCHES.length} branches (${TRABALHO_BESPOKE_BRANCHES.length} bespoke NR-32); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('enfermagem-do-trabalho');
  });
});

test.describe('Segurança do Paciente — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Segurança do Paciente — nightly/manual only');
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

  for (const branch of SEGURANCA_BRANCHES) {
    test(`Segurança do Paciente ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Segurança do Paciente ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Segurança do Paciente sp_prevencao_quedas — 375px legível (DoD brief)', async ({ page }) => {
    const branch = 'sp_prevencao_quedas';

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await expectSlidePanels(page);

    const panel = page.getByTestId('mold-slide-1');
    await panel.scrollIntoViewIfNeeded();
    const overflowX = await panel.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(overflowX).toBe(false);
    const text = (await panel.innerText()).toLowerCase();
    expect(text).toMatch(/morse|queda|risco|preven[cç][aã]o/i);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Segurança do Paciente — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'seguranca-do-paciente',
      branches: SEGURANCA_BRANCHES,
      pass: true,
      detail: `Playwright L3 Segurança do Paciente — ${SEGURANCA_BRANCHES.length} branches (${SEGURANCA_BESPOKE_BRANCHES.length} bespoke NSP); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('seguranca-do-paciente');
  });
});

test.describe('Promoção à Saúde e Prevenção de Agravos — moldes L3', () => {
  test.describe.configure({ mode: 'serial', timeout: 180_000 });

  test.beforeAll(() => {
    if (process.env.CI) {
      test.skip(true, 'Visual mold regression Promoção — nightly/manual only');
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

  for (const branch of PROMOCAO_BRANCHES) {
    test(`Promoção ${branch} — desktop 4 slides`, async ({ page }) => {
      await page.setViewportSize(DESKTOP_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'desktop');
    });

    test(`Promoção ${branch} — mobile 375px 4 slides`, async ({ page }) => {
      await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
      await gotoBranch(page, branch);
      await expectSlidePanels(page);
      await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375');
    });
  }

  test('Promoção promocao_art4_composicao — 375px legível (DoD sus-art4-orbit)', async ({ page }) => {
    const branch = 'promocao_art4_composicao';

    await page.setViewportSize(MOBILE_NARROW_VIEWPORT);
    await gotoBranch(page, branch);
    await expectSlidePanels(page);

    const panel = page.getByTestId('mold-slide-1');
    await panel.scrollIntoViewIfNeeded();
    const overflowX = await panel.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(overflowX).toBe(false);
    const text = (await panel.innerText()).toLowerCase();
    expect(text).toMatch(/art\.?\s*4|composi[cç][aã]o|sus|8\.080|princ[ií]pio/i);

    await screenshotSlidePanels(page, branch, OUT_DIR, 'mobile-375-dod');
  });

  test('Promoção — grava summary.json (audit:subtopico-quality L3)', () => {
    const outPath = writeVisualMoldSummary({
      pacotePrefix: 'promocao-a-saude-e-prevencao-de-agravos',
      branches: PROMOCAO_BRANCHES,
      pass: true,
      detail: `Playwright L3 Promoção — ${PROMOCAO_BRANCHES.length} branches (${PROMOCAO_BESPOKE_BRANCHES.length} bespoke sus-art4-orbit); PNGs em artifacts/visual-mold-regression/`,
    });
    expect(fs.existsSync(outPath)).toBe(true);
    const summary = JSON.parse(fs.readFileSync(outPath, 'utf8')) as { pacote_prefix: string };
    expect(summary.pacote_prefix).toBe('promocao-a-saude-e-prevencao-de-agravos');
  });
});
