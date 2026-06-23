#!/usr/bin/env tsx
/**
 * Clusteriza questões por família × tema pedagógico (drift, goldens necessários).
 * Padrão documentado: docs/PACOTE_PREMIUM_CHECKLIST.md § Qualidade pedagógica por ramos
 *
 * Uso:
 *   npx tsx scripts/cluster-puncao-topics.ts
 *   npx tsx scripts/cluster-puncao-topics.ts --subtopico="Punção Venosa e Cuidados com Cateteres"
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { classifyFamily, type FamilyId, type QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import {
  detectSlideTopicDrift,
  hasInstructionArtifacts,
} from '@/lib/catalogMigration/slideContract';
import { inferPuncaoTopic } from '@/lib/catalogMigration/upgradePremiumPuncao';
import { createServerSupabase } from '@/lib/supabase/server';
import { parseArg } from '@/lib/catalogMigration/cliArgs';

const PUNCAO_GOLDEN = 'questao-premium-admtec-puncao-venosa-cateteres.json';
const PUNCAO_EXCETO_GOLDEN = 'questao-premium-cev-urca-puncao-exceto-med-endovenosa.json';
const PUNCAO_FLEBITE_GOLDEN = 'questao-premium-avancasp-puncao-infiltracao-flebite.json';
const PUNCAO_DISPOSITIVO_GOLDEN = 'questao-premium-gama-puncao-scalp-jelco-calibre.json';
const PUNCAO_TEMPO_GOLDEN = 'questao-premium-cpcon-puncao-troca-equipos-intervalos.json';
const PUNCAO_PERIFERICA_GOLDEN = 'questao-premium-funpar-puncao-tecnica-periferica.json';

/** Temas com golden + perfil temático dedicado no builder hoje. */
const COVERED_CLUSTERS = new Set([
  'Prevenção de IPCS no CVC',
  'EXCETO — técnica / conduta',
  'Flebite e complicações',
  'Dispositivo / calibre / jelco',
  'Tempo / observação pós-procedimento',
  'Punção venosa periférica',
  'Técnica de punção periférica',
  'Acesso venoso central',
  'Acesso arterial / PAM',
  'Acesso venoso e cateteres',
  'Antissepsia na punção',
]);

type Row = {
  modulo_slug: string;
  banca: string | null;
  family: FamilyId;
  builder_topic: string;
  pedagogical_cluster: string;
  has_instruction_artifacts: boolean;
  slide_topic_drift: boolean;
  has_golden_branch: boolean;
  instruction_preview: string;
};

type ClusterAccum = {
  count: number;
  drift: number;
  artifacts: number;
  slugs: string[];
  builderTopics: Record<string, number>;
};

type ClusterDecision = 'novo_ramo' | 'absorver' | 'cauda_longa' | 'coberto';
type ClusterConfidence = 'alta' | 'media' | 'baixa';

type ClusterSummary = {
  cluster: string;
  count: number;
  pct: number;
  slide_topic_drift: number;
  instruction_artifacts: number;
  has_golden: boolean;
  sample_slugs: string[];
  dominant_builder_topic: string;
  dominant_builder_topic_share: number;
  builder_topic_diversity: number;
  decision: ClusterDecision;
  confidence: ClusterConfidence;
  decision_score: number;
  decision_reasons: string[];
};

const GENERIC_BRANCH_BUCKETS = new Set([
  'Default — sem âncora temática',
  'Acesso venoso e cateteres',
  'Protocolo / procedimento',
  'Cálculo / dose / tempo numérico',
  'V/F — assertivas I/II/III',
  'Certo ou errado',
  'Legislação / norma',
  'Caso clínico (text_fragment)',
]);

