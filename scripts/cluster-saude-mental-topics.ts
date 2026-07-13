#!/usr/bin/env tsx
/**
 * Clusteriza questões de Saúde Mental por família × tema pedagógico.
 * Padrão: docs/PACOTE_PREMIUM_CHECKLIST.md § Qualidade pedagógica por ramos
 *
 * Uso (dry-run — só leitura Supabase + relatório local):
 *   npx tsx scripts/cluster-saude-mental-topics.ts
 *   npx tsx scripts/cluster-saude-mental-topics.ts --subtopico="Saúde Mental"
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { classifyFamily, type FamilyId, type QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import {
  detectDuplicateDangerJustifications,
  hasInstructionArtifacts,
} from '@/lib/catalogMigration/slideContract';
import { hasPremiumStubMarkers } from '@/lib/catalogMigration/premiumStubMarkers';
import { premiumGateErrors } from '@/lib/catalogMigration/premiumGate';
import { createServerSupabase } from '@/lib/supabase/server';
import { parseArg } from '@/lib/catalogMigration/cliArgs';

const SUBTOPICO = 'Saúde Mental';

/** Goldens de referência em examples/ (Fase 1 — ainda não aplicados em massa no catálogo). */
const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'Depressão / epidemiologia': 'questao-premium-vunesp-saude-mental-depressao-epidemiologia.json',
  'RAPS / Reforma Psiquiátrica / SRT': 'questao-premium-fau-unicentro-saude-mental-raps.json',
  'Redução de danos / entrevista motivacional': 'questao-premium-idecan-saude-mental-reducao-danos.json',
  'Tabagismo / PNCT': 'questao-premium-fgv-saude-mental-tabagismo-pnct.json',
  'Esquizofrenia / psicofármacos': 'questao-premium-instituto-aocp-saude-mental-esquizofrenia-psicofarmacos.json',
  'Agitação / crise / contenção (EXCETO)': 'questao-premium-fundatec-saude-mental-agitacao-exceto.json',
  'CAPS / acolhimento em crise': 'questao-premium-ibade-saude-mental-caps-acolhimento.json',
  'APS / técnico na ESF-RAPS': 'questao-premium-igeduc-saude-mental-tecnico-aps.json',
  'SRT / Reforma Psiquiátrica (dispositivo)': 'questao-premium-ms-sarmento-saude-mental-srt-reforma.json',
  'Acolhimento / biopsicossocial na APS': 'questao-premium-vunesp-saude-mental-biopsicossocial.json',
  'Risco suicida / prevenção (V/F)': 'questao-premium-fepese-saude-mental-risco-suicida-vf.json',
};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

type Row = {
  modulo_slug: string;
  banca: string | null;
  family: FamilyId;
  builder_topic: string;
  pedagogical_cluster: string;
  has_instruction_artifacts: boolean;
  slide_contract_issues: string[];
  premium_status: 'golden' | 'hybrid_ok' | 'stub' | 'legacy';
  instruction_preview: string;
};

type ClusterAccum = {
  count: number;
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
  slide_contract_failures: number;
  instruction_artifacts: number;
  has_golden: boolean;
  golden_file: string | null;
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
  'Saúde mental — conceito geral',
  'Protocolo / procedimento',
  'V/F — assertivas I/II/III',
  'Certo ou errado',
  'Legislação / norma',
  'Caso clínico (text_fragment)',
]);

function inferSaudeMentalTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();

  if (/\bredu[çc][ãa]o de danos|entrevista motivacional|crack|álcool.*abuso|alcool.*abuso/.test(blob)) {
    return 'Redução de danos / dependência';
  }
  if (/\btabag|fagerstr|pnct|nicotina|cigarro|fumo\b/.test(blob)) {
    return 'Tabagismo / PNCT';
  }
  if (/\bálcool|alcool|alcoolismo|abstinência|abstinencia|comunidades terapêuticas|dependência química|dependencia quimica/.test(blob)) {
    return 'Dependência química / álcool';
  }
  if (/\braps|reforma psiquiátrica|reforma psiquiatrica|\bsrt\b|serviço residencial terapêutico|servico residencial terapeutico/.test(blob)) {
    return 'RAPS / Reforma / SRT';
  }
  if (/\bcaps\b|centro de atenção psicossocial|centro de atencao psicossocial/.test(blob)) {
    return 'CAPS / dispositivo';
  }
  if (/\bagita[çc]|conten[çc]|violência iminente|violencia iminente|de-escal|surto psicótico|surto psicotico|comportamento agressivo/.test(blob)) {
    return 'Crise / agitação / contenção';
  }
  if (/\besquizofren|psicót|psicot|alucina|delírio|delirio|antipsicót|antipsicot/.test(blob)) {
    return 'Esquizofrenia / psicose';
  }
  if (/\bdepress|anedonia|humor|neurotransmiss|gds\b|geriatria.*depress/.test(blob)) {
    return 'Depressão / humor';
  }
  if (/\balzheimer|demência|demencia|neurocognitiv/.test(blob)) {
    return 'Demência / Alzheimer';
  }
  if (/\binsônia|insonia|sono\b|epilepsia|convuls/.test(blob)) {
    return 'Sono / epilepsia';
  }
  if (/\bsuicí|suicid|risco.*vida|prevenção ao suicídio|prevencao ao suicidio/.test(blob)) {
    return 'Risco suicida';
  }
  if (/\bacolh|biopsicossocial|atenção primária|atencao primaria|atenção básica|atencao basica|esf\b|aps\b/.test(blob)) {
    return 'APS / acolhimento';
  }
  if (/\bdelirium|sedação contínua|sedacao continua|uti\b|crítico|critico/.test(blob)) {
    return 'Delirium / cuidado crítico';
  }
  return 'Saúde mental — conceito geral';
}

function refinePedagogicalCluster(
  instruction: string,
  options: QuestionOption[],
  family: FamilyId,
  builderTopic: string,
): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();

  if (family === 'vf') return 'V/F — assertivas I/II/III';
  if (family === 'certo_errado') return 'Certo ou errado';
  if (family === 'legis') return 'Legislação / norma';
  if (family === 'text_fragment') return 'Caso clínico (text_fragment)';

  if (/\bexceto\b|incorreta|incorreto|não (se aplica|constitui)|nao (se aplica|constitui)/.test(blob)) {
    if (/\bagita[çc]|conten[çc]|violência iminente|violencia iminente/.test(blob)) {
      return 'Agitação / crise / contenção (EXCETO)';
    }
    return 'EXCETO — conduta / conceito';
  }

  if (/\bredu[çc][ãa]o de danos|entrevista motivacional/.test(blob)) {
    return 'Redução de danos / entrevista motivacional';
  }
  if (/\btabag|fagerstr|pnct|nicotina/.test(blob)) {
    return 'Tabagismo / PNCT';
  }
  if (/\bálcool|alcool|alcoolismo|abstinência|abstinencia|comunidades terapêuticas|dependência química|dependencia quimica|drogas lícitas|drogas licitas/.test(blob)) {
    return 'Dependência química / álcool';
  }
  if (/\braps\b|reforma psiquiátrica|reforma psiquiatrica/.test(blob)) {
    return 'RAPS / Reforma Psiquiátrica / SRT';
  }
  if (/\bsrt\b|serviço residencial terapêutico|servico residencial terapeutico/.test(blob)) {
    return 'SRT / Reforma Psiquiátrica (dispositivo)';
  }
  if (/\bcaps\b/.test(blob) && /\bagita[çc]|acolh|crise/.test(blob)) {
    return 'CAPS / acolhimento em crise';
  }
  if (/\bcaps\b|centro de atenção psicossocial|centro de atencao psicossocial/.test(blob)) {
    return 'CAPS / dispositivo de rede';
  }
  if (/\bagita[çc]|conten[çc]|de-escal|surto psicótico|surto psicotico|upa.*agitado/.test(blob)) {
    return 'Crise / agitação / de-escalada';
  }
  if (/\besquizofren|sintomas positivos|sintomas negativos|psicót|psicot|antipsicót|antipsicot/.test(blob)) {
    return 'Esquizofrenia / psicofármacos';
  }
  if (/\bdepress|neurotransmiss|prevalência.*depress|prevalencia.*depress|gds\b/.test(blob)) {
    return 'Depressão / epidemiologia';
  }
  if (/\balzheimer|demência|demencia/.test(blob)) {
    return 'Demência / Alzheimer';
  }
  if (/\binsônia|insonia|epilepsia/.test(blob)) {
    return 'Sono / epilepsia';
  }
  if (/\bsuicí|suicid|sinais.*alerta|mudança repentina de rotina/.test(blob)) {
    return 'Risco suicida / sinais de alerta';
  }
  if (/\bacolh|biopsicossocial|insônia.*estresse|território|territorio/.test(blob)) {
    return 'Acolhimento / biopsicossocial na APS';
  }
  if (/\baps\b|atenção primária|atencao primaria|atenção básica|atencao basica|esf\b|técnico.*enfermagem.*saúde mental/.test(blob)) {
    return 'APS / técnico na ESF-RAPS';
  }
  if (/\bdelirium|sedação|sedacao|uti\b/.test(blob)) {
    return 'Delirium / UTI (cauda)';
  }

  if (builderTopic !== 'Saúde mental — conceito geral') return builderTopic;
  return 'Default — sem âncora temática';
}

