#!/usr/bin/env tsx
/**
 * Clusteriza questões de Epidemiologia e Vigilância Epidemiológica por tema × família × ramo L3.
 * Uso: npm run cluster:epidemiologia
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { classifyFamily, type FamilyId, type QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import { parseArg } from '@/lib/catalogMigration/cliArgs';
import {
  resolveClusterDecision,
  strongBranchThreshold,
} from '@/lib/catalogMigration/clusterReportContract';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const SUBTOPICO = 'Epidemiologia e Vigilância Epidemiológica';

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'Notificação compulsória / SINAN / lista nacional':
    'questao-premium-adm-epidemiologia-e-vigilancia-epidemiologica-notificacao-compulsoria-sinan-lista-naci.json',
  'Indicadores — incidência, prevalência, mortalidade, letalidade':
    'questao-premium-adm-epidemiologia-e-vigilancia-epidemiologica-indicadores-incidencia-prevalencia-morta.json',
  'Vigilância epidemiológica — conceito e ações':
    'questao-premium-adm-epidemiologia-e-vigilancia-epidemiologica-vigilancia-epidemiologica-conceito-e-aco.json',
  'Epidemiologia — conceito geral':
    'questao-premium-adm-epidemiologia-e-vigilancia-epidemiologica-epidemiologia-conceito-geral.json',
};

const CLUSTER_TO_BRANCH: Record<string, string> = {
  'Notificação compulsória / SINAN / lista nacional': 'epi_notificacao_compulsoria',
  'Indicadores — incidência, prevalência, mortalidade, letalidade': 'epi_indicadores',
  'Ocorrência — endemia, epidemia, pandemia, surto': 'epi_ocorrencia_agravos',
  'Vigilância epidemiológica — conceito e ações': 'epi_vigilancia_acoes',
  'Cadeia de transmissão / períodos / histórico natural': 'epi_cadeia_transmissao',
  'EXCETO / INCORRETA — epidemiologia': 'epi_notificacao_compulsoria',
  'V/F — conceitos epidemiológicos': 'epi_indicadores',
  'Epidemiologia — conceito geral': 'epi_generico',
  'Imunização (drift?)': 'epi_generico',
  'Atenção básica (drift?)': 'epi_generico',
  'Doenças transmissíveis clínicas (drift?)': 'epi_generico',
};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

/** Ramos com pegadinha espacial/categorial — candidatos a brief 4/4 se volume ≥ limiar. */
const BESPOKE_BRANCHES = new Set([
  'epi_notificacao_compulsoria',
  'epi_indicadores',
  'epi_ocorrencia_agravos',
]);

