/**
 * Gate de golden âncoras de estilo antes do 1º lote (g01).
 * Agente na frente: cria examples/; este módulo só verifica / bloqueia.
 * @see docs/skills/avant-golden-anchor-bootstrap/SKILL.md
 * @see docs/GOLDEN_HANDCRAFT_MODEL.md § Fase 1 — Golden âncora
 */
import { existsSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import type { ClusterDecision } from '@/lib/catalogMigration/clusterReportContract';
import type { HandcraftPlaybook, HandcraftRegistryPackage } from '@/lib/catalogMigration/handcraftPlaybook';

export type GoldenAnchorGateStatus = 'pass' | 'warn' | 'block';

export type ClusterDecisionRow = {
  cluster: string;
  count: number;
  pct?: number;
  decision: ClusterDecision | string;
  has_golden?: boolean;
  golden_file?: string | null;
  pedagogical_branch_proposed?: string | null;
  sample_slugs?: string[];
};

export type ClusterReportLike = {
  total?: number;
  goldens_needed?: number | string[];
  goldens_needed_count?: number;
  cluster_decisions?: ClusterDecisionRow[];
  existing_goldens_examples?: string[];
};

export type MissingGoldenAnchor = {
  cluster: string;
  decision: string;
  count: number;
  branch_id: string | null;
  sample_slug: string | null;
  suggested_file: string;
  reason: string;
};

export type CoveredGoldenAnchor = {
  cluster: string;
  golden_file: string;
  path: string;
  content_standard_ok: boolean | null;
  issues: string[];
};

export type GoldenAnchorGateReport = {
  subtopico: string;
  pacote_prefix: string;
  gate: GoldenAnchorGateStatus;
  handcraft_allowed: boolean;
  cluster_report: string | null;
  goldens_needed: number;
  missing: MissingGoldenAnchor[];
  covered: CoveredGoldenAnchor[];
  warnings: string[];
  reasons: string[];
  artifact: string;
};

export function goldenAnchorGateArtifactPath(pacotePrefix: string): string {
  return `artifacts/golden-anchor-gate-${pacotePrefix}.json`;
}

export function resolveExamplesPath(goldenFile: string | null | undefined): string | null {
  if (!goldenFile?.trim()) return null;
  const raw = goldenFile.trim().replace(/\\/g, '/');
  if (raw.startsWith('examples/')) {
    return resolve(process.cwd(), raw);
  }
  if (raw.includes('/')) {
    return resolve(process.cwd(), raw);
  }
  return resolve(process.cwd(), 'examples', raw);
}

export function suggestedAnchorFile(args: {
  pacotePrefix: string;
  branchId: string | null;
  cluster: string;
  sampleSlug: string | null;
}): string {
  const branch =
    args.branchId?.trim() ||
    args.cluster
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) ||
    'ramo';
  const bancaHint = args.sampleSlug?.split('-')[0] ?? 'banca';
  return `examples/questao-premium-${bancaHint}-${args.pacotePrefix}-${branch}.json`;
}

function readContentStandard(path: string): { ok: boolean | null; issues: string[] } {
  const issues: string[] = [];
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as {
      meta?: { content_standard?: string; subtopico?: string };
      reverse_study_slides?: unknown[];
      study_slides?: unknown[];
    };
    const std = raw.meta?.content_standard;
    if (std !== 'golden-v1') {
      issues.push(`content_standard=${std ?? '(ausente)'} (esperado golden-v1)`);
    }
    const slides = raw.reverse_study_slides ?? raw.study_slides;
    if (!Array.isArray(slides) || slides.length !== 4) {
      issues.push(`slides=${Array.isArray(slides) ? slides.length : 0} (esperado 4)`);
    }
    return { ok: issues.length === 0, issues };
  } catch (err) {
    issues.push(err instanceof Error ? err.message : 'JSON inválido');
    return { ok: false, issues };
  }
}

export function loadClusterReport(pathRel: string | null | undefined): ClusterReportLike | null {
  if (!pathRel?.trim()) return null;
  const full = resolve(process.cwd(), pathRel);
  if (!existsSync(full)) return null;
  return JSON.parse(readFileSync(full, 'utf8')) as ClusterReportLike;
}

/**
 * Avalia se ramos fortes têm golden âncora em examples/ antes do g01.
 */
