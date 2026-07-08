#!/usr/bin/env tsx
/**
 * Clusteriza questões de Verificação de Sinais Vitais por família × tema pedagógico.
 * Uso: npm run cluster:sinais-vitais
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { classifyFamily, type FamilyId, type QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import {
  detectDuplicateDangerJustifications,
  detectSlideTopicDrift,
  hasInstructionArtifacts,
} from '@/lib/catalogMigration/slideContract';
import { hasPremiumStubMarkers } from '@/lib/catalogMigration/upgradePremiumHybrid';
import { premiumGateErrors } from '@/lib/catalogMigration/premiumGate';
import { parseArg } from '@/lib/catalogMigration/cliArgs';

const SUBTOPICO = 'Verificação de Sinais Vitais';

const GOLDEN_BY_CLUSTER: Record<string, string> = {};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

const CLUSTER_TO_BRANCH: Record<string, string> = {
  'V/F — faixas de referência (I/II/III)': 'vitals_vf_faixas',
  'PA — técnica e interpretação': 'vitals_pa_tecnica',
  'Temperatura — vias e febre': 'vitals_temperatura',
  'Faixas pediátricas por idade': 'vitals_pediatrico_faixas',
  'Glasgow / escala de coma': 'vitals_glasgow',
  'EXCETO/INCORRETA — técnica SV': 'vitals_exceto_tecnica',
  'SpO₂ e oximetria': 'vitals_spo2',
  'FC e pulso — faixas e técnica': 'vitals_fc_faixas',
  'FR e padrão respiratório': 'vitals_fr_faixas',
  'Certo ou errado': 'vitals_generico',
  'SV geral / múltiplos parâmetros': 'vitals_generico',
  'Default — sem âncora temática': 'vitals_generico',
};

const DRIFT_PATTERNS: RegExp[] = [
  /processo de enfermagem|diagn[oó]stico de enfermagem|nanda\b|nic\b|noc\b/i,
  /semiologia em enfermagem(?!.*sinais vitais)/i,
  /no[cç][oõ]es de (anatomia|fisiologia)/i,
  /exames complementares/i,
  /oxigenoterapia(?!.*spo2)/i,
];

const VITALS_PACKAGE =
  'vitals-panel · vitals-reference-board · vitals-translate-tap · vitals-classify-arena (bespoke legado)';

function corpus(instruction: string, options: QuestionOption[]): string {
  return `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
}

function isSvSlug(slug: string, subtopico?: string): boolean {
  if (!slug.includes('verificacao-de-sinais-vitais')) return false;
  const norm = (subtopico ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (norm && !norm.includes('sinais vitais') && !norm.includes('verificacao de sinais vitais')) {
    return false;
  }
  return true;
}

function inferBuilderTopic(instruction: string, options: QuestionOption[]): string {
  const blob = corpus(instruction, options);

  if (DRIFT_PATTERNS.some((p) => p.test(blob))) return 'Drift taxonômico';
  if (/glasgow|coma de glasgow|\becg\b|escala de coma/.test(blob)) return 'Glasgow / ECG';
  if (/apgar/.test(blob)) return 'APGAR (neonatal)';
  if (/press[aã]o arterial|\bpa\b|esfigmoman|manguito|korotkoff|pam\b|hipertens/.test(blob)) {
    return 'PA';
  }
  if (/temperatura|febre|axilar|retal|timp[aâ]nica|hipoterm/.test(blob)) return 'Temperatura';
  if (/spo2|oximetria|satura[cç][aã]o/.test(blob)) return 'SpO₂';
  if (/freq[uê]ncia card|pulso|\bfc\b|taquicard|bradicard|ritmo card/.test(blob)) return 'FC / pulso';
  if (/freq[uê]ncia resp|\bfr\b|irpm|taquipn|bradipn|padr[aã]o respirat/.test(blob)) return 'FR';
  if (/rec[eé]m.nascido|lactente|neonat|pr[eé].escolar|escolar|adolescente|pedi[aá]tr|crian[cç]a/.test(blob)) {
    return 'Pediátrico — faixas etárias';
  }
  if (/dor|eva\b|escala.*dor/.test(blob)) return 'Dor (EVA)';
  if (/aferi[cç][aã]o|t[eé]cnica|verifica[cç][aã]o|sinais vitais/.test(blob)) return 'Técnica de aferição';
  return 'SV geral';
}

function refinePedagogicalCluster(
  instruction: string,
  options: QuestionOption[],
  family: FamilyId,
  builderTopic: string,
): string {
  const blob = corpus(instruction, options);

  if (builderTopic === 'Drift taxonômico') return 'Drift taxonômico — reclassificar subtópico';

  if (
    family === 'vf' ||
    (/\b(i|ii|iii|iv)\s*[-–—]/i.test(instruction) &&
      /sinais vitais|\bfc\b|\bfr\b|\bpa\b|temperatura|spo2|taqui|bradi|febr|norma/i.test(blob))
  ) {
    return 'V/F — faixas de referência (I/II/III)';
  }
  if (family === 'certo_errado') return 'Certo ou errado';
  if (/\bexceto\b|\bincorreta\b|\bincorreto\b/.test(blob)) return 'EXCETO/INCORRETA — técnica SV';

  if (builderTopic === 'Glasgow / ECG') return 'Glasgow / escala de coma';
  if (builderTopic === 'PA') return 'PA — técnica e interpretação';
  if (builderTopic === 'Temperatura') return 'Temperatura — vias e febre';
  if (builderTopic === 'SpO₂') return 'SpO₂ e oximetria';
  if (builderTopic === 'FC / pulso') return 'FC e pulso — faixas e técnica';
  if (builderTopic === 'FR') return 'FR e padrão respiratório';
  if (builderTopic === 'Pediátrico — faixas etárias') return 'Faixas pediátricas por idade';
  if (builderTopic === 'APGAR (neonatal)') return 'Faixas pediátricas por idade';
  if (builderTopic === 'Dor (EVA)') return 'SV geral / múltiplos parâmetros';
  if (builderTopic === 'Técnica de aferição') return 'PA — técnica e interpretação';

  return 'SV geral / múltiplos parâmetros';
}

type Row = {
  modulo_slug: string;
  banca: string | null;
  family: FamilyId;
  builder_topic: string;
  pedagogical_cluster: string;
  pedagogical_branch_proposed: string;
  has_instruction_artifacts: boolean;
  slide_topic_drift: boolean;
  slide_contract_issues: string[];
  premium_status: 'golden' | 'hybrid_ok' | 'stub' | 'legacy';
  meta_pedagogical_branch: string | null;
  instruction_preview: string;
};

type ClusterAccum = {
  count: number;
  drift: number;
  contract_fail: number;
  artifacts: number;
  slugs: string[];
  builderTopics: Record<string, number>;
};

type ClusterDecision = 'novo_ramo' | 'absorver' | 'cauda_longa' | 'coberto' | 'reclassificar';
type ClusterSummary = {
  cluster: string;
  count: number;
  pct: number;
  slide_topic_drift: number;
  slide_contract_failures: number;
  instruction_artifacts: number;
  has_golden: boolean;
  golden_file: string | null;
  pedagogical_branch_proposed: string;
  l3_package: string;
  sample_slugs: string[];
  decision: ClusterDecision;
};

function resolvePremiumStatus(
  cj: Record<string, unknown>,
  gateIssueCodes: string[],
): Row['premium_status'] {
  const meta = (cj.meta ?? {}) as { content_standard?: string };
  const slides = cj.reverse_study_slides ?? cj.study_slides;
  if (meta.content_standard === 'golden-v1') return 'golden';
  if (gateIssueCodes.includes('stub_markers') || hasPremiumStubMarkers(slides)) return 'stub';
  if (!Array.isArray(slides) || slides.length !== 4) return 'legacy';
  if (gateIssueCodes.length === 0) return 'hybrid_ok';
  return 'legacy';
}

function slideContractIssueCodes(cj: Record<string, unknown>): string[] {
  const issues: string[] = [];
  const slides = cj.reverse_study_slides ?? cj.study_slides;
  const dup = detectDuplicateDangerJustifications(slides);
  if (dup.duplicate) issues.push('danger_duplicate_justifications');
  for (const g of premiumGateErrors(cj as Parameters<typeof premiumGateErrors>[0])) {
    if (g.severity === 'error' || g.code === 'slide_topic_drift') issues.push(g.code);
  }
  return [...new Set(issues)];
}

function assessClusterSummary(cluster: string, stats: ClusterAccum, total: number): ClusterSummary {
  const pct = Math.round((stats.count / total) * 1000) / 10;
  const threshold = Math.max(5, Math.ceil(total * 0.1));
  const hasGolden = COVERED_CLUSTERS.has(cluster);
  const isDrift = cluster.startsWith('Drift');
  let decision: ClusterDecision = 'cauda_longa';
  if (isDrift) decision = 'reclassificar';
  else if (hasGolden) decision = 'coberto';
  else if (stats.count >= threshold) decision = 'novo_ramo';
  else if (stats.count >= 3) decision = 'absorver';

  return {
    cluster,
    count: stats.count,
    pct,
    slide_topic_drift: stats.drift,
    slide_contract_failures: stats.contract_fail,
    instruction_artifacts: stats.artifacts,
    has_golden: hasGolden,
    golden_file: GOLDEN_BY_CLUSTER[cluster] ?? null,
    pedagogical_branch_proposed: CLUSTER_TO_BRANCH[cluster] ?? 'vitals_generico',
    l3_package: isDrift ? '—' : VITALS_PACKAGE,
    sample_slugs: stats.slugs.slice(0, 5),
    decision,
  };
}

async function main() {
  const lote = parseArg('lote') ?? 'sinais-vitais-completo';
  const questionsDir = resolve(process.cwd(), `data/catalog-migration/${lote}/questions`);
  const files = readdirSync(questionsDir).filter((f) => f.endsWith('.json'));

  const rows: Row[] = [];
  const clusterMap = new Map<string, ClusterAccum>();
  let skippedNonSv = 0;

  for (const file of files.sort()) {
    const slug = file.replace(/\.json$/, '');
    const cj = JSON.parse(readFileSync(resolve(questionsDir, file), 'utf8')) as Record<string, unknown>;
    const meta = (cj.meta ?? {}) as { banca?: string; subtopico?: string; pedagogical_branch?: string };
    if (!isSvSlug(slug, meta.subtopico)) {
      skippedNonSv += 1;
      continue;
    }

    const qd = (cj.question_data ?? {}) as { instruction?: string; options?: QuestionOption[] };
    const instruction = String(qd.instruction ?? '');
    const options = Array.isArray(qd.options) ? qd.options : [];
    const family = classifyFamily(instruction, String(meta.subtopico ?? SUBTOPICO), options, '');
    const builderTopic = inferBuilderTopic(instruction, options);
    const cluster = refinePedagogicalCluster(instruction, options, family, builderTopic);
    const gateCodes = premiumGateErrors(cj as Parameters<typeof premiumGateErrors>[0]).map((g) => g.code);
    const contractIssues = slideContractIssueCodes(cj);
    const slides = cj.reverse_study_slides ?? cj.study_slides;
    const slideDrift = detectSlideTopicDrift(instruction, slides);
    const hasArtifacts = hasInstructionArtifacts(instruction);

    rows.push({
      modulo_slug: slug,
      banca: meta.banca ?? null,
      family,
      builder_topic: builderTopic,
      pedagogical_cluster: cluster,
      pedagogical_branch_proposed: CLUSTER_TO_BRANCH[cluster] ?? 'vitals_generico',
      has_instruction_artifacts: hasArtifacts,
      slide_topic_drift: slideDrift,
      slide_contract_issues: contractIssues,
      premium_status: resolvePremiumStatus(cj, gateCodes),
      meta_pedagogical_branch: meta.pedagogical_branch ?? null,
      instruction_preview: instruction.slice(0, 120).replace(/\s+/g, ' '),
    });

    const acc = clusterMap.get(cluster) ?? {
      count: 0,
      drift: 0,
      contract_fail: 0,
      artifacts: 0,
      slugs: [],
      builderTopics: {},
    };
    acc.count += 1;
    if (slideDrift) acc.drift += 1;
    if (contractIssues.length) acc.contract_fail += 1;
    if (hasArtifacts) acc.artifacts += 1;
    acc.slugs.push(slug);
    acc.builderTopics[builderTopic] = (acc.builderTopics[builderTopic] ?? 0) + 1;
    clusterMap.set(cluster, acc);
  }

  const total = rows.length;
  const strongThreshold = Math.max(5, Math.ceil(total * 0.1));
  const clusterSummaries = [...clusterMap.entries()]
    .map(([cluster, stats]) => assessClusterSummary(cluster, stats, total))
    .sort((a, b) => b.count - a.count);

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: SUBTOPICO,
    lote,
    total,
    skipped_non_sv_in_lote: skippedNonSv,
    strong_threshold: strongThreshold,
    drift_total: rows.filter((r) => r.slide_topic_drift).length,
    taxonomy_drift_slugs: rows.filter((r) => r.pedagogical_cluster.startsWith('Drift')).length,
    goldens_needed: clusterSummaries.filter((c) => c.decision === 'novo_ramo' && !c.has_golden).length,
    existing_goldens_examples: Object.values(GOLDEN_BY_CLUSTER),
    family_counts: rows.reduce(
      (acc, r) => {
        acc[r.family] = (acc[r.family] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    premium_status_counts: rows.reduce(
      (acc, r) => {
        acc[r.premium_status] = (acc[r.premium_status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    stub_total: rows.filter((r) => r.premium_status === 'stub').length,
    golden_total: rows.filter((r) => r.premium_status === 'golden').length,
    contract_fail_total: rows.filter((r) => r.slide_contract_issues.length > 0).length,
    branch_backfill_needed: rows.filter((r) => !r.meta_pedagogical_branch).length,
    cluster_decisions: clusterSummaries,
    rows,
  };

  const outDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'sinais-vitais-topic-cluster-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(
    `[cluster:sinais-vitais] total=${total} skipped_non_sv=${skippedNonSv} golden=${report.golden_total} stub=${report.stub_total} drift=${report.drift_total}`,
  );
  console.log(`[cluster:sinais-vitais] limiar ramo forte=${strongThreshold}`);
  console.log(`[cluster:sinais-vitais] branch_backfill_needed=${report.branch_backfill_needed}`);
  console.log(`[cluster:sinais-vitais] report=${outPath}`);
  for (const c of clusterSummaries) {
    console.log(
      `  ${c.decision.padEnd(14)} ${String(c.count).padStart(3)} (${String(c.pct).padStart(5)}%) — ${c.cluster}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
