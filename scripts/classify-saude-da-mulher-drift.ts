#!/usr/bin/env tsx
/**
 * Classify drift — Saúde da Mulher (~21 slugs anatomia/semiologia/coleta/epidemiologia).
 *
 *   npm run classify:saude-da-mulher-drift
 *   npx tsx scripts/taxonomy-cc-from-saude-mulher-drift-apply.ts --dry-run
 *   npx tsx scripts/taxonomy-cc-from-saude-mulher-drift-apply.ts --apply
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPORT = resolve('artifacts/saude-da-mulher-topic-cluster-report.json');
const OUT_DECISIONS = resolve('artifacts/taxonomy-cc-from-saude-mulher-drift-decisions.json');
const OUT_EXCLUDE = resolve('data/catalog-migration/saude-da-mulher-exclude-done.json');
const OUT_ABSORBED = resolve('artifacts/taxonomy-cc-from-saude-mulher-drift-absorbed.json');

const FROM = 'Saúde da Mulher';

const TOPIC_TARGET: Record<string, string> = {
  'Coleta de exames (drift?)': 'Coleta de Exames Laboratoriais',
  'Anatomia feminina (drift?)': 'Noções de Anatomia',
  'Epidemiologia (drift?)': 'Epidemiologia e Vigilância Epidemiológica',
};

/** Semiologia com conteúdo obstétrico — permanece em SM (drift de cluster, não CC). */
const SEMIOLOGIA_KEEP_SM = new Set([
  'cotec-fadenor-enfermagem-saude-da-mulher-1777104301763-2',
  'cpcon-uepb-geral-saude-da-mulher-1777104382533-5',
  'educa-pb-enfermagem-saude-da-mulher-1777104408379-1',
  'iset-enfermagem-saude-da-mulher-1777104376057-0',
]);

const SLUG_OVERRIDES: Record<string, { to: string; rationale: string }> = {
  'fundatec-enfermagem-processo-de-enfermagem-1780006962671-1': {
    to: 'Urgências e Emergências',
    rationale: 'Parto de emergência em via pública + sangramento pós-parto — urgência obstétrica.',
  },
  'unesc-enfermagem-saude-da-mulher-1777104295283-4': {
    to: 'Promoção à Saúde e Prevenção de Agravos',
    rationale: 'Campanha de saúde pública / ações educativas — promoção e prevenção.',
  },
  'atame-enfermagem-vias-de-administracao-1778968573722-0': {
    to: 'Vias de Administração',
    rationale: 'Slug e enunciado ancoram vias — fora do bucket Saúde da Mulher.',
  },
};

type ClusterRow = {
  slug: string;
  topic: string;
  branch_id: string;
  drift: boolean;
  instruction_preview?: string;
};

type Decision = {
  modulo_slug: string;
  from: string;
  to: string;
  topic: string;
  rationale: string;
};

type Absorbed = {
  modulo_slug: string;
  topic: string;
  branch_target: string;
  rationale: string;
};

function main(): void {
  if (!existsSync(REPORT)) {
    throw new Error('Rode npm run cluster:saude-da-mulher antes.');
  }

  const report = JSON.parse(readFileSync(REPORT, 'utf8')) as { rows: ClusterRow[] };
  const driftRows = report.rows.filter((r) => r.drift);

  if (driftRows.length === 0) {
    throw new Error('Nenhuma linha drift no cluster report.');
  }

  const decisions: Decision[] = [];
  const absorbed: Absorbed[] = [];
  const excludeSlugs: string[] = [];

  for (const row of driftRows) {
    excludeSlugs.push(row.slug);

    if (row.topic === 'Semiologia (drift?)' && SEMIOLOGIA_KEEP_SM.has(row.slug)) {
      absorbed.push({
        modulo_slug: row.slug,
        topic: row.topic,
        branch_target:
          row.slug === 'iset-enfermagem-saude-da-mulher-1777104376057-0'
            ? 'mulher_prenatal'
            : row.slug === 'cpcon-uepb-geral-saude-da-mulher-1777104382533-5'
              ? 'mulher_prenatal'
              : 'mulher_prenatal',
        rationale:
          'Semiologia obstétrica/gestacional — permanece em Saúde da Mulher; excluir de handcraft mulher_generico.',
      });
      continue;
    }

    const override = SLUG_OVERRIDES[row.slug];
    if (override) {
      decisions.push({
        modulo_slug: row.slug,
        from: FROM,
        to: override.to,
        topic: row.topic,
        rationale: override.rationale,
      });
      continue;
    }

    if (row.topic === 'Semiologia (drift?)') {
      decisions.push({
        modulo_slug: row.slug,
        from: FROM,
        to: 'Processo de Enfermagem',
        topic: row.topic,
        rationale: 'Semiologia geral / procedimentos de enfermagem — fora do núcleo SM.',
      });
      continue;
    }

    const target = TOPIC_TARGET[row.topic];
    if (!target) {
      throw new Error(`Sem mapeamento para topic="${row.topic}" slug=${row.slug}`);
    }

    decisions.push({
      modulo_slug: row.slug,
      from: FROM,
      to: target,
      topic: row.topic,
      rationale: `Drift taxonômico — ${row.topic} → ${target}.`,
    });
  }

  mkdirSync(resolve('artifacts'), { recursive: true });

  const payload = {
    generated_at: new Date().toISOString(),
    source: 'artifacts/saude-da-mulher-topic-cluster-report.json',
    drift_total: driftRows.length,
    reclass_count: decisions.length,
    absorbed_count: absorbed.length,
    decisions,
  };
  writeFileSync(OUT_DECISIONS, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  writeFileSync(
    OUT_ABSORBED,
    `${JSON.stringify({ generated_at: payload.generated_at, absorbed }, null, 2)}\n`,
    'utf8',
  );

  writeFileSync(
    OUT_EXCLUDE,
    `${JSON.stringify(
      {
        version: 1,
        updated_at: new Date().toISOString().slice(0, 10),
        description:
          'Slugs drift — excluir de lotes handcraft SM; reclass ou absorver em ramo forte.',
        drift_total: driftRows.length,
        reclass_slugs: decisions.map((d) => d.modulo_slug),
        absorbed_slugs: absorbed.map((a) => a.modulo_slug),
        all_exclude_from_handcraft: excludeSlugs.sort(),
        decisions_artifact: 'artifacts/taxonomy-cc-from-saude-mulher-drift-decisions.json',
        absorbed_artifact: 'artifacts/taxonomy-cc-from-saude-mulher-drift-absorbed.json',
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(
    `[classify:saude-da-mulher-drift] drift=${driftRows.length} reclass=${decisions.length} absorbed=${absorbed.length}`,
  );
  console.log(`[classify:saude-da-mulher-drift] decisions=${OUT_DECISIONS}`);
  console.log(`[classify:saude-da-mulher-drift] exclude=${OUT_EXCLUDE}`);
  for (const d of decisions) {
    console.log(`  → ${d.modulo_slug} : ${d.from} → ${d.to}`);
  }
  for (const a of absorbed) {
    console.log(`  ≈ ${a.modulo_slug} : keep SM (${a.branch_target})`);
  }
}

main();
