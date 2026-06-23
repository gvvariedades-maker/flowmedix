#!/usr/bin/env tsx
/**
 * Gera plano de aprofundamento máximo (temas do edital + metas por subtópico).
 * Uso: npx tsx scripts/generate-guideline-deepening-plan.ts
 * Entrada: artifacts/guideline-coverage-audit.json (rodar audit:guideline-coverage antes)
 * Saída: artifacts/guideline-deepening-plan.json + docs/GUIDELINE_DEEPENING_PLAN.md
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  DEEPENING_BY_SUBTOPICO,
  PHASE_LABELS,
  PHASE_ORDER,
  type DeepeningPhase,
} from '@/lib/guidelines/deepeningPlan';

type AuditRow = {
  subtopico: string;
  merged_entries: number;
  question_count: number;
  entries_per_100_questions: number | null;
  coverage_band: string;
  guideline_table_ids: string[];
};

type AuditFile = {
  generated_at: string;
  counts_source: string;
  by_subtopico: AuditRow[];
};

function gapEntries(current: number, target: number): number {
  return Math.max(0, target - current);
}

function main() {
  const auditPath = resolve(process.cwd(), 'artifacts/guideline-coverage-audit.json');
  if (!existsSync(auditPath)) {
    console.error('Rode primeiro: npm run audit:guideline-coverage');
    process.exit(1);
  }

  const audit = JSON.parse(readFileSync(auditPath, 'utf8')) as AuditFile;

  const rows = audit.by_subtopico.map((row) => {
    const spec = DEEPENING_BY_SUBTOPICO[row.subtopico];
    if (!spec) {
      return {
        subtopico: row.subtopico,
        phase: 'P3_complementar' as DeepeningPhase,
        question_count: row.question_count,
        current_entries: row.merged_entries,
        target_entries: row.merged_entries,
        gap_entries: 0,
        coverage_band: row.coverage_band,
        edital_themes: [] as string[],
        sources_tier_a: [] as string[],
        done_when: 'Especificar em deepeningPlan.ts',
        priority_score: row.question_count,
      };
    }

    const gap = gapEntries(row.merged_entries, spec.target_merged_entries);
    const priorityScore =
      spec.phase === 'P1_critico'
        ? row.question_count * 3 + gap * 2
        : spec.phase === 'P2_volume'
          ? row.question_count * 2 + gap
          : gap;

    return {
      subtopico: row.subtopico,
      phase: spec.phase,
      question_count: row.question_count,
      current_entries: row.merged_entries,
      target_entries: spec.target_merged_entries,
      gap_entries: gap,
      coverage_band: row.coverage_band,
      guideline_table_ids: row.guideline_table_ids,
      edital_themes: spec.edital_themes,
      sources_tier_a: spec.sources_tier_a,
      done_when: spec.done_when,
      priority_score: priorityScore,
    };
  });

  const totalGap = rows.reduce((s, r) => s + r.gap_entries, 0);
  const byPhase = PHASE_ORDER.map((phase) => ({
    phase,
    label: PHASE_LABELS[phase],
    subtopicos: rows
      .filter((r) => r.phase === phase)
      .sort((a, b) => b.priority_score - a.priority_score),
  }));

  const plan = {
    generated_at: new Date().toISOString(),
    audit_snapshot_at: audit.generated_at,
    counts_source: audit.counts_source,
    north_star:
      'Aprofundamento máximo = extração literal tier A por tema do edital, não só contagem; meta ≥15 entries/100 questões ou target_merged_entries do spec.',
    summary: {
      subtopicos: rows.length,
      total_gap_entries: totalGap,
      p1_count: rows.filter((r) => r.phase === 'P1_critico').length,
      p2_count: rows.filter((r) => r.phase === 'P2_volume').length,
      with_gap: rows.filter((r) => r.gap_entries > 0).length,
    },
    workflow: [
      '1. Escolher subtópico da fase (ordenado por priority_score).',
      '2. Extrair entries dos sources_tier_a — um bloco por edital_theme.',
      '3. Codificar em lib/guidelines/<pacote>.ts com sourceId estável.',
      '4. Rodar npm test (slideGeneration factcheck + guidelineCoverage).',
      '5. npm run audit:guideline-coverage → gap_entries → 0 para o subtópico.',
      '6. npm run update:guideline-status se novas tabelas/merge.',
      '7. Piloto 5–10 slugs no player + lote IA se subtópico tem builder.',
    ],
    by_phase: byPhase,
    all_subtopicos: [...rows].sort((a, b) => b.priority_score - a.priority_score),
  };

  const jsonOut = resolve(process.cwd(), 'artifacts/guideline-deepening-plan.json');
  writeFileSync(jsonOut, JSON.stringify(plan, null, 2), 'utf8');

  const md: string[] = [
    '# Plano de aprofundamento máximo — Guidelines por subtópico',
    '',
    `Gerado em: ${plan.generated_at}`,
    `Auditoria base: ${audit.generated_at} (${audit.counts_source})`,
    '',
    '## North star',
    '',
    plan.north_star,
    '',
    '**Estado atual (baseline expandido):** 636 entries, 41/41 mapeados, registry `extracted`.',
    `**Gap total estimado:** ${totalGap} entries até as metas deste plano.`,
    '',
    '## Workflow por subtópico',
    '',
    ...plan.workflow.map((w) => `- ${w}`),
    '',
    '## Fases',
    '',
  ];

  for (const block of byPhase) {
    if (block.subtopicos.length === 0) continue;
    md.push(`### ${block.label}`);
    md.push('');
    md.push('| Subtópico | Questões | Atual | Meta | Gap | Banda |');
    md.push('|-----------|--------:|------:|-----:|----:|-------|');
    for (const r of block.subtopicos) {
      md.push(
        `| ${r.subtopico} | ${r.question_count} | ${r.current_entries} | ${r.target_entries} | ${r.gap_entries} | ${r.coverage_band} |`,
      );
    }
    md.push('');
  }

  md.push('## Detalhe — Fase 1 (prioridade imediata)');
  md.push('');
  for (const r of byPhase.find((b) => b.phase === 'P1_critico')?.subtopicos ?? []) {
    md.push(`### ${r.subtopico}`);
    md.push('');
    md.push(`- **Gap:** ${r.gap_entries} entries (atual ${r.current_entries} → meta ${r.target_entries})`);
    md.push(`- **Tabelas:** \`${r.guideline_table_ids?.join('` + `') ?? '—'}\``);
    md.push('- **Temas do edital:**');
    for (const t of r.edital_themes ?? []) md.push(`  - ${t}`);
    md.push('- **Fontes tier A:**');
    for (const s of r.sources_tier_a ?? []) md.push(`  - ${s}`);
    md.push(`- **DoD:** ${r.done_when}`);
    md.push('');
  }

  md.push('## Referências');
  md.push('');
  md.push('- Especificação: [`lib/guidelines/deepeningPlan.ts`](../lib/guidelines/deepeningPlan.ts)');
  md.push('- Auditoria: [`artifacts/guideline-coverage-audit.json`](../artifacts/guideline-coverage-audit.json)');
  md.push('- Código: [`lib/guidelines/`](../lib/guidelines/) · [`SUBTOPICO_GUIDELINE_IDS`](../lib/guidelines/index.ts)');
  md.push('- Registry: `npm run update:guideline-status` · `npm run refresh:guideline-counts`');
  md.push('');

  const mdOut = resolve(process.cwd(), 'docs/GUIDELINE_DEEPENING_PLAN.md');
  writeFileSync(mdOut, md.join('\n'), 'utf8');

  console.log('[deepening-plan] Subtópicos:', plan.summary.subtopicos);
  console.log('[deepening-plan] Gap total entries:', totalGap);
  console.log('[deepening-plan] Fase 1:', plan.summary.p1_count, '| Fase 2:', plan.summary.p2_count);
  console.log('[deepening-plan] Top 5 prioridade:');
  for (const r of plan.all_subtopicos.slice(0, 5)) {
    console.log(`  +${r.gap_entries}e  ${r.subtopico} (${r.phase})`);
  }
  console.log('[deepening-plan] JSON:', jsonOut);
  console.log('[deepening-plan] MD:', mdOut);
}

main();
