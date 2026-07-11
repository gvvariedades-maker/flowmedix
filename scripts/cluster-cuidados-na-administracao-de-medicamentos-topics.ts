#!/usr/bin/env tsx
/**
 * Clusteriza questões de Cuidados na Administração de Medicamentos por família × tema pedagógico.
 * Uso: npm run cluster:cuidados-na-administracao-de-medicamentos
 */
import { loadEnvConfig } from '@next/env';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { classifyFamily, type FamilyId, type QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import {
  detectDuplicateDangerJustifications,
  detectSlideTopicDrift,
  hasInstructionArtifacts,
} from '@/lib/catalogMigration/slideContract';
import { hasPremiumStubMarkers } from '@/lib/catalogMigration/upgradePremiumHybrid';
import { premiumGateErrors } from '@/lib/catalogMigration/premiumGate';
import { parseArg } from '@/lib/catalogMigration/cliArgs';
import { inferPedagogicalBranch } from '@/lib/slides/pedagogicalBranch';

const SUBTOPICO = 'Cuidados na Administração de Medicamentos';

const GOLDEN_BY_CLUSTER: Record<string, string> = {
  'V/F — 9 certos em caso clínico': 'questao-premium-fepese-cuidados-administracao-medicamentos.json',
  'Nove certos — listagem': 'questao-premium-fepese-cuidados-administracao-medicamentos.json',
  'Alto risco / conferência dupla': 'questao-premium-fepese-cuidados-insulina-alto-risco.json',
  'Default — sem âncora temática': 'questao-premium-avancasp-cuidados-exceto-preparo-medicamentos.json',
  'INCORRETA / EXCETO': 'questao-premium-avancasp-cuidados-exceto-preparo-medicamentos.json',
  'Documentação / registro': 'questao-premium-avancasp-cuidados-exceto-preparo-medicamentos.json',
};

const COVERED_CLUSTERS = new Set(Object.keys(GOLDEN_BY_CLUSTER));

const BRANCH_BY_CLUSTER: Record<string, string> = {
  'Nove certos — listagem': 'cam_certos_lista',
  'V/F — 9 certos em caso clínico': 'cam_certos_vf_caso',
  'V/F — protocolo MS / I–VI': 'cam_vf_protocolo',
  'INCORRETA / EXCETO': 'cam_generico',
  'Documentação / registro': 'cam_generico',
  'Prescrição ilegível / dúvida': 'cam_prescricao_duvida',
  'LASA / nomes semelhantes': 'cam_lasa_erro',
  'Alto risco / conferência dupla': 'cam_alto_risco',
  'Preparo / sala de medicação': 'cam_preparo_asepsia',
  'Vigilância / reações adversas': 'cam_vigilancia_reacao',
  'Orientação ao paciente': 'cam_orientacao_paciente',
  'Certo ou errado': 'cam_generico',
  'Default — sem âncora temática': 'cam_generico',
};

function detectTaxonomyDrift(slug: string, instruction: string): string | null {
  const blob = instruction.toLowerCase();

  if (
    slug.includes('processo-de-enfermagem') &&
    !/nove certos|cinco certos|seis certos|administração de medicamento|administracao de medicamento|prescrição|prescricao|medicamento/.test(
      blob,
    )
  ) {
    return 'DRIFT — processo de enfermagem';
  }
  if (
    slug.includes('vias-de-administracao') ||
    (/via oral|via intramuscular|via subcutânea|via subcutanea|punção|puncao|ângulo de injeção|angulo de injecao/.test(
      blob,
    ) &&
      !/nove certos|cinco certos|seis certos|prescrição ilegível|prescricao ilegivel/.test(blob))
  ) {
    return 'DRIFT — vias de administração';
  }
  if (
    slug.includes('calculo-de-administracao') ||
    (/gotas\/min|gts\/min|regra de três|regra de tres|diluição|diluicao|ml\/h|microgotas/.test(blob) &&
      !/nove certos|cinco certos/.test(blob))
  ) {
    return 'DRIFT — cálculo de medicamentos';
  }
  if (
    slug.includes('seguranca-do-paciente') &&
    /metas internacionais|meta internacional|jci|joint commission|queda|evento adverso/.test(blob) &&
    !/medicamento|prescrição|prescricao|nove certos|cinco certos/.test(blob)
  ) {
    return 'DRIFT — segurança do paciente (metas/queda)';
  }
  if (/metas internacionais|meta internacional|jci|joint commission/.test(blob) && !/medicamento|prescrição|prescricao/.test(blob)) {
    return 'DRIFT — metas JCI (→ Segurança do Paciente)';
  }
  return null;
}

function inferBuilderTopic(instruction: string, options: QuestionOption[]): string {
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();

  if (/nove certos|cinco certos|seis certos|os certos na administração|os certos na administracao/.test(blob)) {
    return 'Nove certos';
  }
  if (/dois identificador|identificar o paciente|identificação do paciente|identificacao do paciente/.test(blob)) {
    return 'Identificação do paciente';
  }
  if (/alto risco|conferência dupla|conferencia dupla|insulina|heparina|quimioterápico|quimioterapico/.test(blob)) {
    return 'Alto risco';
  }
  if (/ilegível|ilegivel|dose duvidosa|dúvida|duvida|divergência|divergencia|prescrição verbal|prescricao verbal/.test(blob)) {
    return 'Prescrição ilegível / dúvida';
  }
  if (/registro|prontuário|prontuario|anotação|anotacao|documentação|documentacao/.test(blob)) {
    return 'Documentação';
  }
  if (/semelhante|parecido|lasa|look-alike|sound-alike|embalagem/.test(blob)) {
    return 'LASA';
  }
  if (/reação adversa|reacao adversa|efeito adverso|alergia|anafilaxia|vigilância|vigilancia|monitorar/.test(blob)) {
    return 'Vigilância / reações';
  }
  if (/orientar o paciente|orientação|orientacao|efeitos colaterais|interação medicamentosa|interacao medicamentosa/.test(blob)) {
    return 'Orientação ao paciente';
  }
  if (/preparo|reconstituição|reconstituicao|sala de medicação|sala de medicacao|assepsia|antissepsia/.test(blob)) {
    return 'Preparo / sala';
  }
  if (/portaria|protocolo ms|anvisa|boas práticas/.test(blob)) {
    return 'Protocolo MS/ANVISA';
  }
  if (/horário|horario|jejum|hora certa|aprazamento/.test(blob)) {
    return 'Horário / aprazamento';
  }
  return 'Administração segura — conceito geral';
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

  if (family === 'certo_errado') return 'Certo ou errado';

  if (/\bexceto\b|\bincorreta\b|\bincorreto\b/.test(blob)) {
    return 'INCORRETA / EXCETO';
  }

  const hasNumberedAssertions =
    /\b(i|ii|iii|iv|v|vi)\s*[-–—.]/i.test(instruction) ||
    (/analise as afirmativas|assinale a alternativa correta/i.test(blob) && /II|III/.test(instruction));

  if (family === 'vf' || hasNumberedAssertions) {
    if (/portaria|protocolo|anvisa|boas práticas|boas praticas|i\s*[-–—.]\s*.+ii\s*[-–—.]/i.test(blob)) {
      return 'V/F — protocolo MS / I–VI';
    }
    if (/nove certos|cinco certos|seis certos|identificação|identificacao|alto risco|prescrição|prescricao/.test(blob)) {
      return 'V/F — 9 certos em caso clínico';
    }
    return 'V/F — 9 certos em caso clínico';
  }

  if (builderTopic === 'Nove certos') {
    if (/quais são|quais sao|enumere|assinale.*certos|lista.*certos/.test(blob)) {
      return 'Nove certos — listagem';
    }
    return 'V/F — 9 certos em caso clínico';
  }
  if (builderTopic === 'Prescrição ilegível / dúvida') return 'Prescrição ilegível / dúvida';
  if (builderTopic === 'Documentação') return 'Documentação / registro';
  if (builderTopic === 'LASA') return 'LASA / nomes semelhantes';
  if (builderTopic === 'Alto risco') return 'Alto risco / conferência dupla';
  if (builderTopic === 'Preparo / sala') return 'Preparo / sala de medicação';
  if (builderTopic === 'Vigilância / reações') return 'Vigilância / reações adversas';
  if (builderTopic === 'Orientação ao paciente') return 'Orientação ao paciente';
  if (builderTopic === 'Horário / aprazamento') return 'Horário / aprazamento';
  if (builderTopic === 'Protocolo MS/ANVISA') return 'V/F — protocolo MS / I–VI';

  if (builderTopic === 'Identificação do paciente') return 'V/F — 9 certos em caso clínico';

  return 'Default — sem âncora temática';
}

type Row = {
  modulo_slug: string;
  banca: string | null;
  family: FamilyId;
  builder_topic: string;
  pedagogical_cluster: string;
  pedagogical_branch_proposed: string;
  pedagogical_branch_inferred: string;
  has_instruction_artifacts: boolean;
  slide_topic_drift: boolean;
  slide_contract_issues: string[];
  premium_status: 'golden' | 'hybrid_ok' | 'stub' | 'legacy';
  meta_pedagogical_branch: string | null;
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
  const lote = parseArg('lote') ?? 'cuidados-na-administracao-de-medicamentos-completo';
  const questionsDir = resolve(process.cwd(), `data/catalog-migration/${lote}/questions`);
  const files = readdirSync(questionsDir).filter((f) => f.endsWith('.json'));

  const rows: Row[] = [];
  const clusterMap = new Map<
    string,
    {
      count: number;
      drift: number;
      contract_fail: number;
      artifacts: number;
      slugs: string[];
      builderTopics: Record<string, number>;
    }
  >();

  for (const file of files.sort()) {
    const slug = file.replace(/\.json$/, '');
    const cj = JSON.parse(readFileSync(resolve(questionsDir, file), 'utf8')) as Record<string, unknown>;
    const meta = (cj.meta ?? {}) as { banca?: string; subtopico?: string; pedagogical_branch?: string };
    if (meta.subtopico !== SUBTOPICO) continue;

    const qd = (cj.question_data ?? {}) as { instruction?: string; options?: QuestionOption[] };
    const instruction = String(qd.instruction ?? '');
    const options = Array.isArray(qd.options) ? qd.options : [];
    const family = classifyFamily(instruction, SUBTOPICO, options, '');
    const builderTopic = inferBuilderTopic(instruction, options);
    const cluster = refinePedagogicalCluster(instruction, options, family, builderTopic, slug);
    const gateCodes = premiumGateErrors(cj as Parameters<typeof premiumGateErrors>[0]).map((g) => g.code);
    const contractIssues = slideContractIssueCodes(cj);
    const slides = cj.reverse_study_slides ?? cj.study_slides;
    const slideDrift = detectSlideTopicDrift(instruction, slides);
    const hasArtifacts = hasInstructionArtifacts(instruction);
    const inferredBranch = inferPedagogicalBranch(
      SUBTOPICO,
      instruction,
      Array.isArray(slides) ? (slides as Parameters<typeof inferPedagogicalBranch>[2]) : [],
      family,
    );

    rows.push({
      modulo_slug: slug,
      banca: meta.banca ?? null,
      family,
      builder_topic: builderTopic,
      pedagogical_cluster: cluster,
      pedagogical_branch_proposed: BRANCH_BY_CLUSTER[cluster] ?? 'cam_generico',
      pedagogical_branch_inferred: inferredBranch,
      has_instruction_artifacts: hasArtifacts,
      slide_topic_drift: slideDrift,
      slide_contract_issues: contractIssues,
      premium_status: resolvePremiumStatus(cj, gateCodes),
      meta_pedagogical_branch: meta.pedagogical_branch ?? null,
      instruction_preview: instruction.slice(0, 120).replace(/\s+/g, ' '),
    });

    const acc = clusterMap.get(cluster) ?? {
      count: 0,
      drift: 0,
      contract_fail: 0,
      artifacts: 0,
      slugs: [],
      builderTopics: {},
    };
    acc.count += 1;
    if (slideDrift) acc.drift += 1;
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
        slide_topic_drift: stats.drift,
        slide_contract_failures: stats.contract_fail,
        instruction_artifacts: stats.artifacts,
        has_golden: hasGolden,
        golden_file: GOLDEN_BY_CLUSTER[cluster] ?? null,
        pedagogical_branch_proposed: BRANCH_BY_CLUSTER[cluster] ?? 'cam_generico',
        sample_slugs: stats.slugs.slice(0, 5),
        decision,
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
    strong_branch_threshold: threshold,
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
    branch_inferred_counts: rows.reduce(
      (acc, r) => {
        acc[r.pedagogical_branch_inferred] = (acc[r.pedagogical_branch_inferred] ?? 0) + 1;
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
  const outPath = resolve(outDir, 'cuidados-na-administracao-de-medicamentos-topic-cluster-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(
    `[cluster:cuidados-na-administracao-de-medicamentos] total=${total} drift=${driftTotal} stub=${report.stub_total} contract_fail=${report.contract_fail_total} threshold=${threshold}`,
  );
  console.log(`[cluster:cuidados-na-administracao-de-medicamentos] report=${outPath}`);
  for (const c of clusterSummaries.slice(0, 15)) {
    console.log(`  ${c.decision.padEnd(14)} ${String(c.count).padStart(2)} (${c.pct}%) — ${c.cluster}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