function clusterHasGolden(cluster: string): boolean {
  return COVERED_CLUSTERS.has(cluster);
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
    if (
      g.code === 'slide_topic_drift' ||
      g.code === 'danger_duplicate_justifications' ||
      g.code.startsWith('danger_gabarito_')
    ) {
      issues.push(g.code);
    }
  }
  return [...new Set(issues)];
}

function assessClusterSummary(cluster: string, stats: ClusterAccum, total: number): ClusterSummary {
  const pct = Math.round((stats.count / total) * 1000) / 10;
  const threshold = Math.max(5, Math.ceil(total * 0.1));
  const failRatio = stats.count ? stats.contract_fail / stats.count : 0;
  const builderTopicEntries = Object.entries(stats.builderTopics).sort((a, b) => b[1] - a[1]);
  const [dominantBuilderTopic = 'Sem âncora', dominantCount = 0] = builderTopicEntries[0] ?? [];
  const dominantShare = stats.count ? dominantCount / stats.count : 0;
  const builderTopicDiversity = builderTopicEntries.length;
  const hasGolden = clusterHasGolden(cluster);
  const goldenFile = GOLDEN_BY_CLUSTER[cluster] ?? null;
  const isGenericBucket = GENERIC_BRANCH_BUCKETS.has(cluster) || builderTopicDiversity > 3 || dominantShare < 0.55;

  const reasons: string[] = [
    `volume=${stats.count}/${total} (${pct}%)`,
    `contract_fail_ratio=${Math.round(failRatio * 100)}%`,
    `dominant_topic=${dominantBuilderTopic} (${Math.round(dominantShare * 100)}%)`,
    `builder_topic_diversity=${builderTopicDiversity}`,
  ];

  if (hasGolden) {
    reasons.push('golden de referência existe em examples/');
    return {
      cluster,
      count: stats.count,
      pct,
      slide_contract_failures: stats.contract_fail,
      instruction_artifacts: stats.artifacts,
      has_golden: true,
      golden_file: goldenFile,
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
  if (failRatio >= 0.25) decisionScore += 2;
  else if (failRatio >= 0.15) decisionScore += 1;
  if (!isGenericBucket && dominantShare >= 0.55) decisionScore += 2;
  if (stats.artifacts > 0) decisionScore -= 1;

  if (stats.count >= threshold && !isGenericBucket && dominantShare >= 0.55) {
    decision = 'novo_ramo';
    reasons.push('volume ≥10% com separabilidade semântica — criar golden');
  } else if (stats.count >= threshold) {
    decision = 'absorver';
    reasons.push('volume útil, absorver em ramo vizinho');
  } else if (!isGenericBucket && (stats.count >= 3 || failRatio >= 0.2)) {
    decision = 'absorver';
    reasons.push('recorte semântico, abaixo do corte de ramo forte');
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
    slide_contract_failures: stats.contract_fail,
    instruction_artifacts: stats.artifacts,
    has_golden: false,
    golden_file: null,
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

async function main() {
  const subtopicoFilter = parseArg('subtopico') ?? SUBTOPICO;
  const supabase = await createServerSupabase();
  const PAGE = 200;
  let offset = 0;
  const rows: Row[] = [];

  while (true) {
    const { data, error } = await supabase
      .from('modulos_estudo')
      .select('modulo_slug, banca, titulo_aula, conteudo_json')
      .eq('titulo_aula', subtopicoFilter)
      .order('modulo_slug', { ascending: true })
      .range(offset, offset + PAGE - 1);

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

      if (subtopico !== subtopicoFilter) continue;

      const family = classifyFamily(instruction, subtopico, options, textFragment);
      const builderTopic = inferSaudeMentalTopic(instruction, options);
      const pedagogicalCluster = refinePedagogicalCluster(instruction, options, family, builderTopic);
      const slides = cj.reverse_study_slides ?? cj.study_slides;
      const gateIssues = premiumGateErrors(cj, { subtopico }).map((i) => i.code);
      const contractIssues = slideContractIssueCodes(cj);

      rows.push({
        modulo_slug: row.modulo_slug as string,
        banca: (row.banca as string | null) ?? null,
        family,
        builder_topic: builderTopic,
        pedagogical_cluster: pedagogicalCluster,
        has_instruction_artifacts: hasInstructionArtifacts(instruction),
        slide_contract_issues: contractIssues,
        premium_status: resolvePremiumStatus(cj, gateIssues),
        instruction_preview: instruction.slice(0, 120).replace(/\s+/g, ' '),
      });
    }

    offset += PAGE;
    if (data.length < PAGE) break;
  }

  const familyCounts: Record<string, number> = {};
  const builderTopicCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};
  const clusterStats = new Map<string, ClusterAccum>();

  for (const r of rows) {
    familyCounts[r.family] = (familyCounts[r.family] ?? 0) + 1;
    builderTopicCounts[r.builder_topic] = (builderTopicCounts[r.builder_topic] ?? 0) + 1;
    statusCounts[r.premium_status] = (statusCounts[r.premium_status] ?? 0) + 1;
    const cur =
      clusterStats.get(r.pedagogical_cluster) ?? {
        count: 0,
        contract_fail: 0,
        artifacts: 0,
        slugs: [],
        builderTopics: {},
      };
    cur.count += 1;
    if (r.slide_contract_issues.length) cur.contract_fail += 1;
    if (r.has_instruction_artifacts) cur.artifacts += 1;
    if (cur.slugs.length < 8) cur.slugs.push(r.modulo_slug);
    cur.builderTopics[r.builder_topic] = (cur.builderTopics[r.builder_topic] ?? 0) + 1;
    clusterStats.set(r.pedagogical_cluster, cur);
  }

  const total = rows.length;
  const contractFailTotal = rows.filter((r) => r.slide_contract_issues.length).length;
  const artifactsTotal = rows.filter((r) => r.has_instruction_artifacts).length;
  const stubTotal = rows.filter((r) => r.premium_status === 'stub').length;
  const clusterSummaries = [...clusterStats.entries()]
    .map(([cluster, stats]) => assessClusterSummary(cluster, stats, total))
    .sort((a, b) => b.count - a.count);
  const goldensNeeded = clusterSummaries.filter((s) => s.decision === 'novo_ramo');
  const decisionCounts = clusterSummaries.reduce<Record<string, number>>((acc, s) => {
    acc[s.decision] = (acc[s.decision] ?? 0) + 1;
    return acc;
  }, {});

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: subtopicoFilter,
    total,
    existing_goldens_examples: Object.values(GOLDEN_BY_CLUSTER),
    family_counts: familyCounts,
    builder_topic_counts: builderTopicCounts,
    premium_status_counts: statusCounts,
    stub_total: stubTotal,
    contract_fail_total: contractFailTotal,
    instruction_artifacts_total: artifactsTotal,
    cluster_decisions: clusterSummaries,
    decision_counts: decisionCounts,
    pedagogical_clusters: clusterSummaries.map(
      ({ cluster, count, pct, slide_contract_failures, instruction_artifacts, has_golden, golden_file, sample_slugs, decision }) => ({
        cluster,
        count,
        pct,
        slide_contract_failures,
        instruction_artifacts,
        has_golden,
        golden_file,
        decision,
        sample_slugs,
      }),
    ),
    goldens_needed_count: goldensNeeded.length,
    goldens_needed: goldensNeeded.map((g) => g.cluster),
    rows,
  };

  const artifactsDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(artifactsDir, { recursive: true });
  const outPath = resolve(artifactsDir, 'saude-mental-topic-cluster-report.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

  console.log(`[cluster-saude-mental] total=${total} stub=${stubTotal} contract_fail=${contractFailTotal}`);
  console.log('[cluster-saude-mental] família:', familyCounts);
  console.log('[cluster-saude-mental] premium_status:', statusCounts);
  console.log('[cluster-saude-mental] decisões:', decisionCounts);
  console.log('[cluster-saude-mental] clusters pedagógicos:');
  for (const c of clusterSummaries) {
    console.log(
      `  - ${c.cluster}: ${c.count} (${c.pct}%) golden=${c.has_golden ? 'sim' : 'não'} decisão=${c.decision}`,
    );
  }
  console.log(`[cluster-saude-mental] goldens_needed (novo_ramo): ${goldensNeeded.length}`);
  console.log(`[cluster-saude-mental] relatório=${outPath}`);
}

main().catch((err) => {
  console.error('[cluster-saude-mental]', err);
  process.exit(1);
});
