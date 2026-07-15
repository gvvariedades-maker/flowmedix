#!/usr/bin/env tsx
/**
 * Onda paridade Adolescente — Feridas e Queimaduras g01:
 * - ordem slides v2
 * - remove spoiler gabarito concept_map / golden_rule
 * - meta.pedagogical_branch
 * - espelha em feridas-e-queimaduras-completo/questions/
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

import type { PedagogicalBranchId } from '@/lib/slides/pedagogicalBranch';

const G01_DIR = 'data/catalog-migration/feridas-e-queimaduras-g01/questions';
const COMPLETO_DIR = 'data/catalog-migration/feridas-e-queimaduras-completo/questions';

const SLUG_BRANCH: Record<string, PedagogicalBranchId> = {
  'icece-enfermagem-feridas-e-queimaduras-1780001297464-5': 'feridas_grau_profundidade',
  'avancasp-enfermagem-processo-de-enfermagem-1780011872350-0': 'feridas_atendimento_inicial',
  'idib-enfermagem-feridas-e-queimaduras-1778934936220-2': 'feridas_scq_calculo',
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780004272097-0': 'feridas_grande_queimado',
  'ms-sarmento-enfermagem-processo-de-enfermagem-1780008225255-1': 'feridas_scq_regra9',
  'idecan-enfermagem-feridas-e-queimaduras-1780067013432-7': 'feridas_classificacao',
  'idecan-enfermagem-feridas-e-queimaduras-1780067013432-8': 'feridas_cicatrizacao',
  'idecan-enfermagem-feridas-e-queimaduras-1780067013432-9': 'feridas_curativo_tipo',
};

type Slide = { type: string; [k: string]: unknown };
type Payload = {
  meta?: Record<string, unknown> & { pedagogical_branch?: string };
  reverse_study_slides?: Slide[];
  modulo_slug?: string;
};

function isGabaritoLabel(label: unknown): boolean {
  return typeof label === 'string' && /^gabarito$/i.test(label.trim());
}

function fixSlides(slides: Slide[]): Slide[] {
  const byType = Object.fromEntries(slides.map((s) => [s.type, s])) as Record<string, Slide>;

  const cm = byType.concept_map;
  if (cm?.items && Array.isArray(cm.items)) {
    cm.items = (cm.items as { label?: string; detail?: string }[]).filter(
      (i) => !isGabaritoLabel(i.label),
    );
    for (const item of cm.items as { label?: string; detail?: string }[]) {
      if (item.label === 'Sequência' && item.detail?.includes('3')) {
        item.label = 'Fases da cicatrização';
        item.detail = 'Três fases fisiológicas — ordem definida no logic_flow.';
      }
    }
  }

  const gr = byType.golden_rule;
  if (gr?.rows && Array.isArray(gr.rows)) {
    gr.rows = (gr.rows as { label?: string }[]).filter((r) => !isGabaritoLabel(r.label));
  }

  const ordered: Slide[] = [];
  for (const t of ['concept_map', 'logic_flow', 'golden_rule', 'danger_zone']) {
    if (byType[t]) ordered.push(byType[t]);
  }
  return ordered.length === 4 ? ordered : slides;
}

function patchFile(path: string, slug: string): void {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as Payload;
  const branch = SLUG_BRANCH[slug];
  if (!branch) {
    console.warn(`[skip] sem branch: ${slug}`);
    return;
  }
  raw.meta = { ...raw.meta, pedagogical_branch: branch };
  if (raw.reverse_study_slides) {
    raw.reverse_study_slides = fixSlides(raw.reverse_study_slides);
  }
  writeFileSync(path, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
}

mkdirSync(COMPLETO_DIR, { recursive: true });

// Remove legado mis-tag no completo (só 8 slugs curados no manifest)
for (const file of readdirSync(COMPLETO_DIR).filter((f) => f.endsWith('.json'))) {
  const slug = file.replace(/\.json$/, '');
  if (!SLUG_BRANCH[slug]) {
    unlinkSync(join(COMPLETO_DIR, file));
    console.log(`[rm] legado ${slug}`);
  }
}

for (const file of readdirSync(G01_DIR).filter((f) => f.endsWith('.json'))) {
  const slug = file.replace(/\.json$/, '');
  const g01Path = join(G01_DIR, file);
  patchFile(g01Path, slug);
  const completoPath = join(COMPLETO_DIR, file);
  writeFileSync(completoPath, readFileSync(g01Path, 'utf8'), 'utf8');
  console.log(`[ok] ${slug} → ${SLUG_BRANCH[slug]}`);
}

console.log('[patch-feridas-paridade-onda] concluído');
