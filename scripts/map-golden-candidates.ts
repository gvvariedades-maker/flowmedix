#!/usr/bin/env tsx
/**
 * Mapeia candidatas a golden no Supabase e gera lista priorizada.
 *
 * Uso:
 *   npx tsx scripts/map-golden-candidates.ts
 *   npx tsx scripts/map-golden-candidates.ts --limit=12
 */

import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { classifyFamily, type FamilyId } from '@/lib/catalogMigration/classifyFamily';
import { createServerSupabase } from '@/lib/supabase/server';
import { QuestaoCompletaSchema, payloadContainsTecconcursosReference } from '@/lib/validations';

type CandidateRow = {
  modulo_slug: string;
  banca: string | null;
  subtopico: string;
  family: FamilyId;
  score: number;
  reasons: string[];
  instruction_preview: string;
  option_count: number;
  has_generic_slides: boolean;
  already_golden: boolean;
};

const EXISTING_GOLDEN_SLUGS = new Set([
  'fepese-enfermagem-processo-de-enfermagem-1776056021381-0',
  'fundatec-enfermagem-imunizacao-1777103182944-8',
  'idecan-enfermagem-calculo-de-administracao-de-medicamentos-e-infusoes-1776056318806-0',
  'cpcon-uepb-enfermagem-vias-de-administracao-1776056366158-7',
  'vunesp-enfermagem-vias-de-administracao-1776056338955-3',
]);

const FAMILY_SLOTS: { family: FamilyId; label: string; count: number }[] = [
  { family: 'legis', label: 'Legislação (2ª variante)', count: 1 },
  { family: 'protocolo', label: 'Protocolo (2ª variante)', count: 1 },
  { family: 'calc', label: 'Cálculo (2ª variante)', count: 1 },
  { family: 'vf', label: 'I/II/III V/F', count: 2 },
  { family: 'certo_errado', label: 'Certo/Errado', count: 1 },
  { family: 'conceito', label: 'Conceito / definição', count: 3 },
  { family: 'text_fragment', label: 'Caso clínico (text_fragment)', count: 1 },
  { family: 'legis', label: 'Legislação (3ª variante)', count: 1 },
  { family: 'protocolo', label: 'Protocolo (3ª variante)', count: 1 },
];

function parseLimit(): number {
  const arg = process.argv.find((a) => a.startsWith('--limit='));
  if (!arg) return 12;
  const n = Number(arg.split('=')[1]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 12;
}

function genericSlides(slides: unknown): boolean {
  if (!Array.isArray(slides) || slides.length === 0) return true;
  const txt = JSON.stringify(slides).toLowerCase();
  return (
    txt.includes('relacione o tema') ||
    txt.includes('ponto 1') ||
    txt.includes('erros comuns') ||
    txt.includes('conceito central') ||
    txt.includes('regra essencial')
  );
}

function scoreCandidate(input: {
  family: FamilyId;
  instruction: string;
  options: { id: string; text: string; is_correct: boolean }[];
  subtopico: string;
  banca: string | null;
  hasGeneric: boolean;
  zodOk: boolean;
  tecBlocked: boolean;
  alreadyGolden: boolean;
}): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  if (input.alreadyGolden) {
    return { score: -1000, reasons: ['já tem golden em examples/'] };
  }
  if (input.tecBlocked) {
    return { score: -500, reasons: ['referência TecConcursos bloqueada'] };
  }

  if (input.zodOk) {
    score += 15;
    reasons.push('Zod OK');
  } else {
    score -= 20;
    reasons.push('Zod inválido');
  }

  if (!input.hasGeneric) {
    score += 10;
    reasons.push('slides não genéricos');
  } else {
    score += 5;
    reasons.push('slides genéricos (candidata refatoração)');
  }

  if (input.instruction.length >= 120 && input.instruction.length <= 1200) {
    score += 8;
    reasons.push('enunciado com corpo útil');
  }

  if (input.options.length >= 4) {
    score += 6;
    reasons.push('alternativas A–E');
  } else if (input.options.length === 2) {
    score += 4;
    reasons.push('Certo/Errado');
  }

  const correctCount = input.options.filter((o) => o.is_correct).length;
  if (correctCount === 1) {
    score += 10;
    reasons.push('gabarito único');
  } else {
    score -= 15;
    reasons.push('gabarito ambíguo');
  }

  const banca = (input.banca ?? '').toLowerCase();
  if (['idecan', 'vunesp', 'fgv', 'cesgranrio', 'fepese', 'cpcon', 'fundatec'].some((b) => banca.includes(b))) {
    score += 5;
    reasons.push('banca frequente');
  }

  if (input.subtopico.trim().length > 8) {
    score += 4;
    reasons.push('subtópico canônico');
  }

  if (input.family === 'vf' && /I\s*[-–]/.test(input.instruction) && /III\s*[-–]/.test(input.instruction)) {
    score += 6;
    reasons.push('V/F com III explícito');
  }

  if (input.family === 'calc' && /gts|gotas|ml|mg|dose/i.test(input.instruction)) {
    score += 6;
    reasons.push('cálculo com unidades');
  }

  if (input.family === 'legis' && /art\.|lei\s+\d/i.test(input.instruction)) {
    score += 6;
    reasons.push('dispositivo legal explícito');
  }

  if (input.family === 'protocolo' && /30:2|100|120|mmhg|bpm/i.test(input.instruction)) {
    score += 6;
    reasons.push('parâmetro numérico de prova');
  }

  return { score, reasons };
}

