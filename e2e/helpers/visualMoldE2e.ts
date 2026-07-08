import fs from 'fs';
import path from 'path';
import { expect, type Page } from '@playwright/test';

export const PNI_IMUNIZACAO_BRANCHES = [
  'imunizacao_vf_intervalos',
  'imunizacao_calendario',
  'imunizacao_cadeia_frio',
  'imunizacao_exceto',
  'imunizacao_generico',
] as const;

/** Ramo Vias com pacote bespoke 4/4 (absorção / velocidade). */
export const VIAS_BESPOKE_BRANCHES = ['via_vf_absorcao'] as const;

/** Ramos Vias para regressão visual (bespoke + genéricos). */
export const VIAS_BRANCHES = [
  'via_vf_absorcao',
  'via_tecnica_admin',
  'via_generico',
] as const;

/** Ramos SV com pacote bespoke vitals-panel (playbook § pedagogical_branches + clusters temperatura/FR). */
export const SINAIS_VITAIS_BRANCHES = [
  'vitals_pa_tecnica',
  'vitals_fc_faixas',
  'vitals_interpretacao',
  'vitals_vf_faixas',
  'vitals_exceto_tecnica',
  'vitals_temperatura',
  'vitals_fr_faixas',
  'vitals_generico',
] as const;

/** Ramo SV com pacote bespoke 4/4 (PA técnica + reference-board). */
export const SINAIS_VITAIS_BESPOKE_BRANCHES = ['vitals_pa_tecnica', 'vitals_exceto_tecnica'] as const;

/** Ramo PNI com pacote bespoke 4/4 (calendário ≠ cadeia frio ≠ V/F intervalos). */
export const PNI_BESPOKE_BRANCHES = [
  'imunizacao_vf_intervalos',
  'imunizacao_calendario',
  'imunizacao_cadeia_frio',
] as const;

/** Ramos Urgências e Emergências — regressão L3 (13 pedagogical_branch). */
export const URGENCIAS_BRANCHES = [
  'urgencias_rcp_sbv',
  'urgencias_rcp_pediatrico',
  'urgencias_avc_iam',
  'urgencias_xabcde_trauma',
  'urgencias_choque',
  'urgencias_engasgo',
  'urgencias_exceto_conduta',
  'urgencias_vf_protocolo',
  'urgencias_convulsao',
  'urgencias_manchester_triagem',
  'urgencias_anafilaxia',
  'urgencias_queimadura',
  'urgencias_generico',
] as const;

/** Ramos Urgências com pacote bespoke 4/4 completo. */
export const URGENCIAS_BESPOKE_BRANCHES = [...URGENCIAS_BRANCHES] as const;

export const MOBILE_NARROW_VIEWPORT = { width: 375, height: 812 } as const;
export const DESKTOP_VIEWPORT = { width: 1280, height: 900 } as const;
export const SLIDE_COUNT = 4;

export type VisualMoldRegressionSummary = {
  generated_at: string;
  pacote_prefix: string;
  pass: boolean;
  detail: string;
  branches: string[];
};

/** Artefato L3 para `audit:subtopico-quality` (shipGate.checkL3VisualMold). */
export function writeVisualMoldSummary(opts: {
  pacotePrefix: string;
  branches: readonly string[];
  pass?: boolean;
  detail?: string;
}): string {
  const outDir = path.join(process.cwd(), 'artifacts/visual-mold-regression');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'summary.json');
  const branchList = [...opts.branches];
  const summary: VisualMoldRegressionSummary = {
    generated_at: new Date().toISOString(),
    pacote_prefix: opts.pacotePrefix,
    pass: opts.pass ?? true,
    detail:
      opts.detail ??
      `Playwright L3 — ${branchList.length} branch(es): ${branchList.join(', ')}`,
    branches: branchList,
  };
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8');
  return outPath;
}

export type VisualAnchorEntry = {
  pedagogical_branch: string;
  slug: string;
  lote: string;
  json_path: string;
};

export function loadVisualAnchors(): Record<string, VisualAnchorEntry> {
  const anchorsPath = path.join(process.cwd(), 'data/catalog-migration/visual-anchors.json');
  const raw = JSON.parse(fs.readFileSync(anchorsPath, 'utf8')) as {
    anchors: Record<string, VisualAnchorEntry>;
  };
  return raw.anchors;
}

export function loadAnchorFooterRules(jsonPath: string): string[] {
  const full = path.join(process.cwd(), jsonPath);
  const questao = JSON.parse(fs.readFileSync(full, 'utf8')) as {
    reverse_study_slides?: { footer_rule?: string }[];
  };
  const slides = questao.reverse_study_slides ?? [];
  return slides.map((s) => s.footer_rule?.trim() ?? '');
}

export const onboardingDismissScript = () => {
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

export async function gotoBranch(page: Page, branch: string): Promise<void> {
  await page.goto(`/dev/slide-mold-review?branch=${encodeURIComponent(branch)}`, {
    waitUntil: 'domcontentloaded',
    timeout: 180_000,
  });
  await expect(page.getByTestId('slide-mold-review-root')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId('mold-player').getByTestId('lesson-scroll-body').first()).toBeVisible({
    timeout: 90_000,
  });
}

export async function expectSlidePanels(page: Page): Promise<void> {
  for (let i = 1; i <= SLIDE_COUNT; i++) {
    await expect(page.getByTestId(`mold-slide-${i}`)).toBeVisible({ timeout: 30_000 });
  }
  for (let i = 1; i <= SLIDE_COUNT; i++) {
    await page.getByTestId(`mold-slide-${i}`).scrollIntoViewIfNeeded();
  }
}

export async function screenshotSlidePanels(
  page: Page,
  branch: string,
  outDir: string,
  viewportLabel: 'desktop' | 'mobile-375' | 'mobile-375-dod',
): Promise<void> {
  fs.mkdirSync(outDir, { recursive: true });
  for (let i = 1; i <= SLIDE_COUNT; i++) {
    const panel = page.getByTestId(`mold-slide-${i}`);
    await panel.scrollIntoViewIfNeeded();
    await panel.screenshot({
      path: path.join(outDir, `${branch}-${viewportLabel}-slide${i}.png`),
      type: 'png',
    });
  }
}

/** DoD 375px — footer_rule legível e painel sem overflow horizontal. */
export async function assertSlidePanelsLegibleAt375(
  page: Page,
  footerRules: string[],
): Promise<void> {
  for (let i = 1; i <= SLIDE_COUNT; i++) {
    const panel = page.getByTestId(`mold-slide-${i}`);
    await panel.scrollIntoViewIfNeeded();
    await expect(panel).toBeVisible();

    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }

    await panel.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
      for (const child of el.querySelectorAll<HTMLElement>('*')) {
        if (child.scrollHeight > child.clientHeight + 2) {
          child.scrollTop = child.scrollHeight;
        }
      }
    });

    const overflowX = await panel.evaluate((el) => el.scrollWidth > el.clientWidth + 2);
    expect(overflowX).toBe(false);

    const footer = footerRules[i - 1];
    if (footer) {
      const needle = footer.slice(0, Math.min(18, footer.length)).trim();
      const text = (await panel.innerText()).toLowerCase();
      expect(text).toContain(needle.toLowerCase());
    }
  }
}
