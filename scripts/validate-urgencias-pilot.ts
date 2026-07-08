#!/usr/bin/env tsx
/**
 * Piloto L3 Urgências — valida 4/4 layouts bespoke nas âncoras P0 por ramo implementado.
 *
 * Uso:
 *   npx tsx scripts/validate-urgencias-pilot.ts
 *   npx tsx scripts/validate-urgencias-pilot.ts --base=http://localhost:3001
 *   npx tsx scripts/validate-urgencias-pilot.ts --only=pediatric,manchester
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { resolveSlidePresentation } from '@/components/slides/core/slidePresentation';
import { getPresentationDesign } from '@/lib/slides/pedagogicalBranch';
import { detectMissingFooterRules } from '@/lib/catalogMigration/slideContract';

type SlideType = 'concept_map' | 'golden_rule' | 'logic_flow' | 'danger_zone';

type PilotAnchor = {
  id: string;
  label: string;
  file: string;
  slug: string;
  branch: string;
  family: string;
  gabarito: string;
};

const PILOT_ANCHORS: PilotAnchor[] = [
  {
    id: 'rcp_sbv',
    label: 'RCP adulto AHA 2020',
    file: 'questao-premium-admtec-urgencias-rcp-30-2-aha2020.json',
    slug: 'adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-6',
    branch: 'urgencias_rcp_sbv',
    family: 'protocolo',
    gabarito: 'D',
  },
  {
    id: 'pediatric',
    label: 'RCP pediátrica 15:2',
    file: 'questao-premium-access-urgencias-rcp-pediatrica-15-2.json',
    slug: 'instituto-access-enfermagem-urgencias-e-emergencias-1777104007115-1',
    branch: 'urgencias_rcp_pediatrico',
    family: 'protocolo',
    gabarito: 'D',
  },
  {
    id: 'avc',
    label: 'AVC Cincinnati',
    file: 'questao-premium-amauc-urgencias-cincinnati-avc.json',
    slug: 'amauc-enfermagem-semiologia-em-enfermagem-1779563500147-9',
    branch: 'urgencias_avc_iam',
    family: 'protocolo',
    gabarito: 'A',
  },
  {
    id: 'trauma',
    label: 'Trauma XABCDE',
    file: 'questao-premium-ameosc-urgencias-trauma-queimadura.json',
    slug: 'ameosc-enfermagem-processo-de-enfermagem-1780002934000-5',
    branch: 'urgencias_xabcde_trauma',
    family: 'protocolo',
    gabarito: 'C',
  },
  {
    id: 'choque',
    label: 'Choque elétrico',
    file: 'questao-premium-admtec-urgencias-choque-eletrico.json',
    slug: 'adm-tec-enfermagem-urgencias-e-emergencias-1777103970505-4',
    branch: 'urgencias_choque',
    family: 'protocolo',
    gabarito: 'D',
  },
  {
    id: 'engasgo',
    label: 'Engasgo sinal universal',
    file: 'questao-premium-fau-unicentro-urgencias-engasgo-sinal-universal.json',
    slug: 'fau-unicentro-enfermagem-processo-de-enfermagem-1780002375665-6',
    branch: 'urgencias_engasgo',
    family: 'protocolo',
    gabarito: 'E',
  },
  {
    id: 'manchester',
    label: 'Manchester triagem',
    file: 'questao-premium-ameosc-urgencias-triagem-etiquetas.json',
    slug: 'ameosc-enfermagem-processo-de-enfermagem-1780011967989-1',
    branch: 'urgencias_manchester_triagem',
    family: 'protocolo',
    gabarito: 'A',
  },
];

const baseUrl = (process.argv.find((a) => a.startsWith('--base='))?.split('=')[1] ??
  'http://localhost:3001').replace(/\/$/, '');

const onlyFilter = process.argv
  .find((a) => a.startsWith('--only='))
  ?.split('=')[1]
  ?.split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const anchors = onlyFilter?.length
  ? PILOT_ANCHORS.filter((a) => onlyFilter.includes(a.id))
  : PILOT_ANCHORS;

type SlideResult = {
  type: SlideType;
  expected: string;
  actual: string;
  ok: boolean;
  moldFallback?: boolean;
  revealMode?: string;
  dangerRevealMode?: string;
};

type AnchorReport = {
  id: string;
  label: string;
  file: string;
  slug: string;
  branch: string;
  playerUrl: string;
  gabarito: string;
  slides: SlideResult[];
  footerOk: boolean;
  httpStatus?: number;
  passed: boolean;
};

function expectedLayouts(branch: string): Record<SlideType, string> {
  const design = getPresentationDesign('Urgências e Emergências', branch);
  if (!design) {
    throw new Error(`Design ausente para branch ${branch}`);
  }
  return {
    concept_map: design.conceptMap ?? 'morphological',
    golden_rule: design.goldenRule ?? 'reference_table',
    logic_flow: design.logicFlow ?? 'vertical',
    danger_zone: design.dangerZone ?? 'compare',
  };
}

function validateAnchor(anchor: PilotAnchor): AnchorReport {
  const path = resolve(process.cwd(), 'examples', anchor.file);
  const questao = JSON.parse(readFileSync(path, 'utf8')) as {
    meta: { subtopico?: string; pedagogical_branch?: string; family?: string };
    reverse_study_slides: Array<Record<string, unknown> & { type: SlideType }>;
  };

  const expected = expectedLayouts(anchor.branch);
  const ctx = {
    questionSlug: anchor.slug,
    familyId: questao.meta.family ?? anchor.family,
    pedagogicalBranch: anchor.branch,
    subtopico: questao.meta.subtopico ?? 'Urgências e Emergências',
  };

  const slides: SlideResult[] = questao.reverse_study_slides.map((slide) => {
    const result = resolveSlidePresentation(
      { ...slide, meta: { subtopico: ctx.subtopico } },
      ctx,
    );
    const slideType = slide.type;
    const want = expected[slideType];
    const ok =
      result.layoutVariant === want &&
      !result.moldFallback &&
      (slideType !== 'logic_flow' ||
        slideType === 'logic_flow' && want === 'cards'
          ? true
          : result.revealMode === 'tap') &&
      (slideType !== 'danger_zone' || result.bulletStyle === 'x_icon');

    return {
      type: slideType,
      expected: want,
      actual: result.layoutVariant,
      ok,
      moldFallback: result.moldFallback,
      revealMode: result.revealMode,
      dangerRevealMode: result.dangerRevealMode,
    };
  });

  const footer = detectMissingFooterRules(questao.reverse_study_slides);
  const footerOk = !footer.missing;
  const passed = slides.every((s) => s.ok) && footerOk;

  return {
    id: anchor.id,
    label: anchor.label,
    file: anchor.file,
    slug: anchor.slug,
    branch: anchor.branch,
    playerUrl: `${baseUrl}/estudar/${anchor.slug}`,
    gabarito: anchor.gabarito,
    slides,
    footerOk,
    passed,
  };
}

async function fetchStatus(url: string): Promise<number | undefined> {
  try {
    const res = await fetch(url, { redirect: 'manual' });
    return res.status;
  } catch {
    return undefined;
  }
}

async function main() {
  let failed = 0;
  const reports: AnchorReport[] = [];

  console.log(`\n[pilot:urgencias] ${anchors.length} âncora(s) — base ${baseUrl}\n`);

  for (const anchor of anchors) {
    const report = validateAnchor(anchor);
    report.httpStatus = await fetchStatus(report.playerUrl);
    reports.push(report);

    console.log(`=== ${anchor.label} (${anchor.branch}) ===`);
    console.log(`Player: ${report.playerUrl}`);
    console.log(`Gabarito: ${anchor.gabarito} | HTTP: ${report.httpStatus ?? 'offline'}`);

    for (const slide of report.slides) {
      if (!slide.ok) failed += 1;
      console.log(
        `${slide.ok ? '✓' : '✗'} ${slide.type}: ${slide.actual}` +
          (slide.moldFallback ? ' [FALLBACK]' : '') +
          (slide.type === 'logic_flow' ? ` reveal=${slide.revealMode}` : '') +
          (slide.type === 'danger_zone' ? ` dangerReveal=${slide.dangerRevealMode}` : ''),
      );
      if (!slide.ok) {
        console.log(`  esperado: ${slide.expected}`);
      }
    }

    if (!report.footerOk) {
      failed += 1;
      console.log('✗ footer_rule ausente em algum slide');
    } else {
      console.log('✓ footer_rule em 4/4 slides');
    }

    if (!report.passed) failed += 1;
    console.log(report.passed ? '✓ ÂNCORA OK\n' : '✗ ÂNCORA COM FALHA\n');
  }

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const reportPath = resolve(artifactsDir, 'urgencias-pilot-validation.json');
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        validated_at: new Date().toISOString(),
        baseUrl,
        passed: reports.filter((r) => r.passed).length,
        total: reports.length,
        anchors: reports,
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(`[pilot:urgencias] relatório: ${reportPath}`);
  console.log(
    `[pilot:urgencias] ${reports.filter((r) => r.passed).length}/${reports.length} âncoras OK`,
  );

  if (failed > 0) {
    console.error(`\n${failed} problema(s) detectado(s).`);
    process.exit(1);
  }

  console.log('\nPiloto layout 4/4 — todas as âncoras bespoke sem fallback genérico.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