function pickTopByFamily(
  rows: CandidateRow[],
  family: FamilyId,
  count: number,
  usedSlugs: Set<string>,
  excludeSubtopicos: Set<string>,
): CandidateRow[] {
  const sorted = [...rows]
    .filter(
      (r) =>
        r.family === family &&
        !r.already_golden &&
        !usedSlugs.has(r.modulo_slug) &&
        !excludeSubtopicos.has(r.subtopico.toLowerCase()),
    )
    .sort((a, b) => b.score - a.score || a.modulo_slug.localeCompare(b.modulo_slug));

  const picked: CandidateRow[] = [];
  const usedSubtopicos = new Set<string>();

  for (const row of sorted) {
    if (picked.length >= count) break;
    const subKey = row.subtopico.toLowerCase();
    if (usedSubtopicos.has(subKey) && !['vf', 'protocolo', 'legis'].includes(family)) continue;
    picked.push(row);
    usedSlugs.add(row.modulo_slug);
    usedSubtopicos.add(subKey);
  }

  return picked;
}

async function main() {
  const limit = parseLimit();
  const supabase = await createServerSupabase();
  const PAGE = 500;
  let offset = 0;
  const all: CandidateRow[] = [];
  const familyCounts: Record<FamilyId, number> = {
    legis: 0,
    protocolo: 0,
    calc: 0,
    vf: 0,
    certo_errado: 0,
    conceito: 0,
    text_fragment: 0,
  };

  while (true) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug, titulo_aula, banca, conteudo_json')
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + PAGE - 1);

    if (error) throw new Error(error.message);
    if (!data?.length) break;

    for (const row of data) {
      const cj = row.conteudo_json as Record<string, unknown> | null;
      if (!cj) continue;

      const qd = (cj.question_data ?? {}) as {
        instruction?: string;
        options?: { id: string; text: string; is_correct: boolean }[];
        text_fragment?: string;
      };
      const meta = (cj.meta ?? {}) as { subtopico?: string; banca?: string };
      const instruction = String(qd.instruction ?? '').trim();
      const options = Array.isArray(qd.options) ? qd.options : [];
      const textFragment = String(qd.text_fragment ?? '').trim();
      const subtopico = String(meta.subtopico ?? row.titulo_aula ?? '').trim();
      const slides = (cj.reverse_study_slides ?? cj.study_slides) as unknown;
      const family = classifyFamily(instruction, subtopico, options, textFragment);
      familyCounts[family] += 1;

      const zodOk = QuestaoCompletaSchema.safeParse(cj).success;
      const tecBlocked = payloadContainsTecconcursosReference(cj);
      const alreadyGolden = EXISTING_GOLDEN_SLUGS.has(row.modulo_slug);
      const hasGeneric = genericSlides(slides);
      const { score, reasons } = scoreCandidate({
        family,
        instruction,
        options,
        subtopico,
        banca: row.banca ?? meta.banca ?? null,
        hasGeneric,
        zodOk,
        tecBlocked,
        alreadyGolden,
      });

      all.push({
        modulo_slug: row.modulo_slug,
        banca: row.banca ?? meta.banca ?? null,
        subtopico,
        family,
        score,
        reasons,
        instruction_preview: instruction.slice(0, 140).replace(/\s+/g, ' '),
        option_count: options.length,
        has_generic_slides: hasGeneric,
        already_golden: alreadyGolden,
      });
    }

    offset += PAGE;
    if (data.length < PAGE) break;
  }

  const usedSlugs = new Set<string>();
  const excludeSubtopicos = new Set(
    [
      'Processo de Enfermagem',
      'Imunização',
      'Cálculo de Administração de Medicamentos e Infusões',
      'Vias de Administração',
      'Promoção à Saúde e Prevenção de Agravos',
      'Urgências e Emergências',
    ].map((s) => s.toLowerCase()),
  );

  const selected: CandidateRow[] = [];
  for (const slot of FAMILY_SLOTS) {
    if (selected.length >= limit) break;
    const need = Math.min(slot.count, limit - selected.length);
    const picked = pickTopByFamily(all, slot.family, need, usedSlugs, excludeSubtopicos);
    for (const p of picked) {
      p.reasons.unshift(slot.label);
    }
    selected.push(...picked);
  }

  if (selected.length < limit) {
    const filler = [...all]
      .filter((r) => !usedSlugs.has(r.modulo_slug) && !r.already_golden && r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit - selected.length);
    selected.push(...filler);
    for (const f of filler) usedSlugs.add(f.modulo_slug);
  }

  const report = {
    generated_at: new Date().toISOString(),
    catalog_total: all.length,
    family_distribution: familyCounts,
    existing_goldens_excluded: [...EXISTING_GOLDEN_SLUGS],
    selected_count: selected.length,
    selected_slugs: selected.map((s) => s.modulo_slug),
    candidates: selected,
  };

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outPath = resolve(artifactsDir, 'golden-candidates.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`[golden:map] catalog_total=${report.catalog_total}`);
  console.log(`[golden:map] family_distribution=${JSON.stringify(familyCounts)}`);
  console.log(`[golden:map] selected=${selected.length}`);
  for (const c of selected) {
    console.log(`  ${c.score.toString().padStart(3)} ${c.family.padEnd(14)} ${c.modulo_slug}`);
    console.log(`       ${c.subtopico} | ${c.banca ?? '—'} | ${c.instruction_preview}`);
  }
  console.log(`[golden:map] report=${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
