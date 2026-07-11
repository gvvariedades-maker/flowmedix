#!/usr/bin/env tsx
/**
 * Clusteriza questões de Saúde da Mulher por tema pedagógico × família.
 * Uso: npm run cluster:saude-da-mulher
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { classifyFamily, type FamilyId, type QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const SUBTOPICO = 'Saúde da Mulher';

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'Pré-natal / gestação': 'questao-premium-cpcon-saude-mulher-pre-natal-vf.json',
  'Parto / trabalho de parto': 'questao-premium-admtec-saude-mulher-parto-humanizado-vf.json',
  'Rastreio câncer de colo': 'questao-premium-vunesp-saude-mulher-papanicolau.json',
  'Saúde da mama': 'questao-premium-vunesp-saude-mulher-mamografia.json',
  'Puerpério / lactação': 'questao-premium-ms-saude-mulher-puerperio-consulta.json',
  'Planejamento familiar / contracepção': 'questao-premium-cpcon-saude-mulher-planejamento-vf.json',
};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

function corpus(instruction: string, options: QuestionOption[]): string {
  return `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
}

function inferTopic(blob: string): string {
  if (/semiologia|inspe[cç][aã]o|palpa[cç][aã]o|ausculta|sinal cl[ií]nico/i.test(blob)) {
    return 'Semiologia (drift?)';
  }
  if (/processo de enfermagem|diagn[oó]stico de enfermagem|\bsae\b/i.test(blob)) {
    return 'SAE (drift?)';
  }
  if (/coleta de exames|transporte de amostra|biossegur.*amostra/i.test(blob)) {
    return 'Coleta de exames (drift?)';
  }
  if (/epidemiologia|sinasc|vigil[aâ]ncia epidemiol/i.test(blob)) {
    return 'Epidemiologia (drift?)';
  }
  if (/anatomia|c[eé]rvix|endom[eé]trio|ov[aá]rio/i.test(blob) && !/papanicolau|rastreio/i.test(blob)) {
    return 'Anatomia feminina (drift?)';
  }
  if (/papanicolau|colo uterino|c[aâ]ncer.*colo|hpv.*vacina|citologia onc[oó]tica|rastreio.*colo/i.test(blob)) {
    return 'Rastreio câncer de colo';
  }
  if (/mama|mamografia|rastreio.*mama/i.test(blob)) {
    return 'Saúde da mama';
  }
  if (/parto|trabalho de parto|humaniza|fase expulsiva|dequita[cç][aã]o|clampeamento/i.test(blob)) {
    return 'Parto / trabalho de parto';
  }
  if (/puerp[eé]rio|puerperal|lacta[cç][aã]o|amamenta[cç][aã]o|aleitamento|colostro/i.test(blob)) {
    return 'Puerpério / lactação';
  }
  if (/pr[eé]-natal|pr[eé] natal|gesta[cç][aã]o|gestante|gravidez|pr[eé]-gestacional|pr[eé] concep|idade gestacional|\big\b.*semana/i.test(blob)) {
    return 'Pré-natal / gestação';
  }
  if (/planejamento familiar|contracep|anticoncep|m[eé]todo.*barreira|diu\b|implante/i.test(blob)) {
    return 'Planejamento familiar / contracepção';
  }
  if (/climat[eé]rio|menopausa|reposi[cç][aã]o hormonal/i.test(blob)) {
    return 'Climatério / menopausa';
  }
  if (/amenorreia|menstrua[cç][aã]o|dismenorreia|s[ií]ndrome.*ov[aá]rio/i.test(blob)) {
    return 'Ciclo menstrual / amenorreia';
  }
  if (/viol[eê]ncia|sinan|abuso|estupro/i.test(blob)) {
    return 'Violência contra a mulher';
  }
  if (/ist\b|s[ií]filis|hiv.*gest|aids.*gest|hepatite.*gest/i.test(blob)) {
    return 'IST na gestação';
  }
  if (/aborto|interrup[cç][aã]o.*gesta/i.test(blob)) {
    return 'Aborto / interrupção';
  }
  return 'Saúde da mulher — conceito geral';
}

function branchForCluster(cluster: string): string {
  const map: Record<string, string> = {
    'Pré-natal / gestação': 'mulher_prenatal',
    'Rastreio câncer de colo': 'mulher_papanicolau',
    'Parto / trabalho de parto': 'mulher_parto',
    'Puerpério / lactação': 'mulher_puerperio',
    'Saúde da mama': 'mulher_mama',
    'Planejamento familiar / contracepção': 'mulher_planejamento',
    'Climatério / menopausa': 'mulher_climaterio',
    'Ciclo menstrual / amenorreia': 'mulher_ciclo',
    'Violência contra a mulher': 'mulher_violencia',
    'IST na gestação': 'mulher_ist_gestacao',
    'Saúde da mulher — conceito geral': 'mulher_generico',
  };
  if (cluster.includes('drift')) return 'mulher_generico';
  return map[cluster] ?? 'mulher_generico';
}

function l3Package(branch: string): string {
  const bespoke: Record<string, string> = {
    mulher_prenatal:
      'mulher-gestation-timeline · mulher-prenatal-board · mulher-prenatal-tap-flow · mulher-prenatal-trap-arena (bespoke)',
    mulher_papanicolau:
      'mulher-screening-spectrum · mulher-papanicolau-board · mulher-screening-tap-flow · mulher-screening-trap-arena (bespoke)',
    mulher_parto:
      'mulher-labor-phase-deck · mulher-parto-humanizado-board · mulher-labor-tap-flow · mulher-parto-trap-arena (bespoke)',
    mulher_mama:
      'mulher-mammography-spectrum · mulher-mama-board · mulher-mama-tap-flow · mulher-mama-trap-arena (bespoke)',
    mulher_puerperio:
      'mulher-puerperio-timeline · mulher-puerperio-board · mulher-puerperio-tap-flow · mulher-puerperio-trap-arena (bespoke)',
    mulher_planejamento:
      'mulher-contraception-spectrum · mulher-planejamento-board · mulher-planejamento-tap-flow · mulher-planejamento-trap-arena (bespoke)',
  };
  return (
    bespoke[branch] ??
    'morphological · reference_table · vertical · compare (genérico)'
  );
}

type QuestaoFile = {
  meta?: { subtopico?: string; family?: FamilyId; pedagogical_branch?: string };
  question_data?: { instruction?: string; options?: QuestionOption[] };
  modulo_slug?: string;
};

function main() {
  const lote = parseArg('lote') ?? 'saude-da-mulher-completo';
  const dir = loteQuestionsDir(lote);
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

  type Row = {
    slug: string;
    family: FamilyId;
    topic: string;
    branch_id: string;
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
    const family = classifyFamily(
      instruction,
      payload.meta?.subtopico ?? SUBTOPICO,
      options,
      '',
    );
    const topic = inferTopic(blob);
    const branch_id = branchForCluster(topic);
    const drift = topic.includes('drift');

    rows.push({
      slug,
      family,
      topic,
      branch_id,
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
  const strongThreshold = Math.max(5, Math.ceil(total * 0.1));

  const clusterSummaries = [...clusterMap.entries()]
    .map(([cluster, stats]) => {
      const pct = Math.round((stats.count / total) * 1000) / 10;
      const hasGolden = COVERED_CLUSTERS.has(cluster);
      const branch_id = branchForCluster(cluster);
      const isStrong = stats.count >= strongThreshold;
      let decision: string;
      if (hasGolden) decision = 'coberto';
      else if (cluster.includes('drift')) decision = 'absorver';
      else if (isStrong) decision = 'novo_ramo';
      else if (stats.count >= 5) decision = 'absorver';
      else if (stats.count >= 3) decision = 'cauda_longa';
      else decision = 'cauda_longa';

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
        strong: isStrong,
        l3_package: l3Package(branch_id),
      };
    })
    .sort((a, b) => b.count - a.count);

  const driftTotal = rows.filter((r) => r.drift).length;

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: SUBTOPICO,
    lote,
    total,
    strong_threshold: strongThreshold,
    drift_total: driftTotal,
    branch_totals: rows.reduce(
      (acc, r) => {
        acc[r.branch_id] = (acc[r.branch_id] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    inedito_packages_needed: clusterSummaries.filter(
      (c) => c.decision === 'novo_ramo' && !c.has_golden,
    ).length,
    handcrafts_needed: total,
    cluster_decisions: clusterSummaries,
    rows,
  };

  const outDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'saude-da-mulher-topic-cluster-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[cluster:saude-da-mulher] total=${total} lote=${lote} threshold=${strongThreshold}`);
  console.log(`[cluster:saude-da-mulher] drift_total=${driftTotal}`);
  console.log(`[cluster:saude-da-mulher] pacotes inéditos=${report.inedito_packages_needed}`);
  console.log(`[cluster:saude-da-mulher] report=${outPath}`);
  for (const c of clusterSummaries) {
    console.log(
      `  ${c.decision.padEnd(12)} ${String(c.count).padStart(3)} (${String(c.pct).padStart(5)}%) — ${c.cluster} → ${c.branch_id}`,
    );
  }
}

main();
