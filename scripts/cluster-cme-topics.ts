#!/usr/bin/env tsx
/**
 * Clusteriza questões de CME por família × tema pedagógico.
 * Uso: npm run cluster:cme
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

const SUBTOPICO = 'Enfermagem em Central de Material e Esterilização (CME)';

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'V/F — áreas, fluxo e validade': 'questao-premium-idecan-cme-areas-esterilizacao-vf.json',
  'V/F — assertivas I/II/III/IV': 'questao-premium-idecan-cme-areas-esterilizacao-vf.json',
  'Preparo e limpeza de instrumentais': 'questao-premium-idecan-cme-preparo-presecagem.json',
  'Autoclave e métodos de esterilização': 'questao-premium-iacp-cme-autoclave-parametros.json',
  'Processamento e esterilização — conceito': 'questao-premium-avancasp-cme-manuseio-esteril.json',
  'Certo ou errado': 'questao-premium-idecan-cme-rt-funcao-certo.json',
  'INCORRETA / EXCETO': 'questao-premium-ameosc-cme-metodos-incorreta.json',
  'Indicadores químicos e biológicos': 'questao-premium-idecan-cme-indicador-quimico-classe1.json',
  'CME — conceito geral': 'questao-premium-idib-cme-funcao-iaas.json',
};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

function inferBuilderTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();

  if (/área suja|area suja|área limpa|area limpa|área estéril|area esteril|fluxo unidirecional/.test(blob)) {
    return 'Áreas e fluxo físico';
  }
  if (/indicador químico|indicador quimico|classe [1-6]|indicador biológico|indicador biologico/.test(blob)) {
    return 'Indicadores de esterilização';
  }
  if (/autoclave|vapor saturado|plasma|peróxido|peroxido|óxido de etileno|oxido de etileno|baixa temperatura/.test(blob)) {
    return 'Métodos e equipamentos de esterilização';
  }
  if (/limpeza ultrassônica|limpeza ultrassonica|preparo|acondicionamento|embalagem|secagem|desinfecção|desinfeccao/.test(blob)) {
    return 'Preparo, limpeza e embalagem';
  }
  if (/artigo crítico|artigo critico|semi-crítico|semi-critico|não crítico|nao critico|classificação.*artigo|classificacao.*artigo/.test(blob)) {
    return 'Classificação de artigos';
  }
  if (/infraestrutura|classe ii|classe 2|layout|disposição|disposicao/.test(blob)) {
    return 'Infraestrutura da CME';
  }
  if (/validade|armazenamento|prazo|embalagem íntegra|embalagem integra/.test(blob)) {
    return 'Validade e armazenamento';
  }
  if (/enfermeiro.*responsável|enfermeiro.*responsavel|coordenação|coordenacao|supervisão|supervisao/.test(blob)) {
    return 'Atribuição e gestão da CME';
  }
  if (/esterilização|esterilizacao|processamento de artigo|processamento de produto/.test(blob)) {
    return 'Processamento e esterilização — conceito';
  }
  return 'CME — conceito geral';
}

function refinePedagogicalCluster(
  instruction: string,
  options: QuestionOption[],
  family: FamilyId,
  builderTopic: string,
): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();

  if (family === 'vf') {
    if (/área suja|area suja|validade|armazenamento|fluxo/.test(blob)) {
      return 'V/F — áreas, fluxo e validade';
    }
    return 'V/F — sequência assertivas';
  }
  if (family === 'certo_errado') return 'Certo ou errado';

  if (/analise as afirmativas|assinale a alternativa correta.*\nI\.|I -|I\./.test(blob) && /II|III|IV/.test(blob)) {
    if (/área suja|area suja|validade|indicador químico|indicador quimico|fluxo/.test(blob)) {
      return 'V/F — assertivas I/II/III/IV';
    }
    return 'Múltipla — assertivas I/II/III';
  }
  if (/incorreta|incorreto|exceto|não se aplica|nao se aplica/.test(blob)) {
    if (/área|fluxo|validade|indicador/.test(blob)) {
      return 'V/F — áreas, fluxo e validade';
    }
    return 'INCORRETA / EXCETO';
  }

  if (builderTopic === 'Indicadores de esterilização') return 'Indicadores químicos e biológicos';
  if (builderTopic === 'Métodos e equipamentos de esterilização') return 'Autoclave e métodos de esterilização';
  if (builderTopic === 'Preparo, limpeza e embalagem') return 'Preparo e limpeza de instrumentais';
  if (builderTopic === 'Classificação de artigos') return 'Classificação crítico / semi / não crítico';
  if (builderTopic === 'Infraestrutura da CME') return 'Infraestrutura e layout da CME';
  if (builderTopic === 'Validade e armazenamento') return 'Validade do material estéril';
  if (builderTopic === 'Áreas e fluxo físico') return 'Áreas suja / limpa / estéril';
  if (builderTopic === 'Atribuição e gestão da CME') return 'Papel do enfermeiro na CME';

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
  const lote = parseArg('lote') ?? 'cme-completo';
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

    const acc = clusterMap.get(cluster) ?? {
      count: 0,
      contract_fail: 0,
      artifacts: 0,
      slugs: [],
      builderTopics: {},
    };
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
        decision: hasGolden
          ? 'coberto'
          : stats.count >= Math.ceil(total * 0.1)
            ? 'novo_ramo'
            : stats.count >= 3
              ? 'absorver'
              : 'cauda_longa',
      };
    })
    .sort((a, b) => b.count - a.count);

  const report = {
    generated_at: new Date().toISOString(),
    subtopico: SUBTOPICO,
    lote,
    total,
    trilho: 'A — handcraft total (≤70 slugs)',
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
  const outPath = resolve(outDir, 'cme-topic-cluster-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[cluster:cme] total=${total} stub=${report.stub_total} contract_fail=${report.contract_fail_total}`);
  console.log(`[cluster:cme] report=${outPath}`);
  for (const c of clusterSummaries.slice(0, 12)) {
    console.log(`  ${c.decision.padEnd(12)} ${String(c.count).padStart(2)} (${c.pct}%) — ${c.cluster}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
