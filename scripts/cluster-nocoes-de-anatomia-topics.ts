#!/usr/bin/env tsx
/**
 * Clusteriza Noções de Anatomia por tema × família × ramo L3.
 * Uso: npm run cluster:anatomia
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { classifyFamily, type FamilyId, type QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import { parseArg } from '@/lib/catalogMigration/cliArgs';
import {
  resolveClusterDecision,
  strongBranchThreshold,
} from '@/lib/catalogMigration/clusterReportContract';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const SUBTOPICO = 'Noções de Anatomia';

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'Terminologia e planos anatômicos': 'questao-premium-fepese-anatomia-anterior-ventral.json',
  'Sistema esquelético / ossos e articulações':
    'questao-premium-ameosc-nocoes-de-anatomia-anat_esqueleto.json',
  'Anatomia — conceito geral': 'questao-premium-avancasp-nocoes-de-anatomia-anat_generico.json',
  'Sistema cardiovascular': 'questao-premium-cebraspe-nocoes-de-anatomia-anat_cardiovascular.json',
};

const CLUSTER_TO_BRANCH: Record<string, string> = {
  'Terminologia e planos anatômicos': 'anat_terminologia_planos',
  'Sistema esquelético / ossos e articulações': 'anat_esqueleto',
  'Sistema muscular': 'anat_muscular',
  'Sistema cardiovascular': 'anat_cardiovascular',
  'Cavidades e topografia': 'anat_cavidades',
  'Anatomia — conceito geral': 'anat_generico',
};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

function corpus(instruction: string, options: QuestionOption[]): string {
  return `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
}

function branchForCluster(cluster: string): string {
  return CLUSTER_TO_BRANCH[cluster] ?? 'anat_generico';
}

function inferTopic(blob: string): string {
  if (
    /anterior|posterior|ventral|dorsal|medial|lateral|proximal|distal|cranial|caudal|plano sagital|plano frontal|plano transverso|plano coronal|plano vertical|linha m[eé]dia|parasagital|posi[cç][aã]o anat|terminologia/.test(
      blob,
    )
  ) {
    return 'Terminologia e planos anatômicos';
  }
  // Pele / tecidos básicos antes de CV (evita "vasos sanguíneos" na hipoderme → CV)
  if (/epiderme|derme|hipoderme|tecido epitelial|papilas gustativas|endomi[eé]trio/.test(blob)) {
    return 'Anatomia — conceito geral';
  }
  if (
    /cora[cç][aã]o|valva|v[aá]lvula|art[eé]ria|veia cava|veia porta|circula[cç][aã]o|[aá]trio|ventr[ií]culo|sistema cardiovascular|grande circula/.test(
      blob,
    )
  ) {
    return 'Sistema cardiovascular';
  }
  if (
    /osso|esqueleto|coluna vertebral|v[eé]rtebr|úmero|f[eê]mur|t[ií]bia|f[ií]bula|cr[aâ]nio|costela|articula[cç][aã]o|fratura|luxa[cç][aã]o|osteotomia|gesso|tala/.test(
      blob,
    )
  ) {
    return 'Sistema esquelético / ossos e articulações';
  }
  if (/m[uú]sculo|tend[aã]o|ligamento|origem|inser[cç][aã]o|b[ií]ceps|tr[ií]ceps|diafragma/.test(blob)) {
    return 'Sistema muscular';
  }
  if (/cavidade|t[oó]rax|abdome|p[eé]lvis|topograf/.test(blob)) {
    return 'Cavidades e topografia';
  }
  return 'Anatomia — conceito geral';
}

function l3Decision(branch: string, count: number, threshold: number): string {
  if (branch === 'anat_terminologia_planos' && count >= threshold) return 'molde_inedito';
  if (count >= threshold) return 'ok_generico';
  return 'ok_generico';
}

function l3Package(branch: string): string {
  if (branch === 'anat_terminologia_planos') {
    return 'axis-deck · reference_table · tap · compare (candidato bespoke)';
  }
  return 'morphological · reference_table · tap · compare (genérico)';
}

type QuestaoFile = {
  modulo_slug?: string;
  meta?: { family?: FamilyId; subtopico?: string };
  question_data?: {
    instruction?: string;
    text_fragment?: string;
    options?: QuestionOption[];
  };
};

function main() {
  const lote = parseArg('lote') ?? 'nocoes-de-anatomia-completo';
  const dir = loteQuestionsDir(lote);
  if (!existsSync(dir)) throw new Error(`questions dir missing: ${dir}`);
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

  type Row = {
    slug: string;
    family: FamilyId | string;
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
    const topic = inferTopic(blob);
    const branch_id = branchForCluster(topic);

    rows.push({
      slug,
      family,
      topic,
      pedagogical_cluster: topic,
      pedagogical_branch_proposed: branch_id,
      instruction_preview: instruction.slice(0, 100).replace(/\s+/g, ' '),
      drift: false,
    });

    const acc = clusterMap.get(topic) ?? { count: 0, slugs: [], families: {}, drift: 0 };
    acc.count += 1;
    acc.slugs.push(slug);
    acc.families[family] = (acc.families[family] ?? 0) + 1;
    clusterMap.set(topic, acc);
  }

  const total = rows.length;
  const strongThreshold = strongBranchThreshold(total);

  const clusterSummaries = [...clusterMap.entries()]
    .map(([cluster, stats]) => {
      const pct = Math.round((stats.count / total) * 1000) / 10;
      const hasGolden = COVERED_CLUSTERS.has(cluster);
      const branch_id = branchForCluster(cluster);
      const decision = resolveClusterDecision({
        hasGolden,
        count: stats.count,
        total,
      });

      return {
        cluster,
        count: stats.count,
        pct,
        drift_in_cluster: stats.drift,
        has_golden: hasGolden,
        golden_file: GOLDEN_BY_CLUSTER[cluster] ?? null,
        branch_id,
        pedagogical_branch_proposed: branch_id,
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
    drift_total: 0,
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
  const outPath = resolve(outDir, 'nocoes-de-anatomia-topic-cluster-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[cluster:anatomia] total=${total} lote=${lote} threshold=${strongThreshold}`);
  console.log(`[cluster:anatomia] ramos fortes=${strongBranches.length}`);
  for (const b of strongBranches) {
    console.log(`  • ${b.branch}: ${b.count} slugs — ${b.l3_decision}`);
  }
  console.log('[cluster:anatomia] top clusters:');
  for (const c of clusterSummaries.slice(0, 8)) {
    console.log(`  • ${c.cluster}: ${c.count} (${c.pct}%) — ${c.l3_decision} / ${c.decision}`);
  }
  console.log(`[cluster:anatomia] report=${outPath}`);
}

main();