export function evaluateGoldenAnchorGate(input: {
  subtopico: string;
  pacotePrefix: string;
  clusterReportPath?: string | null;
  clusterReport?: ClusterReportLike | null;
  playbook?: HandcraftPlaybook | null;
  /** Emergência — não usar em produção rotineira */
  skip?: boolean;
}): GoldenAnchorGateReport {
  const artifact = goldenAnchorGateArtifactPath(input.pacotePrefix);
  const reasons: string[] = [];
  const warnings: string[] = [];
  const missing: MissingGoldenAnchor[] = [];
  const covered: CoveredGoldenAnchor[] = [];

  if (input.skip) {
    return {
      subtopico: input.subtopico,
      pacote_prefix: input.pacotePrefix,
      gate: 'warn',
      handcraft_allowed: true,
      cluster_report: input.clusterReportPath ?? null,
      goldens_needed: 0,
      missing: [],
      covered: [],
      warnings: ['--skip-golden-anchor-gate (emergência)'],
      reasons: ['Bypass explícito de golden-anchor-gate.'],
      artifact,
    };
  }

  const report =
    input.clusterReport ?? loadClusterReport(input.clusterReportPath ?? null);

  if (!report) {
    return {
      subtopico: input.subtopico,
      pacote_prefix: input.pacotePrefix,
      gate: 'warn',
      handcraft_allowed: true,
      cluster_report: input.clusterReportPath ?? null,
      goldens_needed: 0,
      missing: [],
      covered: [],
      warnings: [
        'Cluster report ausente — rode cluster:<pacote> ou Mapeamento L3 antes do g01.',
      ],
      reasons: [
        'Sem cluster_report não há lista goldens_needed; handcraft permitido com aviso.',
        'Skill: avant-golden-anchor-bootstrap após gerar o cluster.',
      ],
      artifact,
    };
  }

  const decisions = report.cluster_decisions ?? [];

  for (const row of decisions) {
    const decision = String(row.decision ?? '');
    const hasGolden = Boolean(row.has_golden);
    const goldenFile = row.golden_file ?? null;
    const sample = row.sample_slugs?.[0] ?? null;
    const branchId = row.pedagogical_branch_proposed ?? null;

    if (decision === 'novo_ramo' && !hasGolden) {
      missing.push({
        cluster: row.cluster,
        decision,
        count: row.count,
        branch_id: branchId,
        sample_slug: sample,
        suggested_file: suggestedAnchorFile({
          pacotePrefix: input.pacotePrefix,
          branchId,
          cluster: row.cluster,
          sampleSlug: sample,
        }),
        reason: 'Ramo forte (novo_ramo) sem golden em examples/',
      });
      continue;
    }

    if (decision === 'novo_ramo' && hasGolden) {
      const path = resolveExamplesPath(goldenFile);
      if (!path || !existsSync(path)) {
        missing.push({
          cluster: row.cluster,
          decision,
          count: row.count,
          branch_id: branchId,
          sample_slug: sample,
          suggested_file:
            goldenFile && !goldenFile.includes('/')
              ? `examples/${goldenFile}`
              : goldenFile?.startsWith('examples/')
                ? goldenFile
                : suggestedAnchorFile({
                    pacotePrefix: input.pacotePrefix,
                    branchId,
                    cluster: row.cluster,
                    sampleSlug: sample,
                  }),
          reason: `has_golden=true mas arquivo ausente: ${goldenFile ?? '(null)'}`,
        });
        continue;
      }
      const check = readContentStandard(path);
      covered.push({
        cluster: row.cluster,
        golden_file: goldenFile ?? basename(path),
        path: `examples/${basename(path)}`,
        content_standard_ok: check.ok,
        issues: check.issues,
      });
      if (check.ok === false) {
        warnings.push(`${row.cluster}: ${check.issues.join('; ')}`);
      }
      continue;
    }

    if (decision === 'coberto' && hasGolden) {
      const path = resolveExamplesPath(goldenFile);
      if (!path || !existsSync(path)) {
        warnings.push(
          `coberto sem arquivo no disco (${row.cluster}): ${goldenFile ?? '(null)'}`,
        );
        continue;
      }
      const check = readContentStandard(path);
      covered.push({
        cluster: row.cluster,
        golden_file: goldenFile ?? basename(path),
        path: `examples/${basename(path)}`,
        content_standard_ok: check.ok,
        issues: check.issues,
      });
      if (check.ok === false) {
        warnings.push(`${row.cluster}: ${check.issues.join('; ')}`);
      }
      continue;
    }

    if (decision === 'absorver' && !hasGolden) {
      warnings.push(
        `absorver sem golden própria (${row.cluster}, n=${row.count}) — fallback FAMILY_GOLDEN_FILE ok`,
      );
    }
  }

  let gate: GoldenAnchorGateStatus = 'pass';
  let handcraftAllowed = true;

  if (missing.length > 0) {
    gate = 'block';
    handcraftAllowed = false;
    reasons.push(
      `${missing.length} ramo(s) forte(s) sem golden âncora em examples/ — criar antes do g01.`,
    );
    reasons.push(
      'Skill: avant-golden-anchor-bootstrap · triggers: Criar âncoras: / Antes do g01:',
    );
    reasons.push('Depois: npm run audit:golden-anchor-gate -- --subtopico="..."');
  } else if (warnings.length > 0) {
    gate = 'warn';
    reasons.push('Âncoras de ramo forte ok; há avisos (absorver / arquivo / content_standard).');
  } else {
    reasons.push('Todos os ramos novo_ramo/coberto com golden presente em examples/.');
  }

  for (const branch of input.playbook?.pedagogical_branches ?? []) {
    for (const anchor of branch.anchors ?? []) {
      const path = resolveExamplesPath(anchor);
      if (!path || !existsSync(path)) {
        warnings.push(`playbook branch ${branch.id}: âncora ausente ${anchor}`);
        if (gate === 'pass') gate = 'warn';
      }
    }
  }

  return {
    subtopico: input.subtopico,
    pacote_prefix: input.pacotePrefix,
    gate,
    handcraft_allowed: handcraftAllowed,
    cluster_report: input.clusterReportPath ?? null,
    goldens_needed: missing.length,
    missing,
    covered,
    warnings,
    reasons,
    artifact,
  };
}

