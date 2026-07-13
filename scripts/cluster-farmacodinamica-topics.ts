#!/usr/bin/env tsx
/**
 * Clusteriza questões de Farmacodinâmica e Farmacocinética por família × tema pedagógico.
 * Padrão: docs/PACOTE_PREMIUM_CHECKLIST.md § Qualidade pedagógica por ramos
 *
 * Uso:
 *   npm run cluster:farmacodinamica
 *   npm run cluster:farmacodinamica -- --lote=farmacodinamica-e-farmacocinetica-completo
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
import { hasPremiumStubMarkers } from '@/lib/catalogMigration/premiumStubMarkers';
import { premiumGateErrors } from '@/lib/catalogMigration/premiumGate';
import { parseArg } from '@/lib/catalogMigration/cliArgs';

const SUBTOPICO = 'Farmacodinâmica e Farmacocinética';

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'V/F — ADME e definições PK/PD': 'questao-premium-funcamp-farmacodinamica-farmacocinetica-vf.json',
  'Protocolo / administração clínica (EV, infusão)': 'questao-premium-idecan-omeprazol-ev-ulcera.json',
};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

const GENERIC_BRANCH_BUCKETS = new Set([
  'Certo ou errado',
  'Conceito — farmacologia geral',
  'Default — sem âncora temática',
  'V/F — assertivas I/II/III',
]);

/** Slug indica outro subtópico canônico — só quando enunciado não ancora PK/PD. */
function hasFarmacoAnchor(blob: string): boolean {
  return /farmacocin|farmacodin|\badme\b|meia-vida|meia vida|fármaco|farmaco|opioide|fentanil|meropenem|insulin|omeprazol|diazepam|biodispon|1ª passagem|primeira passagem|farmacovigil|anest[eé]sico local|agentes farmacol|clearance|concentra[cç][aã]o plasm/i.test(
    blob,
  );
}

function detectTaxonomyDrift(slug: string, instruction: string): string | null {
  const s = slug.toLowerCase();
  const blob = instruction.toLowerCase();

  if (hasFarmacoAnchor(blob)) return null;

  if (/vias-de-administracao/.test(s)) return 'Drift taxonômico — Vias de Administração';
  if (/epidemiologia-e-vigilancia|epidemiologia/.test(s)) return 'Drift taxonômico — Epidemiologia';
  if (/processo-de-enfermagem/.test(s)) return 'Drift taxonômico — Processo de Enfermagem';
  if (/cuidados-na-administracao-de-medicamentos/.test(s)) {
    return 'Drift taxonômico — Cuidados na Administração de Medicamentos';
  }
  if (/urgencias-e-emergencias/.test(s)) return 'Drift taxonômico — Urgências e Emergências';
  return null;
}

function inferBuilderTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();

  if (/omeprazol|infus[aã]o cont[ií]nua|dilui[cç][aã]o.*ev|antibi[oó]tico.*endoven|ibp|inibidor.*bomba/.test(blob)) {
    return 'Administração clínica / protocolo EV';
  }
  if (/fentanil|opioide|morfina|analgesia.*potente|rigidez tor[aá]cica|depress[aã]o respirat[oó]ria/.test(blob)) {
    return 'Farmacodinâmica clínica (opioides/efeitos)';
  }
  if (/meia-vida|meia vida|concentra[cç][aã]o plasm[aá]tica|clearance|biodisponibilidade/.test(blob)) {
    return 'Parâmetros cinéticos';
  }
  if (/intera[cç][aã]o|f[aá]rmaco-f[aá]rmaco|sinergismo|antagonismo|inibidor enzim[aá]tico/.test(blob)) {
    return 'Interações medicamentosas';
  }
  if (/farmacocin[eé]tica|\badme\b|absor[cç][aã]o|metabolismo|excre[cç][aã]o|distribui[cç][aã]o|primeira passagem|1ª passagem/.test(blob)) {
    return 'Farmacocinética (ADME)';
  }
  if (/farmacodin[aâ]mica|mecanismo de a[cç][aã]o|receptor|efeito adverso|pot[eê]ncia|efic[aá]cia/.test(blob)) {
    return 'Farmacodinâmica (ação)';
  }
  return 'Farmacologia — conceito geral';
}

