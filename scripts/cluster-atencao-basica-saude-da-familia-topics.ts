#!/usr/bin/env tsx
/**
 * Clusteriza questões de Atenção Básica / Saúde da Família por tema × família × ramo L3.
 * Uso: npm run cluster:atencao-basica
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

const SUBTOPICO = 'Atenção Básica / Saúde da Família';

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'ACS — atribuições, visita e território':
    'questao-premium-adm-atencao-basica-saude-da-familia-acs-atribuicoes-visita-e-territorio.json',
  'Atenção Básica — conceito geral':
    'questao-premium-amauc-atencao-basica-saude-da-familia-atencao-basica-conceito-geral.json',
  'eSF — composição, carga e modalidades':
    'questao-premium-ameosc-atencao-basica-saude-da-familia-esf-composicao-carga-e-modalidades.json',
};

const CLUSTER_TO_BRANCH: Record<string, string> = {
  'ACS — atribuições, visita e território': 'ab_acs_territorio',
  'eSF — composição, carga e modalidades': 'ab_esf_composicao',
  'PNAB / princípios e atributos da APS': 'ab_pnab_principios',
  'Técnico de enfermagem na AB': 'ab_te_aps',
  'Vigilância / ACE no território': 'ab_vigilancia_ads',
  'Atenção Básica — conceito geral': 'ab_generico',
};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

/** Ramos com gesto espacial que pedem brief 4/4 (Fase 3b). */
const BESPOKE_BRANCHES = new Set(['ab_esf_composicao']);

function corpus(instruction: string, options: QuestionOption[]): string {
  return `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
}

function detectDrift(slug: string, blob: string, metaSubtopico?: string): string | null {
  if (metaSubtopico && !/aten[cç][aã]o b[aá]sica|sa[uú]de da fam[ií]lia/i.test(metaSubtopico)) {
    return `Meta drift → ${metaSubtopico}`;
  }
  if (
    /imuniza[cç][aã]o|calend[aá]rio vacinal|\bpni\b|cadeia de frio/i.test(blob) &&
    !/aten[cç][aã]o b[aá]sica|sa[uú]de da fam[ií]lia|\bacs\b|visita domiciliar|ubs\b|esf\b/i.test(blob)
  ) {
    return 'Imunização (drift?)';
  }
  if (
    /centro cir[uú]rgico|srpa|bloco cir[uú]rgico/i.test(blob) &&
    !/aten[cç][aã]o b[aá]sica|ubs\b/i.test(blob)
  ) {
    return 'Centro cirúrgico (drift?)';
  }
  if (slug.includes('centro-cirurgico') || slug.includes('auditoria-e-gestao')) {
    return 'Slug segment fora do pacote (drift?)';
  }
  return null;
}

function inferTopic(blob: string, family: FamilyId): string {
  if (
    /agente comunit[aá]rio|\bacs\b|visita domiciliar|micro[aá]rea|adscri[cç][aã]o|cadastro.*fam[ií]lia|censo.*territ[oó]rio|[aá]rea de abrang/i.test(
      blob,
    )
  ) {
    return 'ACS — atribuições, visita e território';
  }
  if (
    /equipe de sa[uú]de da fam[ií]lia|\besf\b|composi[cç][aã]o da equipe|n[uú]cleo.*(esf|equipe)|nasf|emulti|ribeirinh|fluvial|4\.?000.*pessoas|carga hor[aá]ria.*equipe/i.test(
      blob,
    )
  ) {
    return 'eSF — composição, carga e modalidades';
  }
  if (
    /pnab|portaria.*2\.436|pol[ií]tica nacional de aten[cç][aã]o b[aá]sica|longitudinalidade|coorden[aá][cç][aã]o do cuidado|atributos.*(aps|aten[cç][aã]o)|aten[cç][aã]o prim[aá]ria [àa] sa[uú]de/i.test(
      blob,
    )
  ) {
    return 'PNAB / princípios e atributos da APS';
  }
  if (
    /agente de combate|\bace\b|endemias|notifica[cç][aã]o|vigil[aâ]ncia.*territ[oó]rio|sinan|controle de vetor/i.test(
      blob,
    )
  ) {
    return 'Vigilância / ACE no território';
  }
  if (
    /t[eé]cnico de enfermagem.*(aten[cç][aã]o b[aá]sica|ubs|esf)|auxiliar de enfermagem.*(aten[cç][aã]o b[aá]sica|ubs)|atribui[cç][oõ]es.*(t[eé]cnico|auxiliar).*ubs/i.test(
      blob,
    )
  ) {
    return 'Técnico de enfermagem na AB';
  }
  if (
    family === 'vf' ||
    /exceto|incorreta|julgue|assinale.*correta/i.test(blob)
  ) {
    // Sem âncora temática forte — cai no genérico do pacote
    return 'Atenção Básica — conceito geral';
  }
  return 'Atenção Básica — conceito geral';
}

function branchForCluster(cluster: string): string {
  if (cluster.includes('drift')) return 'ab_generico';
  return CLUSTER_TO_BRANCH[cluster] ?? 'ab_generico';
}

function l3Package(branch: string): string {
  if (branch === 'ab_esf_composicao') {
    return 'ab-esf-orbit-deck · ab-esf-reference-board · ab-esf-tap-flow · ab-esf-scope-trap (molde_inedito — brief 4/4)';
  }
  return 'morphological · reference_table · vertical/cards · compare (genérico emerald)';
}

function l3Decision(branch: string, count: number, strongThreshold: number): string {
  if (BESPOKE_BRANCHES.has(branch) && count >= strongThreshold) return 'molde_inedito';
  if (BESPOKE_BRANCHES.has(branch) && count >= 5) return 'molde_inedito';
  if (count >= strongThreshold) return 'ok_generico';
  return 'ok_generico';
}

type QuestaoFile = {
  meta?: { subtopico?: string; family?: FamilyId; pedagogical_branch?: string };
  question_data?: { instruction?: string; options?: QuestionOption[]; text_fragment?: string };
  modulo_slug?: string;
};

function main() {
  const lote = parseArg('lote') ?? 'atencao-basica-saude-da-familia-completo';
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
      return manifestSlugs.has(f.replace(/\.json$/, ''));
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
    const drift = topic.includes('drift');

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
      const decision = cluster.includes('drift')
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
    .map(([branch, count]) => ({ branch, count, l3: l3Package(branch) }));

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: SUBTOPICO,
    lote,
    total,
    strong_threshold: strongThreshold,
    drift_total: rows.filter((r) => r.drift).length,
    branch_totals: branchTotals,
    strong_branches: strongBranches,
    inedito_packages_needed: clusterSummaries.filter((c) => c.l3_decision === 'molde_inedito').length,
    handcrafts_needed: total,
    cluster_decisions: clusterSummaries,
    rows,
  };

  const outDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'atencao-basica-saude-da-familia-topic-cluster-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[cluster:atencao-basica] total=${total} lote=${lote} threshold=${strongThreshold}`);
  console.log(`[cluster:atencao-basica] drift_total=${report.drift_total}`);
  console.log(`[cluster:atencao-basica] ramos fortes=${strongBranches.length}`);
  for (const b of strongBranches) {
    console.log(`  • ${b.branch}: ${b.count} slugs`);
  }
  console.log('[cluster:atencao-basica] top clusters:');
  for (const c of clusterSummaries.slice(0, 8)) {
    console.log(`  • ${c.cluster}: ${c.count} (${c.pct}%) — ${c.l3_decision}`);
  }
  console.log(`[cluster:atencao-basica] report=${outPath}`);
}

main();
