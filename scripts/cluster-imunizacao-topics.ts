#!/usr/bin/env tsx
/**
 * Clusteriza questões de Imunização por família × tema pedagógico.
 * Uso: npm run cluster:imunizacao
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

const SUBTOPICO = 'Imunização';

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'V/F — intervalos PNI (I/II/III/IV)': 'questao-premium-cpcon-imunizacao-intervalos-vf.json',
  'Calendário vacinal — infantil': 'questao-premium-fundatec-meningococica-3meses.json',
  'Calendário vacinal — adolescente/adulto/idoso': 'questao-premium-admtec-imunizacao-adolescente-cartao-perdido.json',
  'Técnica de aplicação / sala de vacinação': 'questao-premium-decorp-imunizacao-triplice-viral-via.json',
};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

const CLUSTER_TO_BRANCH: Record<string, string> = {
  'V/F — intervalos PNI (I/II/III/IV)': 'imunizacao_vf_intervalos',
  'Calendário vacinal — infantil': 'imunizacao_calendario',
  'Calendário vacinal — adolescente/adulto/idoso': 'imunizacao_calendario',
  'Gestante / puérpera — vacinação': 'imunizacao_calendario',
  'HPV / campanhas e prevenção': 'imunizacao_calendario',
  'Cadeia de frio / conservação / SI-PNI': 'imunizacao_cadeia_frio',
  'Técnica de aplicação / sala de vacinação': 'imunizacao_generico',
  'Contraindicações / eventos adversos': 'imunizacao_generico',
  'Conceito — tipos de vacina / imunobiológicos': 'imunizacao_generico',
  'Certo ou errado': 'imunizacao_generico',
  'INCORRETA / EXCETO': 'imunizacao_generico',
  'Default — sem âncora temática': 'imunizacao_generico',
};

function inferBuilderTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();

  if (/intervalo|simult[aâ]nea|refor[cç]o|grace period|atraso vacinal|dose.*anterior/.test(blob)) {
    return 'Intervalos e esquemas';
  }
  if (/cadeia de frio|conserva[cç][aã]o|refriger|congel|termo|si-pni|imunobiol/.test(blob)) {
    return 'Cadeia de frio / PNI operacional';
  }
  if (/gestante|pu[eé]rper|pr[eé]-natal|gravida/.test(blob)) {
    return 'Gestante / puérpera';
  }
  if (/\bhpv\b|papiloma|campanha.*vacin/.test(blob)) {
    return 'HPV / campanhas';
  }
  if (/rec[eé]m-nascido|lactente|2 meses|4 meses|6 meses|infantil|crian[cç]a|bcg|penta|hexa|tr[ií]plice/.test(blob)) {
    return 'Calendário infantil';
  }
  if (/adolescente|adulto|idoso|dT|dupla adulto|influenza|gripe/.test(blob)) {
    return 'Calendário adolescente/adulto';
  }
  if (/contraindica|evento adverso|rea[cç][aã]o adversa|anafilax|pós-vacinal/.test(blob)) {
    return 'Contraindicações / EA';
  }
  if (/t[eé]cnica|aplica[cç][aã]o|sala de vacina|intramuscular|deltoide|ventrogluteo|6 certos/.test(blob)) {
    return 'Técnica de vacinação';
  }
  if (/atenuad|inativad|composi[cç][aã]o|tipos de vacina|imuniza[cç][aã]o passiva|soro/.test(blob)) {
    return 'Conceito imunobiológico';
  }
  return 'Imunização — conceito geral';
}

function refinePedagogicalCluster(
  instruction: string,
  options: QuestionOption[],
  family: FamilyId,
  builderTopic: string,
): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();

  if (
    family === 'vf' ||
    (/\b(i|ii|iii|iv)\s*[-–—]/i.test(instruction) &&
      /intervalo|simult[aâ]nea|refor[cç]o|vacina.*vacina|imunobiol/.test(blob))
  ) {
    return 'V/F — intervalos PNI (I/II/III/IV)';
  }
  if (family === 'certo_errado') return 'Certo ou errado';
  if (/\bexceto\b|\bincorreta\b|\bincorreto\b/.test(blob)) return 'INCORRETA / EXCETO';

  if (builderTopic === 'Intervalos e esquemas' && /\b(i|ii|iii)\s*[-–—]/i.test(instruction)) {
    return 'V/F — intervalos PNI (I/II/III/IV)';
  }
  if (builderTopic === 'Cadeia de frio / PNI operacional') return 'Cadeia de frio / conservação / SI-PNI';
  if (builderTopic === 'Gestante / puérpera') return 'Gestante / puérpera — vacinação';
  if (builderTopic === 'HPV / campanhas') return 'HPV / campanhas e prevenção';
  if (builderTopic === 'Calendário infantil') return 'Calendário vacinal — infantil';
  if (builderTopic === 'Calendário adolescente/adulto') {
    return 'Calendário vacinal — adolescente/adulto/idoso';
  }
  if (builderTopic === 'Contraindicações / EA') return 'Contraindicações / eventos adversos';
  if (builderTopic === 'Técnica de vacinação') return 'Técnica de aplicação / sala de vacinação';
  if (builderTopic === 'Conceito imunobiológico') return 'Conceito — tipos de vacina / imunobiológicos';
  if (builderTopic === 'Intervalos e esquemas') return 'Calendário vacinal — adolescente/adulto/idoso';

  if (builderTopic !== 'Imunização — conceito geral') return builderTopic;
  return 'Default — sem âncora temática';
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

type ClusterDecision = 'novo_ramo' | 'absorver' | 'cauda_longa' | 'coberto';
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
  let decision: ClusterDecision = 'cauda_longa';
  if (hasGolden) decision = 'coberto';
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
    pedagogical_branch_proposed: CLUSTER_TO_BRANCH[cluster] ?? 'imunizacao_generico',
    sample_slugs: stats.slugs.slice(0, 5),
    decision,
  };
}

async function main() {
  const lote = parseArg('lote') ?? 'imunizacao-completo';
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
      pedagogical_branch_proposed: CLUSTER_TO_BRANCH[cluster] ?? 'imunizacao_generico',
      has_instruction_artifacts: hasArtifacts,
      slide_topic_drift: slideDrift,
      slide_contract_issues: contractIssues,
      premium_status: resolvePremiumStatus(cj, gateCodes),
      meta_pedagogical_branch: meta.pedagogical_branch ?? null,
      instruction_preview: instruction.slice(0, 120).replace(/\s+/g, ' '),
    });

    const acc = clusterMap.get(cluster) ?? { count: 0, drift: 0, contract_fail: 0, artifacts: 0, slugs: [], builderTopics: {} };
    acc.count += 1;
    if (slideDrift) acc.drift += 1;
    if (contractIssues.length) acc.contract_fail += 1;
    if (hasArtifacts) acc.artifacts += 1;
    acc.slugs.push(slug);
    acc.builderTopics[builderTopic] = (acc.builderTopics[builderTopic] ?? 0) + 1;
    clusterMap.set(cluster, acc);
  }

  const total = rows.length;
  const clusterSummaries = [...clusterMap.entries()]
    .map(([cluster, stats]) => assessClusterSummary(cluster, stats, total))
    .sort((a, b) => b.count - a.count);

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: SUBTOPICO,
    lote,
    total,
    drift_total: rows.filter((r) => r.slide_topic_drift).length,
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
  const outPath = resolve(outDir, 'imunizacao-topic-cluster-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[cluster:imunizacao] total=${total} golden=${report.golden_total} stub=${report.stub_total} drift=${report.drift_total}`);
  console.log(`[cluster:imunizacao] branch_backfill_needed=${report.branch_backfill_needed}`);
  console.log(`[cluster:imunizacao] report=${outPath}`);
  for (const c of clusterSummaries.slice(0, 14)) {
    console.log(`  ${c.decision.padEnd(12)} ${String(c.count).padStart(3)} (${String(c.pct).padStart(5)}%) — ${c.cluster}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
