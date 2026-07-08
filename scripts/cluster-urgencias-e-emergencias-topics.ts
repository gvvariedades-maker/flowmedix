#!/usr/bin/env tsx
/**
 * Clusteriza questões de Urgências e Emergências por família × tema pedagógico.
 * Uso: npm run cluster:urgencias-e-emergencias
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { classifyFamily, type FamilyId, type QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const SUBTOPICO = 'Urgências e Emergências';

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'RCP / SBV adulto (V/F ou protocolo)': 'questao-premium-urgencias-rcp.json',
};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

const CLUSTER_TO_BRANCH: Record<string, string> = {
  'RCP / SBV adulto (V/F ou protocolo)': 'urgencias_rcp_sbv',
  'RCP pediátrica / lactente': 'urgencias_rcp_pediatrico',
  'XABCDE / trauma e hemorragia': 'urgencias_xabcde_trauma',
  'Manchester / triagem de risco': 'urgencias_manchester_triagem',
  'V/F — protocolos I/II/III': 'urgencias_vf_protocolo',
  'EXCETO / INCORRETA — conduta': 'urgencias_exceto_conduta',
  'Anafilaxia / epinefrina': 'urgencias_anafilaxia',
  'Convulsão / crise epiléptica': 'urgencias_convulsao',
  'AVC / IAM — reconhecimento': 'urgencias_avc_iam',
  'Engasgo / obstrução de via aérea': 'urgencias_engasgo',
  'Choque / hipoperfusão': 'urgencias_choque',
  'Queimadura — primeiro socorro': 'urgencias_queimadura',
  'Certo ou errado': 'urgencias_generico',
  'Urgências — conceito geral': 'urgencias_generico',
  'Default — sem âncora temática': 'urgencias_generico',
};

const DRIFT_PATTERNS: RegExp[] = [
  /processo de enfermagem|diagn[oó]stico de enfermagem|nanda\b|nic\b|noc\b/i,
  /semiologia em enfermagem(?!.*urg[eê]ncia|.*emerg[eê]ncia|.*rcp|.*trauma)/i,
  /no[cç][oõ]es de (anatomia|fisiologia)/i,
  /exames (complementares|laboratoriais)(?!.*troponina|.*ecg)/i,
  /oxigenoterapia(?!.*emerg|.*urg[eê]ncia|.*rcp)/i,
  /vias de administra[cç][aã]o(?!.*epinefrina|.*adrenalina)/i,
  /instala[cç][aã]o e manejo de sondas/i,
  /enfermagem em centro cir[uú]rgico/i,
  /epidemiologia e vigil[aâ]ncia/i,
  /cuidados na administra[cç][aã]o de medicamentos(?!.*emerg)/i,
];

function corpus(instruction: string, options: QuestionOption[]): string {
  return `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
}

function isUrgenciasSlug(slug: string): boolean {
  return slug.includes('urgencias-e-emergencias');
}

function inferBuilderTopic(instruction: string, options: QuestionOption[]): string {
  const blob = corpus(instruction, options);

  if (DRIFT_PATTERNS.some((p) => p.test(blob)) && !isUrgenciasSlug(blob)) {
    return 'Drift taxonômico';
  }
  if (!isUrgenciasSlug(blob) && DRIFT_PATTERNS.some((p) => p.test(blob))) {
    return 'Drift taxonômico';
  }
  if (/\bexceto\b|\bincorreta\b|\bincorreto\b/.test(blob)) return 'EXCETO';
  if (/\bmanchester\b|triagem de risco|classifica[cç][aã]o de risco|cor (vermelh|laranj|amarel|verd|azul)/i.test(blob)) {
    return 'Manchester';
  }
  if (/xabcde|\bx\b.*hemorragia|abcde|atls|torniquete|hemorragia (exsanguinante|massiva)|colar cervical|imobiliza[cç][aã]o/i.test(blob)) {
    return 'Trauma';
  }
  if (/rcp|reanima[cç][aã]o|compress[aã]o tor[aá]cica|sbv|suporte b[aá]sico|dea|desfibril|30:2|pcr\b|parada card/i.test(blob)) {
    if (/lactente|beb[eê]|pedi[aá]tr|crian[cç]a|15:2|dois dedos/i.test(blob)) return 'RCP pediátrica';
    return 'RCP adulto';
  }
  if (/anafilax|epinefrina|adrenalina im|choque anafil/i.test(blob)) return 'Anafilaxia';
  if (/convuls|epilep|crise epil/i.test(blob)) return 'Convulsão';
  if (/\bavc\b|acidente vascular|fast\b|face.*bra[cç]o.*fala|iam\b|infarto|s[ií]ndrome coronar|dor tor[aá]cica opress/i.test(blob)) {
    return 'AVC/IAM';
  }
  if (/engasgo|heimlich|obstru[cç][aã]o.*via a[eé]rea|corpo estranho/i.test(blob)) return 'Engasgo';
  if (/choque|hipotens|perfus[aã]o|pele fria|enchimento capilar/i.test(blob)) return 'Choque';
  if (/queimadura|escaldad/i.test(blob)) return 'Queimadura';
  if (/urg[eê]ncia|emerg[eê]ncia|primeiros socorros|samu|192\b|pl[s]|posi[cç][aã]o lateral/i.test(blob)) {
    return 'Urgências geral';
  }
  return 'Default';
}

function refinePedagogicalCluster(
  instruction: string,
  options: QuestionOption[],
  family: FamilyId,
  builderTopic: string,
  slug: string,
): string {
  const blob = corpus(instruction, options);

  if (builderTopic === 'Drift taxonômico' && !isUrgenciasSlug(slug)) {
    return 'Drift taxonômico — reclassificar subtópico';
  }
  if (DRIFT_PATTERNS.some((p) => p.test(blob)) && !/urg[eê]ncia|emerg[eê]ncia|rcp|trauma|sbv|dea|xabcde|manchester/i.test(blob)) {
    return 'Drift taxonômico — reclassificar subtópico';
  }

  if (family === 'vf' || (/\b(i|ii|iii)\s*[-–—]/i.test(instruction) && /urg[eê]ncia|emerg[eê]ncia|rcp|trauma|sbv/i.test(blob))) {
    if (builderTopic === 'RCP adulto' || builderTopic === 'RCP pediátrica') {
      return 'RCP / SBV adulto (V/F ou protocolo)';
    }
    return 'V/F — protocolos I/II/III';
  }
  if (family === 'certo_errado') return 'Certo ou errado';
  if (builderTopic === 'EXCETO' || /\bexceto\b|\bincorreta\b/.test(blob)) {
    return 'EXCETO / INCORRETA — conduta';
  }
  if (builderTopic === 'Manchester') return 'Manchester / triagem de risco';
  if (builderTopic === 'Trauma') return 'XABCDE / trauma e hemorragia';
  if (builderTopic === 'RCP pediátrica') return 'RCP pediátrica / lactente';
  if (builderTopic === 'RCP adulto') return 'RCP / SBV adulto (V/F ou protocolo)';
  if (builderTopic === 'Anafilaxia') return 'Anafilaxia / epinefrina';
  if (builderTopic === 'Convulsão') return 'Convulsão / crise epiléptica';
  if (builderTopic === 'AVC/IAM') return 'AVC / IAM — reconhecimento';
  if (builderTopic === 'Engasgo') return 'Engasgo / obstrução de via aérea';
  if (builderTopic === 'Choque') return 'Choque / hipoperfusão';
  if (builderTopic === 'Queimadura') return 'Queimadura — primeiro socorro';
  if (builderTopic === 'Urgências geral') return 'Urgências — conceito geral';

  return 'Default — sem âncora temática';
}

type Row = {
  slug: string;
  family: FamilyId;
  builder_topic: string;
  pedagogical_cluster: string;
  pedagogical_branch_proposed: string;
  taxonomy_drift: boolean;
  instruction_preview: string;
};

type ClusterAccum = {
  count: number;
  drift: number;
  slugs: string[];
  branches: Record<string, number>;
};

function main() {
  const lote = parseArg('lote') ?? 'urgencias-e-emergencias-completo';
  const dir = loteQuestionsDir(lote);
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

  const rows: Row[] = [];
  const clusterMap = new Map<string, ClusterAccum>();

  for (const file of files) {
    const payload = JSON.parse(readFileSync(resolve(dir, file), 'utf8')) as {
      modulo_slug?: string;
      meta?: { subtopico?: string; family?: FamilyId };
      question_data?: { instruction?: string; options?: QuestionOption[] };
    };
    const slug = payload.modulo_slug ?? file.replace(/\.json$/, '');
    const instruction = String(payload.question_data?.instruction ?? '');
    const options = payload.question_data?.options ?? [];
    const family = classifyFamily(
      instruction,
      payload.meta?.subtopico ?? SUBTOPICO,
      options,
      '',
    );
    const builderTopic = inferBuilderTopic(instruction, options);
    const cluster = refinePedagogicalCluster(instruction, options, family, builderTopic, slug);
    const taxonomyDrift = cluster.startsWith('Drift');
    const branch = CLUSTER_TO_BRANCH[cluster] ?? 'urgencias_generico';

    rows.push({
      slug,
      family,
      builder_topic: builderTopic,
      pedagogical_cluster: cluster,
      pedagogical_branch_proposed: branch,
      taxonomy_drift: taxonomyDrift,
      instruction_preview: instruction.slice(0, 100).replace(/\s+/g, ' '),
    });

    const acc = clusterMap.get(cluster) ?? { count: 0, drift: 0, slugs: [], branches: {} };
    acc.count += 1;
    acc.slugs.push(slug);
    if (taxonomyDrift) acc.drift += 1;
    acc.branches[branch] = (acc.branches[branch] ?? 0) + 1;
    clusterMap.set(cluster, acc);
  }

  const total = rows.length;
  const strongThreshold = Math.max(5, Math.ceil(total * 0.1));

  const clusterSummaries = [...clusterMap.entries()]
    .map(([cluster, stats]) => {
      const pct = Math.round((stats.count / total) * 1000) / 10;
      const hasGolden = COVERED_CLUSTERS.has(cluster);
      const dominantBranch = Object.entries(stats.branches).sort((a, b) => b[1] - a[1])[0]?.[0];
      const isDrift = cluster.startsWith('Drift');
      const branch = CLUSTER_TO_BRANCH[cluster] ?? dominantBranch ?? 'urgencias_generico';
      return {
        cluster,
        count: stats.count,
        pct,
        drift_slugs: stats.drift,
        has_golden: hasGolden,
        golden_file: GOLDEN_BY_CLUSTER[cluster] ?? null,
        pedagogical_branch_proposed: branch,
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
          branch === 'urgencias_rcp_sbv'
            ? 'urgencias-rcp-chain-deck · urgencias-rcp-params-board · urgencias-rcp-tap-flow · urgencias-rcp-trap-arena (proposto)'
            : branch === 'urgencias_xabcde_trauma'
              ? 'urgencias-xabcde-rail · urgencias-trauma-reference-board · urgencias-xabcde-tap-flow · urgencias-trauma-trap-arena (proposto)'
              : branch === 'urgencias_manchester_triagem'
                ? 'urgencias-manchester-spectrum · urgencias-manchester-board · cards · urgencias-manchester-trap (proposto)'
                : 'morphological · reference_table · cards · compare (genérico)',
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
    pedagogical_clusters: clusterSummaries.map(({ cluster, count, pct, decision, sample_slugs }) => ({
      cluster,
      count,
      pct,
      decision,
      sample_slugs,
    })),
    rows,
  };

  const outDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'urgencias-e-emergencias-topic-cluster-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[cluster:urgencias-e-emergencias] total=${total} lote=${lote} drift=${driftTotal}`);
  console.log(`[cluster:urgencias-e-emergencias] ramos L3: ${JSON.stringify(branchTotals)}`);
  console.log(`[cluster:urgencias-e-emergencias] limiar ramo forte=${strongThreshold}`);
  console.log(`[cluster:urgencias-e-emergencias] report=${outPath}`);
  for (const c of clusterSummaries) {
    console.log(
      `  ${c.decision.padEnd(14)} ${String(c.count).padStart(3)} (${String(c.pct).padStart(5)}%) — ${c.cluster}`,
    );
  }
}

main();