function refinePedagogicalCluster(
  instruction: string,
  options: QuestionOption[],
  family: FamilyId,
  builderTopic: string,
  slug: string,
): string {
  const drift = detectTaxonomyDrift(slug, instruction);
  if (drift) return drift;

  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();

  if (family === 'vf' || (/\b(i|ii|iii)\s*[-–—]/i.test(instruction) && /correto|afirmativas|verdadeira/.test(blob))) {
    return 'V/F — ADME e definições PK/PD';
  }
  if (family === 'certo_errado') return 'Certo ou errado';
  if (family === 'protocolo' || builderTopic === 'Administração clínica / protocolo EV') {
    return 'Protocolo / administração clínica (EV, infusão)';
  }
  if (/\bexceto\b|\bincorreta\b|\bincorreto\b/.test(blob)) return 'INCORRETA / EXCETO';

  if (builderTopic === 'Parâmetros cinéticos') return 'Conceito — meia-vida e concentração';
  if (builderTopic === 'Interações medicamentosas') return 'Conceito — interações';
  if (builderTopic === 'Farmacodinâmica clínica (opioides/efeitos)') {
    return 'Conceito — farmacodinâmica clínica';
  }
  if (builderTopic.startsWith('Farmacocinética')) return 'Conceito — farmacocinética (ADME)';
  if (builderTopic.startsWith('Farmacodinâmica')) return 'Conceito — farmacodinâmica (ação)';

  if (builderTopic !== 'Farmacologia — conceito geral') return builderTopic;
  return 'Default — sem âncora temática';
}

/** Mapa cluster → pedagogical_branch (BRANCH_DESIGN_MAP). */
const CLUSTER_TO_BRANCH: Record<string, string> = {
  'V/F — ADME e definições PK/PD': 'farmaco_pk_pd_vf',
  'Protocolo / administração clínica (EV, infusão)': 'farmaco_clinico_protocolo',
  'Conceito — farmacocinética (ADME)': 'farmaco_generico',
  'Conceito — farmacodinâmica (ação)': 'farmaco_generico',
  'Conceito — farmacodinâmica clínica': 'farmaco_clinico_protocolo',
  'Conceito — meia-vida e concentração': 'farmaco_generico',
  'Conceito — interações': 'farmaco_generico',
  'INCORRETA / EXCETO': 'farmaco_generico',
  'Certo ou errado': 'farmaco_generico',
  'Default — sem âncora temática': 'farmaco_generico',
};

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

type ClusterDecision = 'novo_ramo' | 'absorver' | 'cauda_longa' | 'coberto';
type ClusterConfidence = 'alta' | 'media' | 'baixa';

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
  sample_slugs: string[];
  dominant_builder_topic: string;
  dominant_builder_topic_share: number;
  builder_topic_diversity: number;
  decision: ClusterDecision;
  confidence: ClusterConfidence;
  decision_score: number;
  decision_reasons: string[];
};

function clusterHasGolden(cluster: string): boolean {
  return COVERED_CLUSTERS.has(cluster);
}

