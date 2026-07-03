#!/usr/bin/env tsx
/**
 * Clusteriza questões de Assistência Perioperatória por família × tema pedagógico.
 * Uso: npm run cluster:perioperatoria
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

const SUBTOPICO = 'Assistência Perioperatória (Inclui SRPA)';

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'SRPA / Aldrete e alta': 'questao-premium-idecan-perioperatoria-aldrete-srpa.json',
  'SRPA / monitorização e alta': 'questao-premium-idecan-perioperatoria-aldrete-srpa.json',
  'SRPA / atribuição do técnico': 'questao-premium-consulplan-perioperatoria-srpa-monitorizacao.json',
  'SRPA / CPD e atribuição (C/E)': 'questao-premium-idecan-srpa-curativo-cpd-ce.json',
  'Pré-operatório / preparo': 'questao-premium-avancasp-perioperatoria-pre-operatorio.json',
  'Pós-operatório / cuidados': 'questao-premium-fundatec-perioperatoria-anestesia-regional-exceto.json',
  'Protocolo / sequência': 'questao-premium-cogeps-perioperatoria-cirurgia-segura-cdc.json',
  'ISC / classificação e prevenção': 'questao-premium-furb-perioperatoria-isc-classificacao.json',
  'Cirurgia segura / classificação ferida CDC': 'questao-premium-cogeps-perioperatoria-cirurgia-segura-cdc.json',
};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

function inferBuilderTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();

  if (/anestesia regional|bloqueio raqui|bloqueio peridural|raquianestesia|peridural|bloqueio simpático|bloqueio simpatico/.test(blob)) {
    return 'Pós-operatório';
  }
  if (/\bsrpa\b|recuperação pós-anestésica|recuperacao pos-anestesica|pós-anestésica|pos-anestesica/.test(blob)) {
    if (/aldrete|kroulik|escala.*alta/.test(blob)) return 'SRPA / Aldrete';
    if (/cateter peridural|cpd|curativo/.test(blob)) return 'SRPA / CPD';
    return 'SRPA / monitorização';
  }
  if (/\bpré-operatório|pre-operatorio|pré operatório|pre operatorio|preparo.*cirúrg|preparo.*cirurg|tricotomia|jejum/.test(blob)) {
    return 'Pré-operatório';
  }
  if (/\bpós-operatório|pos-operatorio|pós operatório|pos operatorio|pós-operat|pos-operat/.test(blob)) {
    return 'Pós-operatório';
  }
  if (/\binfecção.*sítio|infeccao.*sitio|\bisc\b|deiscência|deiscencia|anvisa.*cirúrg|anvisa.*cirurg/.test(blob)) {
    return 'ISC / infecção sítio cirúrgico';
  }
  if (/cirurgia segura|checklist|time out|timeout|oms.*cirurg|cdc.*ferida|classificação.*ferida|classificacao.*ferida/.test(blob)) {
    return 'Cirurgia segura / CDC';
  }
  if (/centro cirúrgico|centro cirurgico|campo estéril|campo esteril|asséptic|asseptic|instrumentador|circulante/.test(blob)) {
    return 'Centro cirúrgico';
  }
  if (/perioperat|pré.?trans.?pós|pre.?trans.?pos|fase.*cirúrg|fase.*cirurg/.test(blob)) {
    return 'Fases perioperatórias';
  }
  return 'Perioperatório — conceito geral';
}

function refinePedagogicalCluster(
  instruction: string,
  options: QuestionOption[],
  family: FamilyId,
  builderTopic: string,
): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();

  if (family === 'vf') return 'V/F — assertivas I/II/III';
  if (family === 'certo_errado') {
    if (/\bsrpa\b|cateter peridural|cpd/.test(blob)) return 'SRPA / CPD e atribuição (C/E)';
    return 'Certo ou errado';
  }
  if (family === 'protocolo') return 'Protocolo / sequência';

  if (/\baldrete|kroulik/.test(blob)) return 'SRPA / Aldrete e alta';
  if (/\bsrpa\b/.test(blob) && /cateter peridural|cpd|curativo/.test(blob)) {
    return 'SRPA / CPD e atribuição (C/E)';
  }
  if (/\bsrpa\b/.test(blob) && /técnico|tecnico|monitor|sinais vitais|dor|consciência|consciencia/.test(blob)) {
    return 'SRPA / atribuição do técnico';
  }
  if (/\bsrpa\b/.test(blob)) return 'SRPA / monitorização e alta';

  if (/\bpré-operatório|pre-operatorio|tricotomia|jejum|preparo/.test(blob)) {
    return 'Pré-operatório / preparo';
  }
  if (/\bexceto\b|\bincorreta\b/.test(blob) && /perioperat|srpa|anestesia|bloqueio|cirúrg|cirurg/.test(blob)) {
    return 'Pós-operatório / cuidados';
  }
  if (/anestesia regional|bloqueio raqui|bloqueio peridural|raquianestesia|peridural/.test(blob)) {
    return 'Pós-operatório / cuidados';
  }
  if (/\bpós-operatório|pos-operatorio|pós-operat|pos-operat/.test(blob)) {
    return 'Pós-operatório / cuidados';
  }
  if (/\binfecção.*sítio|infeccao.*sitio|\bisc\b|deiscência|deiscencia/.test(blob)) {
    return 'ISC / classificação e prevenção';
  }
  if (/cirurgia segura|cdc|classificação.*ferida|classificacao.*ferida|limpa-contaminada|ferida suja/.test(blob)) {
    return 'Cirurgia segura / classificação ferida CDC';
  }
  if (/centro cirúrgico|centro cirurgico|campo estéril|asséptic/.test(blob)) {
    return 'Centro cirúrgico / asséptica';
  }

  if (builderTopic !== 'Perioperatório — conceito geral') return builderTopic;
  return 'Default — sem âncora temática';
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
  const lote = parseArg('lote') ?? 'perioperatoria-completo';
  const questionsDir = resolve(process.cwd(), `data/catalog-migration/${lote}/questions`);
  const files = readdirSync(questionsDir).filter((f) => f.endsWith('.json'));

  const rows: Row[] = [];
  const clusterMap = new Map<string, { count: number; contract_fail: number; artifacts: number; slugs: string[]; builderTopics: Record<string, number> }>();

  for (const file of files.sort()) {
    const slug = file.replace(/\.json$/, '');
    const cj = JSON.parse(readFileSync(resolve(questionsDir, file), 'utf8')) as Record<string, unknown>;
    const meta = (cj.meta ?? {}) as { banca?: string; subtopico?: string };
    const qd = (cj.question_data ?? {}) as { instruction?: string; options?: QuestionOption[] };
    const instruction = String(qd.instruction ?? '');
    const options = Array.isArray(qd.options) ? qd.options : [];
    const family = classifyFamily(instruction, String(meta.subtopico ?? SUBTOPICO), options, '');
    const builderTopic = inferBuilderTopic(instruction, options);
    const cluster = refinePedagogicalCluster(instruction, options, family, builderTopic);
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
  const clusterSummaries = [...clusterMap.entries()]
    .map(([cluster, stats]) => {
      const pct = Math.round((stats.count / total) * 1000) / 10;
      const hasGolden = COVERED_CLUSTERS.has(cluster);
      return {
        cluster,
        count: stats.count,
        pct,
        slide_contract_failures: stats.contract_fail,
        instruction_artifacts: stats.artifacts,
        has_golden: hasGolden,
        golden_file: GOLDEN_BY_CLUSTER[cluster] ?? null,
        sample_slugs: stats.slugs.slice(0, 5),
        decision: hasGolden ? 'coberto' : stats.count >= Math.ceil(total * 0.1) ? 'novo_ramo' : stats.count >= 3 ? 'absorver' : 'cauda_longa',
      };
    })
    .sort((a, b) => b.count - a.count);

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: SUBTOPICO,
    lote,
    total,
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
  const outPath = resolve(outDir, 'perioperatoria-topic-cluster-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[cluster:perioperatoria] total=${total} stub=${report.stub_total} contract_fail=${report.contract_fail_total}`);
  console.log(`[cluster:perioperatoria] report=${outPath}`);
  for (const c of clusterSummaries.slice(0, 12)) {
    console.log(`  ${c.decision.padEnd(12)} ${String(c.count).padStart(2)} (${c.pct}%) — ${c.cluster}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
