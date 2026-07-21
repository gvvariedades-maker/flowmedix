#!/usr/bin/env tsx
/**
 * Clusteriza questões de Promoção à Saúde e Prevenção de Agravos por tema × família × ramo L3.
 * Uso: npm run cluster:promocao
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

const SUBTOPICO = 'Promoção à Saúde e Prevenção de Agravos';

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'Lei 8.080 — Art. 4º composição do SUS': 'questao-premium-sus-lei-8080-cesgranrio.json',
};

const CLUSTER_TO_BRANCH: Record<string, string> = {
  'Lei 8.080 — Art. 4º composição do SUS': 'promocao_art4_composicao',
  'Princípios e direitos (CF Art. 196, universalidade, integralidade)': 'promocao_principios_direitos',
  'Promoção × prevenção × proteção × recuperação': 'promocao_educacao_prevencao',
  'Atenção básica e educação em saúde': 'promocao_educacao_prevencao',
  'Determinantes sociais e políticas públicas': 'promocao_educacao_prevencao',
  'Vigilância em saúde e políticas de vigilância': 'promocao_educacao_prevencao',
  'Campanhas — zoonoses e acidentes por animais peçonhentos': 'promocao_educacao_prevencao',
  'Cuidador familiar e autocuidado na comunidade': 'promocao_educacao_prevencao',
  'Lei 8.142 — controle social / CNS': 'promocao_principios_direitos',
  'EXCETO / INCORRETA sobre SUS': 'promocao_principios_direitos',
  'V/F I–II–III sobre legislação sanitária': 'promocao_principios_direitos',
  'Promoção à saúde — conceito geral': 'promocao_generico',
};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

const BESPOKE_BRANCHES = new Set(['promocao_art4_composicao']);

function corpus(instruction: string, options: QuestionOption[]): string {
  return `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
}

function promocaoEducationContext(blob: string): boolean {
  return /educa[cç][aã]o em sa[uú]de|a[cç][aã]o educativa|acs\b|agente comunit[aá]rio|visita domiciliar|preven[cç][aã]o (prim[aá]ria|secund[aá]ria|terci[aá]ria)|cuidador|di[aá]rio do cuidador|manejo.*diarreia|desidrata[cç][aã]o|infectoparasit|helmint|parasitose|campanha de preven[cç][aã]o/i.test(
    blob,
  );
}

function detectDrift(slug: string, blob: string, metaSubtopico?: string): string | null {
  if (metaSubtopico && /doen[cç]as parasit[aá]rias|zoonoses/i.test(metaSubtopico)) {
    return 'Doenças parasitárias (drift?)';
  }
  if (
    /imuniza[cç][aã]o|vacina\b|calend[aá]rio vacinal|pni\b|bcg\b|pentavalente/.test(blob) &&
    !promocaoEducationContext(blob) &&
    !/campanha.*preven[cç][aã]o|promo[cç][aã]o.*sa[uú]de/.test(blob)
  ) {
    return 'Imunização (drift?)';
  }
  if (
    /sinais vitais|press[aã]o arterial.*mmhg|frequ[eê]ncia card[ií]aca|temperatura axilar/.test(blob) &&
    !/hipertens[aã]o|has\b|estilo de vida|di[aá]rio do cuidador|cuidador|desidrata|manejo.*diarreia/.test(blob)
  ) {
    return 'Sinais vitais (drift?)';
  }
  if (/escorpi[aã]o|zoonose|dengue|mal[aá]ria|leishmaniose/.test(blob) && /plano de a[cç][aã]o|acidente|pe[cç]onhent/.test(blob)) {
    return null;
  }
  if (
    (slug.includes('saude-do-idoso') || /idoso|geri[aá]tric/.test(blob)) &&
    !/cuidador|higiene oral|higiene bucal|guia pr[aá]tico do cuidador/i.test(blob)
  ) {
    return 'Saúde do idoso (drift?)';
  }
  return null;
}

function inferTopic(blob: string, family: FamilyId): string {
  if (/art\.?\s*4|constitui o sistema [uú]nico de sa[uú]de|composi[cç][aã]o do sus|lei org[aâ]nica da sa[uú]de|8\.080|ações e servi[cç]os de sa[uú]de.*[oó]rg[aã]os e institui[cç][õo]es p[uú]blicas/i.test(blob)) {
    return 'Lei 8.080 — Art. 4º composição do SUS';
  }
  if (/8\.142|conselho de sa[uú]de|controle social|participa[cç][aã]o da comunidade|\bcns\b|confer[eê]ncia de sa[uú]de/i.test(blob)) {
    return 'Lei 8.142 — controle social / CNS';
  }
  if (/exceto|incorreta|n[aã]o (constitui|integra|comp[oõ]e)|todas est[aã]o corretas exceto/i.test(blob) && /sus|sistema [uú]nico|8\.080|8\.142/i.test(blob)) {
    return 'EXCETO / INCORRETA sobre SUS';
  }
  if (
    (family === 'vf' || /julgue.*item|assinale a alternativa correta.*i\b|ii\b|iii\b/i.test(blob)) &&
    /lei|sus|8\.080|8\.142|constitui[cç][aã]o federal|art\.?\s*\d/i.test(blob)
  ) {
    return 'V/F I–II–III sobre legislação sanitária';
  }
  if (/universalidade|integralidade|equidade|art\.?\s*196|direito [àa] sa[uú]de|princ[ií]pios do sus|descentraliza[cç][aã]o|regionaliza[cç][aã]o|hierarquiza[cç][aã]o/i.test(blob)) {
    return 'Princípios e direitos (CF Art. 196, universalidade, integralidade)';
  }
  if (/vigil[aâ]ncia em sa[uú]de|vigil[aâ]ncia epidemiol[oó]gica|vigil[aâ]ncia sanit[aá]ria|vigil[aâ]ncia.*agravo/i.test(blob)) {
    return 'Vigilância em saúde e políticas de vigilância';
  }
  if (/pe[cç]onhent|escorpi[aã]o|serpente|animal pe[cç]onhento|acidente.*(escorpi[aã]o|serpente|aranha)/i.test(blob)) {
    return 'Campanhas — zoonoses e acidentes por animais peçonhentos';
  }
  if (/cuidador|di[aá]rio do cuidador|higiene oral|higiene bucal|guia pr[aá]tico do cuidador|sa[uú]de bucal/i.test(blob)) {
    return 'Cuidador familiar e autocuidado na comunidade';
  }
  if (/promo[cç][aã]o da sa[uú]de|preven[cç][aã]o de agravos|prote[cç][aã]o da sa[uú]de|recupera[cç][aã]o da sa[uú]de|preven[cç][aã]o prim[aá]ria|secund[aá]ria|terci[aá]ria|leavell|ottawa|úlcera.*press[aã]o|les[aã]o por press[aã]o/i.test(blob)) {
    return 'Promoção × prevenção × proteção × recuperação';
  }
  if (/determinantes|classe social|saneamento|condi[cç][õo]es de vida|moradia|renda|pol[ií]ticas p[uú]blicas|desigualdade.*sa[uú]de|humaniza[cç][aã]o/i.test(blob)) {
    return 'Determinantes sociais e políticas públicas';
  }
  if (
    /educa[cç][aã]o em sa[uú]de|aten[cç][aã]o b[aá]sica|esf\b|sa[uú]de da fam[ií]lia|campanha de preven[cç][aã]o|orientar a popula[cç][aã]o|estilo de vida|mev\b|obesidade|álcool|alcool|hipertens[aã]o|acs\b|agente comunit[aá]rio|visita domiciliar|aleitamento|amamenta[cç][aã]o|manejo.*diarreia|assist[eê]ncia de enfermagem na ab|aten[cç][aã]o prim[aá]ria/i.test(
      blob,
    )
  ) {
    return 'Atenção básica e educação em saúde';
  }
  return 'Promoção à saúde — conceito geral';
}

function branchForCluster(cluster: string): string {
  if (cluster.includes('drift')) return 'promocao_generico';
  return CLUSTER_TO_BRANCH[cluster] ?? 'promocao_generico';
}

function l3Package(branch: string): string {
  if (branch === 'promocao_art4_composicao') {
    return 'sus-art4-orbit · center · cards · scope-trap (bespoke wired)';
  }
  if (branch === 'promocao_principios_direitos' || branch === 'promocao_educacao_prevencao') {
    return 'morphological · reference_table · tap · compare (genérico)';
  }
  return 'genérico premium (SUBTOPIC_DESIGN_MAP sus-art4-orbit fallback)';
}

function l3Decision(branch: string, count: number, threshold: number): string {
  if (BESPOKE_BRANCHES.has(branch)) return 'molde_redesign';
  if (count >= threshold) return 'molde_redesign';
  return 'ok_generico';
}

type QuestaoFile = {
  meta?: { subtopico?: string; family?: FamilyId; pedagogical_branch?: string };
  question_data?: { instruction?: string; options?: QuestionOption[]; text_fragment?: string };
  modulo_slug?: string;
};

function main() {
  const lote = parseArg('lote') ?? 'promocao-a-saude-e-prevencao-de-agravos-completo';
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
    inedito_packages_needed: clusterSummaries.filter(
      (c) => c.l3_decision === 'molde_redesign',
    ).length,
    handcrafts_needed: total,
    cluster_decisions: clusterSummaries,
    rows,
  };

  const outDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'promocao-a-saude-e-prevencao-de-agravos-topic-cluster-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[cluster:promocao] total=${total} lote=${lote} threshold=${strongThreshold}`);
  console.log(`[cluster:promocao] drift_total=${report.drift_total}`);
  console.log(`[cluster:promocao] ramos fortes=${strongBranches.length}`);
  for (const b of strongBranches) {
    console.log(`  • ${b.branch}: ${b.count} slugs`);
  }
  console.log('[cluster:promocao] top clusters:');
  for (const c of clusterSummaries.slice(0, 8)) {
    console.log(`  • ${c.cluster}: ${c.count} (${c.pct}%) — ${c.l3_decision}`);
  }
  console.log(`[cluster:promocao] report=${outPath}`);
}

main();