function refinePedagogicalCluster(
  instruction: string,
  options: QuestionOption[],
  family: FamilyId,
  builderTopic: string,
): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();

  if (family === 'vf') return 'V/F — assertivas I/II/III';
  if (family === 'certo_errado') return 'Certo ou errado';
  if (family === 'calc') return 'Cálculo / dose / tempo numérico';
  if (family === 'legis') return 'Legislação / norma';
  if (family === 'text_fragment') return 'Caso clínico (text_fragment)';
  if (family === 'protocolo' && builderTopic === 'Prevenção de IPCS no CVC') {
    return 'Prevenção de IPCS no CVC';
  }
  if (family === 'protocolo') return 'Protocolo / procedimento';

  if (/\bexceto\b|incorreta|incorreto|não (se aplica|constitui)|nao (se aplica|constitui)/.test(blob)) {
    return 'EXCETO — técnica / conduta';
  }
  if (/\d+\s*horas?|\d+\s*minutos?|tempo de observa/i.test(blob)) {
    return 'Tempo / observação pós-procedimento';
  }
  if (/administra[çc][ãa]o de medica[çc][ãa]o endovenosa|medicacao endovenosa|medica[çc][ãa]o.*endovenosa/i.test(
    blob,
  )) {
    return 'Medicação endovenosa — técnica';
  }
  if (/bisel|m[aã]o dominante|introduz.*veia|bevel|pun[çc][ãa]o venosa perif/i.test(blob)) {
    return 'Técnica de punção periférica';
  }
  if (/[áa]lcool 70|alcool 70|clorexidina|antissepsia.*pun[çc]/i.test(blob)) {
    return 'Antissepsia na punção';
  }
  if (/flebite|extravasa[çc]/i.test(blob)) {
    return 'Flebite e complicações';
  }
  if (/jelco|scalp|dispositivo.*infus|calibre|gauge|\bg\b.*cateter/i.test(blob)) {
    return 'Dispositivo / calibre / jelco';
  }
  if (/curativo|l[úu]men|flushing|hepariniza|manuten[çc][ãa]o.*cateter/i.test(blob)) {
    return 'Manutenção de cateter';
  }
  if (builderTopic !== 'Acesso venoso e cateteres') return builderTopic;
  return 'Default — sem âncora temática';
}

function clusterHasGolden(cluster: string, builderTopic: string): boolean {
  if (COVERED_CLUSTERS.has(builderTopic) || COVERED_CLUSTERS.has(cluster)) return true;
  return false;
}

function assessClusterSummary(cluster: string, stats: ClusterAccum, total: number): ClusterSummary {
  const pct = Math.round((stats.count / total) * 1000) / 10;
  const threshold = Math.max(5, Math.ceil(total * 0.1));
  const driftRatio = stats.count ? stats.drift / stats.count : 0;
  const builderTopicEntries = Object.entries(stats.builderTopics).sort((a, b) => b[1] - a[1]);
  const [dominantBuilderTopic = 'Sem âncora temática', dominantCount = 0] = builderTopicEntries[0] ?? [];
  const dominantShare = stats.count ? dominantCount / stats.count : 0;
  const builderTopicDiversity = builderTopicEntries.length;
  const hasGolden = clusterHasGolden(cluster, dominantBuilderTopic);
  const isGenericBucket = GENERIC_BRANCH_BUCKETS.has(cluster) || builderTopicDiversity > 3 || dominantShare < 0.55;

  const reasons: string[] = [
    `volume=${stats.count}/${total} (${pct}%)`,
    `drift_ratio=${Math.round(driftRatio * 100)}%`,
    `dominant_topic=${dominantBuilderTopic} (${Math.round(dominantShare * 100)}%)`,
    `builder_topic_diversity=${builderTopicDiversity}`,
  ];

  if (hasGolden) {
    reasons.push('já coberto por golden + perfil ancorado');
    return {
      cluster,
      count: stats.count,
      pct,
      slide_topic_drift: stats.drift,
      instruction_artifacts: stats.artifacts,
      has_golden: true,
      sample_slugs: stats.slugs,
      dominant_builder_topic: dominantBuilderTopic,
      dominant_builder_topic_share: Math.round(dominantShare * 1000) / 1000,
      builder_topic_diversity: builderTopicDiversity,
      decision: 'coberto',
      confidence: 'alta',
      decision_score: 100,
      decision_reasons: reasons,
    };
  }

  let decision: ClusterDecision = 'cauda_longa';
  let decisionScore = 0;

  if (stats.count >= threshold) decisionScore += 2;
  if (driftRatio >= 0.25) decisionScore += 2;
  else if (driftRatio >= 0.15) decisionScore += 1;
  if (!isGenericBucket && dominantShare >= 0.55) decisionScore += 2;
  if (stats.artifacts > 0) decisionScore -= 1;

  if (stats.count >= threshold && !isGenericBucket && dominantShare >= 0.55 && driftRatio >= 0.15) {
    decision = 'novo_ramo';
    reasons.push('sinal forte de ramo específico com drift semântico');
  } else if (stats.count >= threshold) {
    decision = 'absorver';
    reasons.push('tem volume, mas ainda parece bucket amplo ou residual');
  } else if (!isGenericBucket && (stats.count >= 3 || driftRatio >= 0.2)) {
    decision = 'absorver';
    reasons.push('recorte semântico útil, mas abaixo do corte de ramo forte');
  } else {
    decision = 'cauda_longa';
    reasons.push('volume insuficiente para manter âncora própria');
  }

  const confidence: ClusterConfidence =
    decisionScore >= 4 ? 'alta' : decisionScore >= 2 ? 'media' : 'baixa';

  return {
    cluster,
    count: stats.count,
    pct,
    slide_topic_drift: stats.drift,
    instruction_artifacts: stats.artifacts,
    has_golden: false,
    sample_slugs: stats.slugs,
    dominant_builder_topic: dominantBuilderTopic,
    dominant_builder_topic_share: Math.round(dominantShare * 1000) / 1000,
    builder_topic_diversity: builderTopicDiversity,
    decision,
    confidence,
    decision_score: decisionScore,
    decision_reasons: reasons,
  };
}

