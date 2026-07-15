#!/usr/bin/env tsx
/**
 * Clusteriza questões de Saúde da Criança por tema pedagógico × família.
 * Uso: npm run cluster:saude-da-crianca
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { classifyFamily, type FamilyId, type QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const SUBTOPICO = 'Saúde da Criança';

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'Aleitamento / nutrição infantil': 'questao-premium-cpcon-saude-crianca-aleitamento-vf.json',
  'Triagem neonatal (pezinho / coraçãozinho)': 'questao-premium-cpcon-saude-crianca-triagem-neonatal-vf.json',
  'Neonatologia clínica': 'questao-premium-idecan-saude-crianca-neonatologia-vf.json',
  'APS / puericultura': 'questao-premium-consulplan-saude-crianca-puericultura-vf.json',
  'Desenvolvimento infantil': 'questao-premium-cpcon-saude-crianca-desenvolvimento-vf.json',
  'Desidratação / diarreia aguda': 'questao-premium-cev-saude-crianca-desidratacao-vf.json',
};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

function corpus(instruction: string, options: QuestionOption[]): string {
  return `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
}

function inferTopic(blob: string): string {
  if (/vias de administra|intramuscular|subcut[aâ]nea|intrad[eé]rmica/i.test(blob) && /menor de 3|&lt;3|<3|crian[cç]a pequena/i.test(blob)) {
    return 'Vias pediátricas (drift?)';
  }
  if (/epidemiologia|sinan|vigil[aâ]ncia epidemiol|notifica[cç][aã]o compuls[oó]ria/i.test(blob) && !/crian[cç]a|lactente|rec[eé]m-nascido|rn\b/i.test(blob)) {
    return 'Epidemiologia (drift?)';
  }
  if (/pezinho|teste do pezinho|fenilceton|fenilalanina|pk[uú]|tsh|hipotireoidismo congen|triagem neonatal|teste do cora[cç][aã]ozinho|oximetria.*rn|pntn/i.test(blob)) {
    return 'Triagem neonatal (pezinho / coraçãozinho)';
  }
  if (/aleitamento|amamenta[cç][aã]o|ame\b|leite materno|lactente|colostro|introdu[cç][aã]o alimentar|pnae|mel\b|ordenha|fórmula infantil|nutri[cç][aã]o infantil/i.test(blob)) {
    return 'Aleitamento / nutrição infantil';
  }
  if (/desidrata[cç][aã]o|diarreia aguda|plano [abc]|soro oral|tiragem|fontanela|olig[uú]ria|mucosa seca/i.test(blob)) {
    return 'Desidratação / diarreia aguda';
  }
  if (/apgar|reanima[cç][aã]o neonatal|rn prematuro|alto risco ao nascer|condi[cç][aã]o ao nascer/i.test(blob)) {
    return 'APGAR / reanimação neonatal';
  }
  if (/surfactante|icter[ií]cia|s[ií]ndrome do desconforto|sdr\b|cefalohematoma|convuls[aã]o neonatal|banho.*rec[eé]m|pele.*rec[eé]m-nascido|sonol[eê]ncia.*rn|dm neonatal|glicemia.*neonatal/i.test(blob)) {
    return 'Neonatologia clínica';
  }
  if (/visita domiciliar|puericultura|5[oº] dia|caderneta|calend[aá]rio.*consulta|estratifica[cç][aã]o.*risco|sinais de alerta|cab\b|aten[cç][aã]o b[aá]sica.*crian[cç]a/i.test(blob)) {
    return 'APS / puericultura';
  }
  if (/tea\b|m-?chat|estrabismo|hirschberg|marco.*desenvolv|aidpi|estimula[cç][aã]o precoce|desenvolvimento infantil/i.test(blob)) {
    return 'Desenvolvimento infantil';
  }
  if (/curva.*oms|escore z|antropometria|per[ií]metro cef[aá]lico|pc\b|peso.*altura|acompanhamento.*crescimento/i.test(blob)) {
    return 'Crescimento / curvas OMS';
  }
  if (/febre.*crian[cç]a|fc.*lactente|fr.*lactente|sinais vitais.*pedi|samu.*crian[cç]a/i.test(blob)) {
    return 'Sinais vitais pediátricos';
  }
  if (/c[aá]rie|sa[uú]de bucal|dente.*leite|higiene bucal/i.test(blob)) {
    return 'Saúde bucal infantil';
  }
  if (/maus-tratos|viol[eê]ncia.*crian[cç]a|prote[cç][aã]o.*infantil|conselho tutelar/i.test(blob)) {
    return 'Violência / proteção infantil';
  }
  if (/dor.*crian[cç]a|escala.*dor|curativo.*pedi/i.test(blob)) {
    return 'Dor pediátrica';
  }
  if (/vacina|imuniza[cç][aã]o|pentavalente|t[eé]tano.*neonatal|bcg|hepatite b.*rn/i.test(blob)) {
    return 'Vacinação infantil';
  }
  return 'Saúde da criança — conceito geral';
}

function branchForCluster(cluster: string): string {
  const map: Record<string, string> = {
    'Aleitamento / nutrição infantil': 'crianca_aleitamento_nutricao',
    'Triagem neonatal (pezinho / coraçãozinho)': 'crianca_triagem_neonatal',
    'Neonatologia clínica': 'crianca_neonatologia',
    'APS / puericultura': 'crianca_aps_puericultura',
    'Desenvolvimento infantil': 'crianca_desenvolvimento',
    'Desidratação / diarreia aguda': 'crianca_desidratacao',
    'Crescimento / curvas OMS': 'crianca_crescimento_curvas',
    'APGAR / reanimação neonatal': 'crianca_apgar_reanimacao',
    'Sinais vitais pediátricos': 'crianca_sinais_vitais',
    'Saúde bucal infantil': 'crianca_saude_bucal',
    'Violência / proteção infantil': 'crianca_violencia_protecao',
    'Dor pediátrica': 'crianca_dor',
    'Vacinação infantil': 'crianca_vacinacao',
    'Saúde da criança — conceito geral': 'crianca_generico',
  };
  if (cluster.includes('drift')) return 'crianca_generico';
  return map[cluster] ?? 'crianca_generico';
}

function l3Package(branch: string): string {
  const bespoke: Record<string, string> = {
    crianca_aleitamento_nutricao:
      'crianca-feeding-timeline · crianca-feeding-board · crianca-feeding-tap-flow · crianca-feeding-trap-arena (bespoke)',
    crianca_triagem_neonatal:
      'crianca-screening-timeline · crianca-screening-board · crianca-screening-tap-flow · crianca-screening-trap-arena (bespoke)',
    crianca_neonatologia:
      'crianca-neonatal-deck · crianca-neonatal-board · crianca-neonatal-tap-flow · crianca-neonatal-trap-arena (bespoke)',
    crianca_aps_puericultura:
      'crianca-puericultura-timeline · crianca-puericultura-board · crianca-puericultura-tap-flow · crianca-puericultura-trap-arena (bespoke)',
    crianca_desenvolvimento:
      'crianca-dev-milestones-rail · crianca-dev-board · crianca-dev-tap-flow · crianca-dev-trap-arena (bespoke)',
    crianca_desidratacao:
      'crianca-dehydration-spectrum · crianca-dehydration-board · crianca-dehydration-tap-flow · crianca-dehydration-trap-arena (bespoke)',
  };
  return bespoke[branch] ?? 'morphological · reference_table · vertical · compare (genérico)';
}

function l3Decision(branch: string, count: number, strongThreshold: number): string {
  const bespokeBranches = new Set([
    'crianca_aleitamento_nutricao',
    'crianca_triagem_neonatal',
    'crianca_neonatologia',
    'crianca_aps_puericultura',
    'crianca_desenvolvimento',
    'crianca_desidratacao',
  ]);
  if (bespokeBranches.has(branch)) return 'molde_inedito';
  if (count >= strongThreshold) return 'molde_redesign';
  return 'ok_generico';
}

type QuestaoFile = {
  meta?: { subtopico?: string; family?: FamilyId; pedagogical_branch?: string };
  question_data?: { instruction?: string; options?: QuestionOption[] };
  modulo_slug?: string;
};

function main() {
  const lote = parseArg('lote') ?? 'saude-da-crianca-completo';
  const dir = loteQuestionsDir(lote);
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));

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
  const strongThreshold = Math.max(5, Math.ceil(total * 0.1));

  const clusterSummaries = [...clusterMap.entries()]
    .map(([cluster, stats]) => {
      const pct = Math.round((stats.count / total) * 1000) / 10;
      const hasGolden = COVERED_CLUSTERS.has(cluster);
      const branch_id = branchForCluster(cluster);
      const isStrong = stats.count >= strongThreshold;
      let decision: string;
      if (cluster.includes('drift')) decision = 'absorver';
      else if (hasGolden) decision = 'coberto';
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
    inedito_packages_needed: clusterSummaries.filter(
      (c) => c.l3_decision === 'molde_inedito' || c.l3_decision === 'molde_redesign',
    ).length,
    handcrafts_needed: total,
    cluster_decisions: clusterSummaries,
    rows,
  };

  const outDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'saude-da-crianca-topic-cluster-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[cluster:saude-da-crianca] total=${total} lote=${lote} threshold=${strongThreshold}`);
  console.log(`[cluster:saude-da-crianca] drift_total=${report.drift_total}`);
  console.log(`[cluster:saude-da-crianca] ramos fortes=${strongBranches.length}`);
  for (const b of strongBranches) {
    console.log(`  • ${b.branch}: ${b.count} slugs`);
  }
  console.log(`[cluster:saude-da-crianca] report=${outPath}`);
}

main();