function assessClusterSummary(cluster: string, stats: ClusterAccum, total: number): ClusterSummary {
  const pct = Math.round((stats.count / total) * 1000) / 10;
  const threshold = Math.max(5, Math.ceil(total * 0.1));
  const driftRatio = stats.count ? stats.drift / stats.count : 0;
  const failRatio = stats.count ? stats.contract_fail / stats.count : 0;
  const builderTopicEntries = Object.entries(stats.builderTopics).sort((a, b) => b[1] - a[1]);
  const [dominantBuilderTopic = 'Sem âncora', dominantCount = 0] = builderTopicEntries[0] ?? [];
  const dominantShare = stats.count ? dominantCount / stats.count : 0;
  const builderTopicDiversity = builderTopicEntries.length;
  const hasGolden = clusterHasGolden(cluster);
  const goldenFile = GOLDEN_BY_CLUSTER[cluster] ?? null;
  const isGenericBucket =
    GENERIC_BRANCH_BUCKETS.has(cluster) ||
    cluster.startsWith('Drift taxonômico') ||
    builderTopicDiversity > 3 ||
    dominantShare < 0.55;

  const reasons: string[] = [
    `volume=${stats.count}/${total} (${pct}%)`,
    `drift_ratio=${Math.round(driftRatio * 100)}%`,
    `contract_fail_ratio=${Math.round(failRatio * 100)}%`,
    `dominant_topic=${dominantBuilderTopic} (${Math.round(dominantShare * 100)}%)`,
    `builder_topic_diversity=${builderTopicDiversity}`,
  ];

  if (hasGolden) {
    reasons.push('golden de referência em examples/');
    return {
      cluster,
      count: stats.count,
      pct,
      slide_topic_drift: stats.drift,
      slide_contract_failures: stats.contract_fail,
      instruction_artifacts: stats.artifacts,
      has_golden: true,
      golden_file: goldenFile,
      pedagogical_branch_proposed: CLUSTER_TO_BRANCH[cluster] ?? 'farmaco_generico',
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

  if (cluster.startsWith('Drift taxonômico')) {
    reasons.push('slug/enunciado pertence a outro subtópico — Classify antes de handcraft');
    return {
      cluster,
      count: stats.count,
      pct,
      slide_topic_drift: stats.drift,
      slide_contract_failures: stats.contract_fail,
      instruction_artifacts: stats.artifacts,
      has_golden: false,
      golden_file: null,
      pedagogical_branch_proposed: '—',
      sample_slugs: stats.slugs,
      dominant_builder_topic: dominantBuilderTopic,
      dominant_builder_topic_share: Math.round(dominantShare * 1000) / 1000,
      builder_topic_diversity: builderTopicDiversity,
      decision: 'absorver',
      confidence: 'alta',
      decision_score: 0,
      decision_reasons: reasons,
    };
  }

  let decision: ClusterDecision = 'cauda_longa';
  let decisionScore = 0;

  if (stats.count >= threshold) decisionScore += 2;
  if (failRatio >= 0.25) decisionScore += 2;
  else if (failRatio >= 0.15) decisionScore += 1;
  if (!isGenericBucket && dominantShare >= 0.55) decisionScore += 2;
  if (stats.artifacts > 0) decisionScore -= 1;

  if (stats.count >= threshold && !isGenericBucket && dominantShare >= 0.55) {
    decision = 'novo_ramo';
    reasons.push('volume ≥10% com separabilidade — criar golden dedicada');
  } else if (stats.count >= threshold) {
    decision = 'absorver';
    reasons.push('volume útil, absorver em ramo vizinho');
  } else if (!isGenericBucket && (stats.count >= 3 || failRatio >= 0.2)) {
    decision = 'absorver';
    reasons.push('recorte semântico abaixo do corte de ramo forte');
  } else {
    decision = 'cauda_longa';
    reasons.push('volume insuficiente para âncora própria');
  }

  const confidence: ClusterConfidence =
    decisionScore >= 4 ? 'alta' : decisionScore >= 2 ? 'media' : 'baixa';

  return {
    cluster,
    count: stats.count,
    pct,
    slide_topic_drift: stats.drift,
    slide_contract_failures: stats.contract_fail,
    instruction_artifacts: stats.artifacts,
    has_golden: false,
    golden_file: null,
    pedagogical_branch_proposed: CLUSTER_TO_BRANCH[cluster] ?? 'farmaco_generico',
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
      let priority = 'cauda longa — farmaco_generico';
      if (summary.decision === 'coberto') priority = 'coberto — manter referência';
      else if (summary.decision === 'novo_ramo') priority = 'golden + perfil ancorado (ramo forte)';
      else if (summary.decision === 'absorver') priority = 'absorver em ramo existente';
      else if (summary.count >= 3) priority = 'avaliar após ramos principais';
      return {
        cluster: summary.cluster,
        count: summary.count,
        pct: summary.pct,
        priority,
        needs_golden: needsGolden,
      };
    })
    .sort((a, b) => b.count - a.count);
}

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

async function main() {
  const lote = parseArg('lote') ?? 'farmacodinamica-e-farmacocinetica-completo';
  const questionsDir = resolve(process.cwd(), `data/catalog-migration/${lote}/questions`);
  const files = readdirSync(questionsDir).filter((f) => f.endsWith('.json'));

  const rows: Row[] = [];
  const clusterMap = new Map<string, ClusterAccum>();

  for (const file of files.sort()) {
    const slug = file.replace(/\.json$/, '');
    const cj = JSON.parse(readFileSync(resolve(questionsDir, file), 'utf8')) as Record<string, unknown>;
    const meta = (cj.meta ?? {}) as { banca?: string; subtopico?: string; pedagogical_branch?: string };
    const qd = (cj.question_data ?? {}) as { instruction?: string; options?: QuestionOption[] };
    const instruction = String(qd.instruction ?? '');
    const options = Array.isArray(qd.options) ? qd.options : [];
    const family = classifyFamily(instruction, String(meta.subtopico ?? SUBTOPICO), options, '');
    const builderTopic = inferBuilderTopic(instruction, options);
    const cluster = refinePedagogicalCluster(instruction, options, family, builderTopic, slug);
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
      pedagogical_branch_proposed: CLUSTER_TO_BRANCH[cluster] ?? 'farmaco_generico',
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
    if (slideDrift || contractIssues.length) acc.drift += 1;
    if (contractIssues.length) acc.contract_fail += 1;
    if (hasArtifacts) acc.artifacts += 1;
    acc.slugs.push(slug);
    acc.builderTopics[builderTopic] = (acc.builderTopics[builderTopic] ?? 0) + 1;
    clusterMap.set(cluster, acc);
  }

  const total = rows.length;
  const driftTotal = rows.filter((r) => r.slide_topic_drift || r.slide_contract_issues.length > 0).length;
  const artifactsTotal = rows.filter((r) => r.has_instruction_artifacts).length;
  const taxonomyDriftTotal = rows.filter((r) => r.pedagogical_cluster.startsWith('Drift taxonômico')).length;
  const branchMismatchTotal = rows.filter(
    (r) =>
      r.meta_pedagogical_branch &&
      r.meta_pedagogical_branch !== r.pedagogical_branch_proposed &&
      !r.pedagogical_cluster.startsWith('Drift'),
  ).length;

  const clusterSummaries = [...clusterMap.entries()]
    .map(([cluster, stats]) => assessClusterSummary(cluster, stats, total))
    .sort((a, b) => b.count - a.count);

  const recommendations = recommendGoldens(clusterSummaries);
  const goldensNeeded = recommendations.filter((r) => r.needs_golden);
  const decisionCounts = clusterSummaries.reduce<Record<string, number>>((acc, s) => {
    acc[s.decision] = (acc[s.decision] ?? 0) + 1;
    return acc;
  }, {});

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: SUBTOPICO,
    lote,
    total,
    existing_goldens_examples: [...new Set(Object.values(GOLDEN_BY_CLUSTER))],
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
    drift_total: driftTotal,
    taxonomy_drift_total: taxonomyDriftTotal,
    instruction_artifacts_total: artifactsTotal,
    branch_mismatch_total: branchMismatchTotal,
    contract_fail_total: rows.filter((r) => r.slide_contract_issues.length > 0).length,
    decision_counts: decisionCounts,
    cluster_decisions: clusterSummaries,
    golden_recommendations: recommendations,
    goldens_needed_count: goldensNeeded.length,
    goldens_needed: goldensNeeded.map((g) => g.cluster),
    rows,
  };

  const outDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'farmacodinamica-topic-cluster-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(
    `[cluster:farmacodinamica] total=${total} drift=${driftTotal} taxonomy_drift=${taxonomyDriftTotal} artifacts=${artifactsTotal}`,
  );
  console.log(`[cluster:farmacodinamica] report=${outPath}`);
  for (const c of clusterSummaries.slice(0, 15)) {
    console.log(`  ${c.decision.padEnd(12)} ${String(c.count).padStart(2)} (${c.pct}%) — ${c.cluster}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
