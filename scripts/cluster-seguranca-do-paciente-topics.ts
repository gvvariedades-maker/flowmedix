#!/usr/bin/env tsx
/**
 * Clusteriza questões de Segurança do Paciente por família × tema pedagógico.
 * Uso: npm run cluster:seguranca-do-paciente
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { classifyFamily, type FamilyId, type QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import {
  detectDuplicateDangerJustifications,
  hasInstructionArtifacts,
} from '@/lib/catalogMigration/slideContract';
import { hasPremiumStubMarkers } from '@/lib/catalogMigration/upgradePremiumHybrid';
import { premiumGateErrors } from '@/lib/catalogMigration/premiumGate';
import { parseArg } from '@/lib/catalogMigration/cliArgs';

const SUBTOPICO = 'Segurança do Paciente';

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'Identificação do paciente': 'questao-premium-cesgranrio-seguranca-paciente-identificacao-vf.json',
  'V/F — metas e identificação': 'questao-premium-cesgranrio-seguranca-paciente-identificacao-vf.json',
};

const BRANCH_BY_CLUSTER: Record<string, string> = {
  'Identificação do paciente': 'sp_identificacao',
  'Prevenção de quedas': 'sp_prevencao_quedas',
  'Eventos adversos e incidentes': 'sp_eventos_adversos',
  'Metas internacionais JCI/OMS': 'sp_metas_internacionais',
  'V/F — metas e identificação': 'sp_metas_internacionais',
};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

function detectTaxonomyDrift(slug: string, instruction: string): string | null {
  const blob = instruction.toLowerCase();
  if (
    slug.includes('auditoria-e-gestao') ||
    /gerenciamento de recursos|planejamento de gastos|manutenção preventiva|manutencao preventiva|dimensionamento do pessoal|lider autocrático|lider autocratico|provisão de materiais|provisao de materiais/.test(
      blob,
    )
  ) {
    return 'DRIFT — auditoria/gestão';
  }
  if (
    slug.includes('processo-de-enfermagem') &&
    !/metas internacionais|segurança do paciente|seguranca do paciente|evento adverso|queda|identificar corretamente/.test(
      blob,
    )
  ) {
    return 'DRIFT — processo de enfermagem';
  }
  return null;
}

function inferBuilderTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();

  if (/dois identificador|identificar corretamente o paciente|pulseira.*identifica|paciente errado|homônimo|homonimo/.test(blob)) {
    return 'Identificação do paciente';
  }
  if (/metas internacionais|meta internacional|jci|joint commission/.test(blob)) {
    return 'Metas internacionais JCI/OMS';
  }
  if (/queda|risco de queda|escala.*morse|morse|grades da cama/.test(blob)) {
    return 'Prevenção de quedas';
  }
  if (/evento adverso|incidente|near miss|quase erro|pnsp|portaria.*529|notificação de evento|notificacao de evento/.test(blob)) {
    return 'Eventos adversos e incidentes';
  }
  if (
    /medicamento|prescrição|prescricao|administração de medicamento|administracao de medicamento|cinco certos|nove certos|lasa|alto risco/.test(
      blob,
    )
  ) {
    return 'Segurança na medicação';
  }
  if (/higieniz|higienização das mãos|higienizacao das maos|cinco momentos/.test(blob)) {
    return 'Higienização das mãos';
  }
  if (/cirurgia segura|local de intervenção|local de intervencao|time out|timeout|checklist cirúrg|checklist cirurg/.test(blob)) {
    return 'Cirurgia segura';
  }
  if (/comunicação entre profissionais|comunicacao entre profissionais|sbar|transferência de informação|transferencia de informacao/.test(blob)) {
    return 'Comunicação na assistência';
  }
  if (/lesão por pressão|lesao por pressao|úlcera por pressão|ulcera por pressao|escore de braden|braden/.test(blob)) {
    return 'Lesão por pressão';
  }
  if (/humanização|humanizacao/.test(blob)) {
    return 'Humanização e cuidado';
  }
  if (/cultura de segurança|cultura de seguranca|probabilidade de um incidente/.test(blob)) {
    return 'Cultura de segurança';
  }
  if (/segurança do paciente|seguranca do paciente/.test(blob)) {
    return 'Segurança do paciente — conceito';
  }
  return 'Segurança do paciente — conceito geral';
}

function refinePedagogicalCluster(
  instruction: string,
  options: QuestionOption[],
  family: FamilyId,
  builderTopic: string,
  slug: string,
): string {
  const drift = detectTaxonomyDrift(slug, instruction);
  if (drift) return drift;

  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();

  if (family === 'vf') {
    if (/metas internacionais|identificar corretamente|higienizar as mãos|higienizar as maos/.test(blob)) {
      return 'V/F — metas e identificação';
    }
    return 'V/F — assertivas I/II/III';
  }
  if (family === 'certo_errado') return 'Certo ou errado';

  if (/incorreta|incorreto|exceto|não se aplica|nao se aplica/.test(blob)) {
    return 'INCORRETA / EXCETO';
  }
  if (/analise as afirmativas|assinale a alternativa correta.*\nI\.|I -|I\./.test(blob) && /II|III/.test(blob)) {
    if (/metas internacionais|identificar|medicamento|queda/.test(blob)) {
      return 'V/F — metas e identificação';
    }
    return 'Múltipla — assertivas I/II/III';
  }

  if (builderTopic === 'Identificação do paciente') return 'Identificação do paciente';
  if (builderTopic === 'Metas internacionais JCI/OMS') return 'Metas internacionais JCI/OMS';
  if (builderTopic === 'Prevenção de quedas') return 'Prevenção de quedas';
  if (builderTopic === 'Eventos adversos e incidentes') return 'Eventos adversos e incidentes';
  if (builderTopic === 'Segurança na medicação') return 'Segurança na medicação';
  if (builderTopic === 'Higienização das mãos') return 'Higienização das mãos';
  if (builderTopic === 'Cirurgia segura') return 'Cirurgia segura (meta OMS)';
  if (builderTopic === 'Comunicação na assistência') return 'Comunicação na assistência';
  if (builderTopic === 'Lesão por pressão') return 'Lesão por pressão';
  if (builderTopic === 'Cultura de segurança') return 'Cultura de segurança';

  return builderTopic;
}

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
    if (g.severity === 'error' || g.code === 'slide_topic_drift') issues.push(g.code);
  }
  return [...new Set(issues)];
}

async function main() {
  const lote = parseArg('lote') ?? 'seguranca-do-paciente-completo';
  const questionsDir = resolve(process.cwd(), `data/catalog-migration/${lote}/questions`);
  const files = readdirSync(questionsDir).filter((f) => f.endsWith('.json'));

  const rows: Row[] = [];
  const clusterMap = new Map<
    string,
    { count: number; contract_fail: number; artifacts: number; slugs: string[]; builderTopics: Record<string, number> }
  >();

  for (const file of files.sort()) {
    const slug = file.replace(/\.json$/, '');
    const cj = JSON.parse(readFileSync(resolve(questionsDir, file), 'utf8')) as Record<string, unknown>;
    const meta = (cj.meta ?? {}) as { banca?: string; subtopico?: string };
    const qd = (cj.question_data ?? {}) as { instruction?: string; options?: QuestionOption[] };
    const instruction = String(qd.instruction ?? '');
    const options = Array.isArray(qd.options) ? qd.options : [];
    const family = classifyFamily(instruction, String(meta.subtopico ?? SUBTOPICO), options, '');
    const builderTopic = inferBuilderTopic(instruction, options);
    const cluster = refinePedagogicalCluster(instruction, options, family, builderTopic, slug);
    const gateCodes = premiumGateErrors(cj as Parameters<typeof premiumGateErrors>[0]).map((g) => g.code);
    const contractIssues = slideContractIssueCodes(cj);
    const hasArtifacts = hasInstructionArtifacts(instruction);

    rows.push({
      modulo_slug: slug,
      banca: meta.banca ?? null,
      family,
      builder_topic: builderTopic,
      pedagogical_cluster: cluster,
      has_instruction_artifacts: hasArtifacts,
      slide_contract_issues: contractIssues,
      premium_status: resolvePremiumStatus(cj, gateCodes),
      instruction_preview: instruction.slice(0, 120).replace(/\s+/g, ' '),
    });

    const acc = clusterMap.get(cluster) ?? { count: 0, contract_fail: 0, artifacts: 0, slugs: [], builderTopics: {} };
    acc.count += 1;
    if (contractIssues.length) acc.contract_fail += 1;
    if (hasArtifacts) acc.artifacts += 1;
    acc.slugs.push(slug);
    acc.builderTopics[builderTopic] = (acc.builderTopics[builderTopic] ?? 0) + 1;
    clusterMap.set(cluster, acc);
  }

  const total = rows.length;
  const driftTotal = rows.filter((r) => r.pedagogical_cluster.startsWith('DRIFT')).length;
  const threshold = Math.max(5, Math.ceil(total * 0.1));

  const clusterSummaries = [...clusterMap.entries()]
    .map(([cluster, stats]) => {
      const pct = Math.round((stats.count / total) * 1000) / 10;
      const hasGolden = COVERED_CLUSTERS.has(cluster);
      const isDrift = cluster.startsWith('DRIFT');
      let decision: string;
      if (isDrift) decision = 'reclassificar';
      else if (hasGolden) decision = 'coberto';
      else if (stats.count >= threshold) decision = 'novo_ramo';
      else if (stats.count >= 3) decision = 'absorver';
      else decision = 'cauda_longa';

      return {
        cluster,
        count: stats.count,
        pct,
        slide_contract_failures: stats.contract_fail,
        instruction_artifacts: stats.artifacts,
        has_golden: hasGolden,
        golden_file: GOLDEN_BY_CLUSTER[cluster] ?? null,
        sample_slugs: stats.slugs.slice(0, 5),
        decision,
        branch_id_proposed: isDrift
          ? null
          : (BRANCH_BY_CLUSTER[cluster] ??
            cluster
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/^_|_$/g, '')),
      };
    })
    .sort((a, b) => b.count - a.count);

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: SUBTOPICO,
    lote,
    total,
    drift_total: driftTotal,
    drift_pct: Math.round((driftTotal / total) * 1000) / 10,
    goldens_needed: clusterSummaries.filter((c) => c.decision === 'novo_ramo' && !c.has_golden).length,
    existing_goldens_examples: Object.values(GOLDEN_BY_CLUSTER),
    family_counts: rows.reduce(
      (acc, r) => {
        acc[r.family] = (acc[r.family] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    premium_status_counts: rows.reduce(
      (acc, r) => {
        acc[r.premium_status] = (acc[r.premium_status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    stub_total: rows.filter((r) => r.premium_status === 'stub').length,
    contract_fail_total: rows.filter((r) => r.slide_contract_issues.length > 0).length,
    cluster_decisions: clusterSummaries,
    rows,
  };

  const outDir = resolve(process.cwd(), 'artifacts');
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'seguranca-do-paciente-topic-cluster-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(
    `[cluster:seguranca-do-paciente] total=${total} drift=${driftTotal} stub=${report.stub_total} contract_fail=${report.contract_fail_total}`,
  );
  console.log(`[cluster:seguranca-do-paciente] report=${outPath}`);
  for (const c of clusterSummaries.slice(0, 15)) {
    console.log(`  ${c.decision.padEnd(14)} ${String(c.count).padStart(2)} (${c.pct}%) — ${c.cluster}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
