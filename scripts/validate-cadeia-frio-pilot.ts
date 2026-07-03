#!/usr/bin/env tsx
/**
 * Valida pacote L3 imunizacao_cadeia_frio nas duas âncoras + links do player.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { resolveSlidePresentation } from '@/components/slides/core/slidePresentation';
import { detectMissingFooterRules } from '@/lib/catalogMigration/slideContract';

const ANCHORS = [
  {
    label: 'AMEOSC V/F',
    file: 'questao-premium-ameosc-imunizacao-vf-cadeia-frio.json',
    slug: 'ameosc-enfermagem-processo-de-enfermagem-1780005791580-3',
  },
  {
    label: 'AVANÇASP 2–8 °C',
    file: 'questao-premium-avancasp-imunizacao-rede-frio-temperatura.json',
    slug: 'avancasp-enfermagem-processo-de-enfermagem-1780011872350-6',
  },
] as const;

const EXPECTED = {
  concept_map: 'cold-chain-hub',
  golden_rule: 'pni-temperature-rail',
  logic_flow: 'pni-cold-chain-tap',
  danger_zone: 'temperature-mismatch',
} as const;

const baseUrl = (process.argv.find((a) => a.startsWith('--base='))?.split('=')[1] ??
  'http://localhost:3000').replace(/\/$/, '');

let failed = 0;

for (const anchor of ANCHORS) {
  const path = resolve(process.cwd(), 'examples', anchor.file);
  const questao = JSON.parse(readFileSync(path, 'utf8')) as {
    meta: { subtopico?: string; pedagogical_branch?: string };
    reverse_study_slides: Array<Record<string, unknown> & { type: string }>;
  };

  const ctx = {
    questionSlug: anchor.slug,
    familyId: questao.meta.pedagogical_branch === 'imunizacao_cadeia_frio' ? 'vf' : 'conceito',
    pedagogicalBranch: 'imunizacao_cadeia_frio' as const,
    subtopico: questao.meta.subtopico,
  };

  console.log(`\n=== ${anchor.label} (${anchor.file}) ===`);
  console.log(`Player: ${baseUrl}/estudar/${anchor.slug}`);

  for (const slide of questao.reverse_study_slides) {
    const expected = EXPECTED[slide.type as keyof typeof EXPECTED];
    const result = resolveSlidePresentation(
      { ...slide, meta: { subtopico: questao.meta.subtopico } },
      ctx,
    );

    const ok =
      result.layoutVariant === expected &&
      !result.moldFallback &&
      (slide.type !== 'danger_zone' || result.bulletStyle === 'x_icon');

    if (!ok) failed += 1;

    console.log(
      `${ok ? '✓' : '✗'} ${slide.type}: ${result.layoutVariant}` +
        (result.moldFallback ? ' [FALLBACK]' : '') +
        (slide.type === 'logic_flow' ? ` reveal=${result.revealMode}` : '') +
        (slide.type === 'danger_zone' ? ` dangerReveal=${result.dangerRevealMode}` : ''),
    );

    if (!ok) {
      console.log(`  esperado: ${expected}, moldFallback=${result.moldFallback}`);
    }
  }

  const footer = detectMissingFooterRules(questao.reverse_study_slides);
  if (footer.missing) {
    failed += 1;
    console.log(`✗ footer_rule ausente: ${footer.slideTypes.join(', ')}`);
  } else {
    console.log('✓ footer_rule em 4/4 slides');
  }
}

if (failed > 0) {
  console.error(`\n${failed} slide(s) com problema.`);
  process.exit(1);
}

console.log('\nTodas as âncoras passaram — pacote 4/4 sem fallback genérico.');