function corpus(instruction: string, options: QuestionOption[]): string {
  return `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
}

function hasEpiAnchor(blob: string): boolean {
  return /epidemiolog|vigil[aâ]ncia|notifica[cç][aã]o|incid[eê]ncia|preval[eê]ncia|letalidade|mortalidade|endem|epidemi[ae]|pandemia|\bsurto\b|sinan|agravo|cadeia (de )?transmiss|coeficiente|indicador de sa[uú]de/i.test(
    blob,
  );
}

function detectDrift(slug: string, blob: string, metaSubtopico?: string): string | null {
  if (metaSubtopico && metaSubtopico !== SUBTOPICO) {
    return `Meta drift — ${metaSubtopico}`;
  }
  if (
    /imuniza[cç][aã]o|vacina\b|calend[aá]rio vacinal|\bpni\b|bcg\b|pentavalente/.test(blob) &&
    !hasEpiAnchor(blob) &&
    !/notifica[cç][aã]o.*vacina|evento adverso.*notifica|pfa|poliomiel/i.test(blob)
  ) {
    return 'Imunização (drift?)';
  }
  if (
    /sae\b|processo de enfermagem|diagn[oó]stico de enfermagem|interven[cç][aã]o de enfermagem/.test(blob) &&
    !hasEpiAnchor(blob)
  ) {
    return 'Atenção básica (drift?)';
  }
  if (
    /tuberculose|hanseniase|s[ií]filis|hiv\b|aids|hepatite/.test(blob) &&
    !/notifica|vigil[aâ]ncia|sinan|incid|preval|surto|endem|epidemi/i.test(blob)
  ) {
    return 'Doenças transmissíveis clínicas (drift?)';
  }
  if (
    /atencao-basica|saude-da-familia|processo-de-enfermagem|auditoria/.test(slug) &&
    !hasEpiAnchor(blob)
  ) {
    return 'Atenção básica (drift?)';
  }
  return null;
}

function inferTopic(blob: string, family: FamilyId): string {
  if (
    /notifica[cç][aã]o compuls[oó]ria|lista nacional|sinan|ficha de notifica|notifica[cç][aã]o imediata|notifica[cç][aã]o semanal|doen[cç]as de notifica[cç][aã]o|agravos de notifica[cç][aã]o|portaria.*notifica/i.test(
      blob,
    )
  ) {
    return 'Notificação compulsória / SINAN / lista nacional';
  }
  if (
    /incid[eê]ncia|preval[eê]ncia|letalidade|taxa de mortalidade|coeficiente de|indicador(es)? (de sa[uú]de|epidemiol)/i.test(
      blob,
    )
  ) {
    return 'Indicadores — incidência, prevalência, mortalidade, letalidade';
  }
  if (/\bendemia\b|\bepidemia\b|\bpandemia\b|\bsurto\b/i.test(blob)) {
    return 'Ocorrência — endemia, epidemia, pandemia, surto';
  }
  if (
    /cadeia (de )?transmiss|agente etiol[oó]gico|hospedeiro|reservat[oó]rio|porta de entrada|modo de transmiss|per[ií]odo de (incuba[cç][aã]o|lat[eê]ncia|transmissibilidade)|hist[oó]rico natural/i.test(
      blob,
    )
  ) {
    return 'Cadeia de transmissão / períodos / histórico natural';
  }
  if (
    /vigil[aâ]ncia epidemiol[oó]gica|vigil[aâ]ncia em sa[uú]de|a[cç][oõ]es de vigil[aâ]ncia|investiga[cç][aã]o epidemiol|vigil[aâ]ncia sentinela/i.test(
      blob,
    )
  ) {
    return 'Vigilância epidemiológica — conceito e ações';
  }
  if (/\bexceto\b|\bincorreta\b|\bincorreto\b/i.test(blob)) {
    return 'EXCETO / INCORRETA — epidemiologia';
  }
  if (
    family === 'vf' ||
    /julgue.*item|marque verdadeiro|\(v\)\s*ou\s*\(f\)|verdadeiro \(v\)|falsas? \(f\)/i.test(blob)
  ) {
    return 'V/F — conceitos epidemiológicos';
  }
  return 'Epidemiologia — conceito geral';
}

function branchForCluster(cluster: string): string {
  if (cluster.includes('drift') || cluster.startsWith('Meta drift')) return 'epi_generico';
  return CLUSTER_TO_BRANCH[cluster] ?? 'epi_generico';
}

function l3Package(branch: string): string {
  if (branch === 'epi_notificacao_compulsoria') {
    return 'lista-trap / scope-trap · center · cards · compare (candidato bespoke)';
  }
  if (branch === 'epi_indicadores') {
    return 'formula-rail / dual-compare · reference_table · tap · compare (candidato bespoke)';
  }
  if (branch === 'epi_ocorrencia_agravos') {
    return 'scale-ladder · morphological · tap · compare (candidato bespoke)';
  }
  if (branch === 'epi_vigilancia_acoes' || branch === 'epi_cadeia_transmissao') {
    return 'morphological · reference_table · tap · compare (genérico)';
  }
  return 'genérico premium (SUBTOPIC_DESIGN_MAP lime)';
}

function l3Decision(branch: string, count: number, threshold: number): string {
  if (BESPOKE_BRANCHES.has(branch) && count >= threshold) return 'molde_inedito';
  if (count >= threshold && branch !== 'epi_generico') return 'molde_redesign';
  return 'ok_generico';
}

type QuestaoFile = {
  meta?: { subtopico?: string; family?: FamilyId; pedagogical_branch?: string };
  question_data?: { instruction?: string; options?: QuestionOption[]; text_fragment?: string };
  modulo_slug?: string;
};

function main() {
  const lote = parseArg('lote') ?? 'epidemiologia-e-vigilancia-epidemiologica-completo';
  const dir = loteQuestionsDir(lote);
  const manifestPath = resolve(process.cwd(), 'data/catalog-migration', lote, 'manifest.json');
  let manifestSlugs: Set<string> | null = null;
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { slugs?: string[] };
    if (Array.isArray(manifest.slugs) && manifest.slugs.length > 0) {
      manifestSlugs = new Set(manifest.slugs);
    }
  }

  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .filter((f) => {
      if (!manifestSlugs) return true;
      const slug = f.replace(/\.json$/, '');
      return manifestSlugs.has(slug);
    });

  type Row = {
    slug: string;
    family: FamilyId;
    topic: string;
    pedagogical_cluster: string;
    pedagogical_branch_proposed: string;
    instruction_preview: string;
    drift: boolean;
  };

  const rows: Row[] = [];
  const clusterMap = new Map<
    string,
    { count: number; slugs: string[]; families: Record<string, number>; drift: number }
  >();

  for (const file of files) {
    const payload = JSON.parse(readFileSync(resolve(dir, file), 'utf8')) as QuestaoFile;
    const slug = payload.modulo_slug ?? file.replace(/\.json$/, '');
    const instruction = String(payload.question_data?.instruction ?? '');
    const options = payload.question_data?.options ?? [];
    const blob = corpus(instruction, options);
    const family =
      payload.meta?.family ??
      classifyFamily(instruction, SUBTOPICO, options, payload.question_data?.text_fragment ?? '');
    const metaSubtopico = payload.meta?.subtopico;
    const driftTopic = detectDrift(slug, blob, metaSubtopico);
    const topic = driftTopic ?? inferTopic(blob, family);
    const branch_id = branchForCluster(topic);
    const drift = topic.includes('drift') || topic.startsWith('Meta drift');

    rows.push({
      slug,
      family,
      topic,
      pedagogical_cluster: topic,
      pedagogical_branch_proposed: branch_id,
      instruction_preview: instruction.slice(0, 100).replace(/\s+/g, ' '),
      drift,
    });

    const acc = clusterMap.get(topic) ?? { count: 0, slugs: [], families: {}, drift: 0 };
    acc.count += 1;
    acc.slugs.push(slug);
    acc.families[family] = (acc.families[family] ?? 0) + 1;
    if (drift) acc.drift += 1;
    clusterMap.set(topic, acc);
  }

  const total = rows.length;
  const strongThreshold = strongBranchThreshold(total);

  const clusterSummaries = [...clusterMap.entries()]
    .map(([cluster, stats]) => {
      const pct = Math.round((stats.count / total) * 1000) / 10;
      const hasGolden = COVERED_CLUSTERS.has(cluster);
      const branch_id = branchForCluster(cluster);
      const decision =
        cluster.includes('drift') || cluster.startsWith('Meta drift')
          ? 'absorver'
          : resolveClusterDecision({ hasGolden, count: stats.count, total });

      return {
        cluster,
        count: stats.count,
        pct,
        drift_in_cluster: stats.drift,
        has_golden: hasGolden,
        golden_file: GOLDEN_BY_CLUSTER[cluster] ?? null,
        branch_id,
        family_counts: stats.families,
        sample_slugs: stats.slugs.slice(0, 4),
        decision,
        strong: stats.count >= strongThreshold,
        l3_decision: l3Decision(branch_id, stats.count, strongThreshold),
        l3_package: l3Package(branch_id),
      };
    })
    .sort((a, b) => b.count - a.count);

  const branchTotals = rows.reduce(
    (acc, r) => {
      acc[r.pedagogical_branch_proposed] = (acc[r.pedagogical_branch_proposed] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const strongBranches = Object.entries(branchTotals)
    .filter(([, count]) => count >= strongThreshold)
    .map(([branch, count]) => ({
      branch,
      count,
      l3: l3Package(branch),
      l3_decision: l3Decision(branch, count, strongThreshold),
    }));

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: SUBTOPICO,
    lote,
    total,
    strong_threshold: strongThreshold,
    drift_total: rows.filter((r) => r.drift).length,
    branch_totals: branchTotals,
    strong_branches: strongBranches,
    inedito_packages_needed: clusterSummaries.filter((c) => c.l3_decision === 'molde_inedito')
      .length,
    handcrafts_needed: total,
    cluster_decisions: clusterSummaries,
    rows,
  };

  const outDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    'epidemiologia-e-vigilancia-epidemiologica-topic-cluster-report.json',
  );
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[cluster:epidemiologia] total=${total} lote=${lote} threshold=${strongThreshold}`);
  console.log(`[cluster:epidemiologia] drift_total=${report.drift_total}`);
  console.log(`[cluster:epidemiologia] ramos fortes=${strongBranches.length}`);
  for (const b of strongBranches) {
    console.log(`  • ${b.branch}: ${b.count} slugs — ${b.l3_decision}`);
  }
  console.log('[cluster:epidemiologia] top clusters:');
  for (const c of clusterSummaries.slice(0, 10)) {
    console.log(`  • ${c.cluster}: ${c.count} (${c.pct}%) — ${c.l3_decision}`);
  }
  console.log(`[cluster:epidemiologia] report=${outPath}`);
}

main();
