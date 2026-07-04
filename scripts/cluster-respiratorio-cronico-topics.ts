#!/usr/bin/env tsx
/**
 * Clusteriza questões de Doenças Respiratórias Crônicas por tema pedagógico × ramo L3.
 * Uso: npm run cluster:respiratorio-cronico
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { classifyFamily, type FamilyId, type QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  inferPedagogicalBranch,
  type PedagogicalBranchId,
} from '@/lib/slides/pedagogicalBranch';
import type { MoldAffinitySlide } from '@/lib/slides/moldAffinity';

const SUBTOPICO = 'Doenças Respiratórias Crônicas (Asma, DPOC)';

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'Espaçador e inalador — técnica MDI': 'questao-premium-idecan-respiratorio-espacador-inalador-conceito.json',
  'O₂ titulado na DPOC (APS/emergência)': 'questao-premium-cpcon-dpoc-oxigenoterapia-alvo-vf.json',
  'Semiologia respiratória V/F': 'questao-premium-cebraspe-respiratorio-dpoc-exacerbacao-vf.json',
  'Crise asmática — EXCETO': 'questao-premium-vunesp-respiratorio-crise-asmatica-exceto.json',
};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

const DRIFT_PATTERNS: RegExp[] = [
  /processo de enfermagem|diagn[oó]stico de enfermagem|nanda\b|nic\b|noc\b/i,
  /verifica[cç][aã]o de sinais vitais|aferi[cç][aã]o de (press[aã]o|temperatura|pulso)/i,
  /semiologia em enfermagem(?!.*respirat)/i,
  /no[cç][oõ]es de fisiologia|fisiologia humana/i,
  /exames complementares(?!.*espirometria)/i,
  /doen[cç]as cr[oô]nicas n[aã]o transmiss[ií]veis(?!.*asma|.*dpoc)/i,
];

function corpus(instruction: string, options: QuestionOption[]): string {
  return `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
}

function inferTopic(blob: string, family: FamilyId): string {
  if (DRIFT_PATTERNS.some((p) => p.test(blob))) {
    return 'Drift taxonômico — reclassificar subtópico';
  }
  if (/\bexceto\b|crise asm[aá]tica|broncoespasmo|salbutamol|beta[\s-]?2/i.test(blob)) {
    return 'Crise asmática — EXCETO';
  }
  if (family === 'vf' || (/\b(i|ii|iii)\s*[-–—]/i.test(blob) && /semiologia respirat|asma|dpoc|sibil/i.test(blob))) {
    return 'Semiologia respiratória V/F';
  }
  if (/espacador|espaçador|inalador|mdi\b|aerossol|peak flow|pico de fluxo|corticoide inalat/i.test(blob)) {
    return 'Espaçador e inalador — técnica MDI';
  }
  if (/spo2|oximetria|saturac|88.?92|o2 titulad|oxigenoterapia|venturi|cat[eé]ter nasal/i.test(blob)) {
    if (/dpoc|enfisema|bronquite cr[oô]nica|retentor|hipercapnia/i.test(blob)) {
      return 'O₂ titulado na DPOC (APS/emergência)';
    }
    return 'Oximetria de pulso / SpO₂';
  }
  if (/venturi|m[aá]scara de alto fluxo|dispositivo.*oxig/i.test(blob)) {
    return 'Dispositivos de oxigenoterapia (Venturi)';
  }
  if (/vef1|cvf|espirometria|volume expirat/i.test(blob)) {
    return 'Espirometria VEF1/CVF';
  }
  if (/asma.*aps|educa[cç][aã]o terap[eê]utica|plano de a[cç][aã]o|controle ambiental/i.test(blob)) {
    return 'Asma na APS — educação terapêutica';
  }
  if (/sibil.*pediatr|lactente|crian[cç]a.*sibil|bronquiolite/i.test(blob)) {
    return 'Semiologia pediátrica — sibilos';
  }
  if (/dpoc.*ubs|papel do t[eé]cnico|tabagismo|reabilita[cç][aã]o pulmonar/i.test(blob)) {
    return 'DPOC na UBS — papel do técnico';
  }
  if (/asma|dpoc|obstru[cç][aã]o|broncodilatador|cr[oô]nica.*respirat/i.test(blob)) {
    return 'Respiratório crônico — conceito geral';
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
  const lote = parseArg('lote') ?? 'respiratorio-cronico-completo';
  const dir = loteQuestionsDir(lote);
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

  type Row = {
    slug: string;
    family: FamilyId;
    topic: string;
    branch: PedagogicalBranchId | undefined;
    declared_branch?: string;
    taxonomy_drift: boolean;
    instruction_preview: string;
  };

  const rows: Row[] = [];
  const clusterMap = new Map<
    string,
    { count: number; slugs: string[]; branches: Record<string, number>; drift: number }
  >();

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
    const topic = inferTopic(blob, family);
    const taxonomyDrift = topic === 'Drift taxonômico — reclassificar subtópico';
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
      taxonomy_drift: taxonomyDrift,
      instruction_preview: instruction.slice(0, 100).replace(/\s+/g, ' '),
    });

    const acc = clusterMap.get(topic) ?? { count: 0, slugs: [], branches: {}, drift: 0 };
    acc.count += 1;
    acc.slugs.push(slug);
    if (taxonomyDrift) acc.drift += 1;
    const bk = branch ?? '—';
    acc.branches[bk] = (acc.branches[bk] ?? 0) + 1;
    clusterMap.set(topic, acc);
  }

  const total = rows.length;
  const strongThreshold = Math.max(5, Math.ceil(total * 0.1));

  const clusterSummaries = [...clusterMap.entries()]
    .map(([cluster, stats]) => {
      const pct = Math.round((stats.count / total) * 1000) / 10;
      const hasGolden = COVERED_CLUSTERS.has(cluster);
      const dominantBranch = Object.entries(stats.branches).sort((a, b) => b[1] - a[1])[0]?.[0];
      const isDrift = cluster.startsWith('Drift');
      return {
        cluster,
        count: stats.count,
        pct,
        drift_slugs: stats.drift,
        has_golden: hasGolden,
        golden_file: GOLDEN_BY_CLUSTER[cluster] ?? null,
        dominant_branch: dominantBranch,
        branch_counts: stats.branches,
        sample_slugs: stats.slugs.slice(0, 4),
        decision: isDrift
          ? 'reclassificar'
          : hasGolden
            ? 'coberto'
            : stats.count >= strongThreshold
              ? 'novo_ramo'
              : stats.count >= 3
                ? 'absorver'
                : 'cauda_longa',
        l3_package:
          dominantBranch === 'respiratorio_vf_asma_dpoc'
            ? 'respiratorio-asma-dpoc-duel-deck · respiratorio-spo2-reference-board · respiratorio-vf-juggle-tap · respiratorio-spo2-trap-arena'
            : dominantBranch === 'respiratorio_dpoc_oxigenio'
              ? 'respiratorio-asma-dpoc-duel-deck · respiratorio-spo2-reference-board · cards · respiratorio-spo2-trap-arena'
              : 'morphological · reference_table · cards · compare (genérico)',
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

  const driftTotal = rows.filter((r) => r.taxonomy_drift).length;

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: SUBTOPICO,
    lote,
    total,
    strong_threshold: strongThreshold,
    drift_total: driftTotal,
    branch_totals: branchTotals,
    goldens_needed: clusterSummaries.filter((c) => c.decision === 'novo_ramo' && !c.has_golden).length,
    cluster_decisions: clusterSummaries,
    rows,
  };

  const outDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'respiratorio-cronico-topic-cluster-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[cluster:respiratorio-cronico] total=${total} lote=${lote} drift=${driftTotal}`);
  console.log(`[cluster:respiratorio-cronico] ramos L3: ${JSON.stringify(branchTotals)}`);
  console.log(`[cluster:respiratorio-cronico] limiar ramo forte=${strongThreshold}`);
  console.log(`[cluster:respiratorio-cronico] report=${outPath}`);
  for (const c of clusterSummaries) {
    console.log(
      `  ${c.decision.padEnd(14)} ${String(c.count).padStart(2)} (${String(c.pct).padStart(5)}%) — ${c.cluster}`,
    );
  }
}

main();
