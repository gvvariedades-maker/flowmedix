#!/usr/bin/env tsx
/**
 * Clusteriza questões do subtópico Doenças Bacterianas por tema pedagógico × família.
 * Uso: npm run cluster:bacterianas
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { classifyFamily, type FamilyId, type QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import { parseArg } from '@/lib/catalogMigration/cliArgs';
import {
  resolveClusterDecision,
  strongBranchThreshold,
} from '@/lib/catalogMigration/clusterReportContract';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  inferPedagogicalBranch,
  type PedagogicalBranchId,
} from '@/lib/slides/pedagogicalBranch';
import type { MoldAffinitySlide } from '@/lib/slides/moldAffinity';

const SUBTOPICO = 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)';

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'Agente etiológico — bactéria × vírus × fungo': 'questao-premium-ibgp-agentes-etiologicos-todas-bacterias.json',
  'Tuberculose — controle, TDO e vigilância': 'questao-premium-cpcon-tuberculose-baar-aerossol-vf.json',
};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

function corpus(instruction: string, options: QuestionOption[]): string {
  return `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
}

function inferTopic(blob: string): string {
  if (
    /todas as doen[cç]as.*bact[eé]ri|causadas por bact[eé]ri|nenhum v[ií]rus|classifica[cç][aã]o etiol|agente etiol[oó]gic/i.test(
      blob,
    )
  ) {
    return 'Agente etiológico — bactéria × vírus × fungo';
  }
  if (/tuberculose|tubercul[ií]n|bacilo de koch|mycobacterium|tdo\b|baar\b|isoniazida|rifampicina|bcg\b/i.test(blob)) {
    return 'Tuberculose — controle, TDO e vigilância';
  }
  if (/hans[eê]ni|lepra|pqt\b|poliquimioterapia|multibacilar|paucibacilar|virchow/i.test(blob)) {
    return 'Hanseníase — transmissão e PQT';
  }
  if (/candid[ií]ase|candida albicans|fungo|micose|dermatofit/i.test(blob)) {
    return 'Candidíase e micoses';
  }
  if (/t[eé]tano|clostridium tetani|toxoide tet[aâ]nic|soro antitet[aâ]nic/i.test(blob)) {
    return 'Tétano — profilaxia e imunização';
  }
  if (/meningite|meningoc[oó]c|neisseria meningitidis|pet[eé]quias|rigidez de nuca/i.test(blob)) {
    return 'Meningite bacteriana';
  }
  if (/c[oó]lera|vibrio cholerae|shigella|e\.?\s*coli|salmonella|disenteria/i.test(blob)) {
    return 'Bactérias do trato gastrointestinal';
  }
  if (/leptospir|febre maculosa|rickettsia|zoonose|carrapato/i.test(blob)) {
    return 'Zoonoses (reclassificar?)';
  }
  if (/mrsa|coloniza[cç][aã]o|irás|multirresistente|biossegur/i.test(blob)) {
    return 'IRAS / resistência (reclassificar?)';
  }
  if (/semiologia|sinal cl[ií]nico|inspe[cç][aã]o|palpa[cç][aã]o|ausculta/i.test(blob)) {
    return 'Semiologia (reclassificar?)';
  }
  if (/ist\b|s[ií]filis|gonorreia|hiv\b|clam[ií]dia/i.test(blob)) {
    return 'IST (reclassificar?)';
  }
  if (/exame laboratorial|coleta de sangue|hemograma|glicemia/i.test(blob)) {
    return 'Exames laboratoriais (reclassificar?)';
  }
  if (/febre|hiperpirexia|processo infeccioso|bacterioses.*transmiss/i.test(blob)) {
    return 'Bacterioses — conceito geral';
  }
  return 'Outros / tema misto';
}

type QuestaoFile = {
  meta?: { subtopico?: string; family?: FamilyId; pedagogical_branch?: string };
  question_data?: { instruction?: string; options?: QuestionOption[] };
  reverse_study_slides?: MoldAffinitySlide[];
  study_slides?: MoldAffinitySlide[];
  modulo_slug?: string;
};

function slidesOf(q: QuestaoFile): MoldAffinitySlide[] {
  const s = q.reverse_study_slides ?? q.study_slides;
  return Array.isArray(s) ? s : [];
}

function main() {
  const lote = parseArg('lote') ?? 'doencas-bacterianas-completo';
  const dir = loteQuestionsDir(lote);
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

  type Row = {
    slug: string;
    family: FamilyId;
    topic: string;
    branch: PedagogicalBranchId | undefined;
    declared_branch?: string;
    instruction_preview: string;
  };

  const rows: Row[] = [];
  const clusterMap = new Map<string, { count: number; slugs: string[]; branches: Record<string, number> }>();

  for (const file of files) {
    const payload = JSON.parse(readFileSync(resolve(dir, file), 'utf8')) as QuestaoFile;
    const slug = payload.modulo_slug ?? file.replace(/\.json$/, '');
    const instruction = String(payload.question_data?.instruction ?? '');
    const options = payload.question_data?.options ?? [];
    const blob = corpus(instruction, options);
    const family = classifyFamily(
      instruction,
      payload.meta?.subtopico ?? SUBTOPICO,
      options,
      String((payload.question_data as { text_fragment?: string })?.text_fragment ?? ''),
    );
    const topic = inferTopic(blob);
    const slides = slidesOf(payload);
    const declared = payload.meta?.pedagogical_branch?.trim();
    const branch = inferPedagogicalBranch(
      payload.meta?.subtopico ?? SUBTOPICO,
      instruction,
      slides,
      payload.meta?.family,
    );

    rows.push({
      slug,
      family,
      topic,
      branch,
      declared_branch: declared,
      instruction_preview: instruction.slice(0, 100).replace(/\s+/g, ' '),
    });

    const acc = clusterMap.get(topic) ?? { count: 0, slugs: [], branches: {} };
    acc.count += 1;
    acc.slugs.push(slug);
    const bk = branch ?? '—';
    acc.branches[bk] = (acc.branches[bk] ?? 0) + 1;
    clusterMap.set(topic, acc);
  }

  const total = rows.length;
  const strongThreshold = strongBranchThreshold(total);
  const clusterSummaries = [...clusterMap.entries()]
    .map(([cluster, stats]) => {
      const pct = Math.round((stats.count / total) * 1000) / 10;
      const hasGolden = COVERED_CLUSTERS.has(cluster);
      const dominantBranch = Object.entries(stats.branches).sort((a, b) => b[1] - a[1])[0]?.[0];
      return {
        cluster,
        count: stats.count,
        pct,
        has_golden: hasGolden,
        golden_file: GOLDEN_BY_CLUSTER[cluster] ?? null,
        dominant_branch: dominantBranch,
        branch_counts: stats.branches,
        sample_slugs: stats.slugs.slice(0, 4),
        decision: resolveClusterDecision({ hasGolden, count: stats.count, total }),
        l3_package:
          dominantBranch === 'bacterianas_agente_etiologico'
            ? 'etiology-kingdom-rail · etiology-letter-spectrum · etiology-elimination-tap · etiology-intruder-chips'
            : dominantBranch === 'bacterianas_tuberculose'
              ? 'tb-vigilance-rail · tb-precaution-board · tb-vf-elimination-tap · tb-transmission-trap'
              : 'molecular · reference_table · vertical · compare (genérico)',
      };
    })
    .sort((a, b) => b.count - a.count);

  const branchTotals = rows.reduce(
    (acc, r) => {
      const k = r.branch ?? '—';
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: SUBTOPICO,
    lote,
    total,
    strong_threshold: strongThreshold,
    branch_totals: branchTotals,
    goldens_needed: clusterSummaries.filter((c) => c.decision === 'novo_ramo' && !c.has_golden).length,
    inedito_packages_needed: clusterSummaries.filter(
      (c) => c.decision === 'novo_ramo' && !c.has_golden,
    ).length,
    handcrafts_needed: total,
    cluster_decisions: clusterSummaries,
    rows,
  };

  const outDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'bacterianas-topic-cluster-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[cluster:bacterianas] total=${total} lote=${lote}`);
  console.log(`[cluster:bacterianas] ramos L3: ${JSON.stringify(branchTotals)}`);
  console.log(`[cluster:bacterianas] pacotes inéditos candidatos=${report.inedito_packages_needed}`);
  console.log(`[cluster:bacterianas] report=${outPath}`);
  for (const c of clusterSummaries) {
    console.log(
      `  ${c.decision.padEnd(12)} ${String(c.count).padStart(2)} (${String(c.pct).padStart(5)}%) — ${c.cluster}`,
    );
  }
}

main();