export function printGoldenAnchorGateSummary(report: GoldenAnchorGateReport): void {
  console.log(`[audit:golden-anchor-gate] subtopico=${report.subtopico}`);
  console.log(`[audit:golden-anchor-gate] pacote_prefix=${report.pacote_prefix}`);
  console.log(`[audit:golden-anchor-gate] gate=${report.gate}`);
  console.log(`[audit:golden-anchor-gate] handcraft_allowed=${report.handcraft_allowed}`);
  console.log(`[audit:golden-anchor-gate] goldens_needed=${report.goldens_needed}`);
  console.log(`[audit:golden-anchor-gate] covered=${report.covered.length}`);
  if (report.cluster_report) {
    console.log(`[audit:golden-anchor-gate] cluster_report=${report.cluster_report}`);
  }
  for (const m of report.missing) {
    console.log(
      `  MISSING ${m.cluster} (n=${m.count}) sample=${m.sample_slug ?? '—'} → ${m.suggested_file}`,
    );
  }
  for (const w of report.warnings.slice(0, 12)) {
    console.log(`  WARN ${w}`);
  }
  for (const r of report.reasons) {
    console.log(`[audit:golden-anchor-gate] → ${r}`);
  }
  console.log(`[audit:golden-anchor-gate] artifact=${report.artifact}`);
}

export function buildAnchorBriefMarkdown(
  report: GoldenAnchorGateReport,
  pkg?: HandcraftRegistryPackage | null,
): string {
  const lines: string[] = [
    `# Âncoras — ${report.subtopico}`,
    '',
    '**Modo agente na frente** (skill `avant-golden-anchor-bootstrap`).',
    '',
    `| Campo | Valor |`,
    `|-------|-------|`,
    `| gate | \`${report.gate}\` |`,
    `| handcraft_allowed | \`${report.handcraft_allowed}\` |`,
    `| goldens_needed | ${report.goldens_needed} |`,
    `| cluster_report | \`${report.cluster_report ?? '—'}\` |`,
    '',
  ];

  if (report.missing.length === 0) {
    lines.push('Nenhuma âncora faltante para ramo `novo_ramo`. Pode seguir handcraft gNN.', '');
  } else {
    lines.push('## Fila (criar nesta ordem)', '');
    lines.push('| # | Cluster | Branch | Sample slug | Arquivo sugerido |');
    lines.push('|---|---------|--------|-------------|------------------|');
    report.missing.forEach((m, i) => {
      lines.push(
        `| ${i + 1} | ${m.cluster} | \`${m.branch_id ?? '—'}\` | \`${m.sample_slug ?? '—'}\` | \`${m.suggested_file}\` |`,
      );
    });
    lines.push(
      '',
      '## Pipeline por âncora',
      '',
      '1. Ler export do `sample_slug` (pacote-completo ou lote).',
      '2. `avant-classify-family` → `meta.family`.',
      '3. Copiar `examples/_TEMPLATE-golden-v1.json`.',
      '4. `avant-golden-anchor-handcraft` → 4 slides; `[READY]` strict-v2.',
      '5. Registrar em `GOLDEN_BY_CLUSTER` / `*-golden-anchors.json`.',
      '6. Re-rodar `npm run audit:golden-anchor-gate -- --subtopico="..."`.',
      '',
    );
  }

  if (pkg?.cluster_command) {
    lines.push('## Cluster', '', '```bash', pkg.cluster_command, '```', '');
  }

  for (const r of report.reasons) {
    lines.push(`- ${r}`);
  }
  lines.push('');
  return lines.join('\n');
}