function recommendGoldens(
  clusterSummaries: ClusterSummary[],
): { cluster: string; count: number; pct: number; priority: string; needs_golden: boolean }[] {
  return clusterSummaries
    .map((summary) => {
      const needsGolden = summary.decision === 'novo_ramo';
      let priority = 'cauda longa — fallback L2-shallow';
      if (summary.decision === 'coberto') priority = 'coberto — manter referência';
      else if (summary.decision === 'novo_ramo') priority = 'golden + perfil ancorado (ramo forte)';
      else if (summary.decision === 'absorver') priority = 'absorver em ramo existente';
      else if (summary.count >= 3) priority = 'avaliar após ramos principais';
      return { cluster: summary.cluster, count: summary.count, pct: summary.pct, priority, needs_golden: needsGolden };
    })
    .sort((a, b) => b.count - a.count);
}

async function main() {
  const subtopicoFilter = parseArg('subtopico');
  const supabase = await createServerSupabase();
  const PAGE = 200;
  let offset = 0;
  const rows: Row[] = [];

  while (true) {
    let query = supabase
      .from('modulos_estudo')
      .select('modulo_slug, banca, titulo_aula, conteudo_json')
      .ilike('modulo_slug', '%puncao-venosa%')
      .order('modulo_slug', { ascending: true });

    const { data, error } = await query.range(offset, offset + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data?.length) break;

    for (const row of data) {
      const cj = row.conteudo_json as Record<string, unknown> | null;
      if (!cj) continue;

      const qd = (cj.question_data ?? {}) as {
        instruction?: string;
        options?: QuestionOption[];
        text_fragment?: string;
      };
      const meta = (cj.meta ?? {}) as { subtopico?: string };
      const instruction = String(qd.instruction ?? '').trim();
      const options = Array.isArray(qd.options) ? qd.options : [];
      const textFragment = String(qd.text_fragment ?? '').trim();
      const subtopico = String(meta.subtopico ?? row.titulo_aula ?? '').trim();

      if (subtopicoFilter && subtopico !== subtopicoFilter) continue;

      const family = classifyFamily(instruction, subtopico, options, textFragment);
      const builderTopic = inferPuncaoTopic(instruction, options);
      const pedagogicalCluster = refinePedagogicalCluster(instruction, options, family, builderTopic);
      const slides = cj.reverse_study_slides ?? cj.study_slides;

      rows.push({
        modulo_slug: row.modulo_slug as string,
        banca: (row.banca as string | null) ?? null,
        family,
        builder_topic: builderTopic,
        pedagogical_cluster: pedagogicalCluster,
        has_instruction_artifacts: hasInstructionArtifacts(instruction),
        slide_topic_drift: detectSlideTopicDrift(instruction, slides),
        has_golden_branch: clusterHasGolden(pedagogicalCluster, builderTopic),
        instruction_preview: instruction.slice(0, 120).replace(/\s+/g, ' '),
      });
    }

    offset += PAGE;
    if (data.length < PAGE) break;
  }

  const familyCounts: Record<string, number> = {};
  const builderTopicCounts: Record<string, number> = {};
  const clusterStats = new Map<string, ClusterAccum>();

  for (const r of rows) {
    familyCounts[r.family] = (familyCounts[r.family] ?? 0) + 1;
    builderTopicCounts[r.builder_topic] = (builderTopicCounts[r.builder_topic] ?? 0) + 1;
    const cur =
      clusterStats.get(r.pedagogical_cluster) ?? { count: 0, drift: 0, artifacts: 0, slugs: [], builderTopics: {} };
    cur.count += 1;
    if (r.slide_topic_drift) cur.drift += 1;
    if (r.has_instruction_artifacts) cur.artifacts += 1;
    if (cur.slugs.length < 3) cur.slugs.push(r.modulo_slug);
    cur.builderTopics[r.builder_topic] = (cur.builderTopics[r.builder_topic] ?? 0) + 1;
    clusterStats.set(r.pedagogical_cluster, cur);
  }

  const total = rows.length;
  const driftTotal = rows.filter((r) => r.slide_topic_drift).length;
  const artifactsTotal = rows.filter((r) => r.has_instruction_artifacts).length;
  const withoutGolden = rows.filter((r) => !r.has_golden_branch).length;
  const clusterSummaries = [...clusterStats.entries()]
    .map(([cluster, stats]) => assessClusterSummary(cluster, stats, total))
    .sort((a, b) => b.count - a.count);
  const recommendations = recommendGoldens(clusterSummaries);
  const goldensNeeded = recommendations.filter((r) => r.needs_golden);
  const decisionCounts = clusterSummaries.reduce<Record<string, number>>((acc, summary) => {
    acc[summary.decision] = (acc[summary.decision] ?? 0) + 1;
    return acc;
  }, {});

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: subtopicoFilter ?? 'Punção Venosa e Cuidados com Cateteres',
    total,
    existing_golden: PUNCAO_GOLDEN,
    family_counts: familyCounts,
    builder_topic_counts: builderTopicCounts,
    drift_total: driftTotal,
    instruction_artifacts_total: artifactsTotal,
    without_golden_branch: withoutGolden,
    cluster_decisions: clusterSummaries,
    decision_counts: decisionCounts,
    pedagogical_clusters: clusterSummaries.map(({ cluster, count, pct, slide_topic_drift, instruction_artifacts, has_golden, sample_slugs }) => ({
      cluster,
      count,
      pct,
      slide_topic_drift,
      instruction_artifacts,
      has_golden,
      sample_slugs,
    })),
    golden_recommendations: recommendations,
    goldens_needed_count: goldensNeeded.length,
    goldens_needed: goldensNeeded.map((g) => g.cluster),
    rows,
  };

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outPath = resolve(artifactsDir, 'puncao-topic-cluster-report.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

  console.log(`[cluster-puncao] total=${total} drift=${driftTotal} artifacts=${artifactsTotal}`);
  console.log('[cluster-puncao] família:', familyCounts);
  console.log('[cluster-puncao] builder_topic:', builderTopicCounts);
  console.log('[cluster-puncao] decisões:', decisionCounts);
  console.log('[cluster-puncao] clusters pedagógicos (top):');
  for (const c of report.cluster_decisions.slice(0, 12)) {
    console.log(
      `  - ${c.cluster}: ${c.count} (${c.pct}%) drift=${c.slide_topic_drift} golden=${c.has_golden ? 'sim' : 'não'} decisão=${c.decision} confiança=${c.confidence}`,
    );
  }
  console.log(`[cluster-puncao] goldens recomendados (≥10%): ${goldensNeeded.length}`);
  for (const g of goldensNeeded) {
    console.log(`  → ${g.cluster} (${g.count} questões, ${g.pct}%)`);
  }
  console.log(`[cluster-puncao] relatório=${outPath}`);
}

main().catch((err) => {
  console.error('[cluster-puncao]', err);
  process.exit(1);
});
