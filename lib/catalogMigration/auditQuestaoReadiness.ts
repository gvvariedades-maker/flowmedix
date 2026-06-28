/**
 * Checklist executável — questão e subtópico 100% prontos no AVANT.
 * Cobre A1 (L1), A2 (L2 golden-v1), A3 (L2.5/L3). A4 (piloto humano) é aviso.
 *
 * @see docs/PREMIUM_QUESTAO.md
 */
import { hasPremiumStubMarkers } from '@/lib/catalogMigration/upgradePremiumHybrid';
import { lintGoldenContent } from '@/lib/goldenContentStandard';
import { validateQuestaoForWrite } from '@/lib/questaoSpec/validateQuestaoForWrite';
import {
  detectDangerGabaritoMismatch,
  detectDuplicateDangerJustifications,
  detectSlideTopicDrift,
} from '@/lib/catalogMigration/slideContract';
import { isPremiumSubtopico } from '@/lib/catalogMigration/premiumGate';
import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import { detectMoldL3WriteBlockers } from '@/lib/slides/detectMoldL3WriteBlockers';
import {
  hasSubtopicBranchDesign,
  inferPedagogicalBranch,
  resolvePedagogicalBranch,
} from '@/lib/slides/pedagogicalBranch';

export type ReadinessTier = 'A1' | 'A2' | 'A3' | 'A4';

export type ReadinessCheck = {
  tier: ReadinessTier;
  code: string;
  message: string;
  severity: 'error' | 'warn' | 'info';
};

export type AuditQuestaoReadinessOptions = {
  slug?: string;
  /** golden lint + gabarito mismatch viram error (default: true para "100%"). */
  strict?: boolean;
};

export type AuditQuestaoReadinessResult = {
  slug?: string;
  subtopico?: string;
  /** Passa A1+A2+A3 sem errors (warns/info não bloqueiam). */
  ready_100: boolean;
  tier_pass: Record<ReadinessTier, boolean>;
  checks: ReadinessCheck[];
  family?: string;
  pedagogical_branch?: string;
  inferred_branch?: string;
};

const REQUIRED_SLIDE_TYPES = [
  'concept_map',
  'golden_rule',
  'logic_flow',
  'danger_zone',
] as const;

type QuestaoPayload = {
  meta?: {
    subtopico?: string;
    family?: FamilyId;
    pedagogical_branch?: string;
    content_standard?: string;
    content_review?: unknown;
    sources?: unknown[];
  };
  question_data?: {
    instruction?: string;
    options?: { id: string; is_correct?: boolean }[];
  };
  reverse_study_slides?: unknown;
  study_slides?: unknown;
};

function slidesOf(q: QuestaoPayload): unknown[] {
  const s = q.reverse_study_slides ?? q.study_slides;
  return Array.isArray(s) ? s : [];
}

function push(
  checks: ReadinessCheck[],
  tier: ReadinessTier,
  code: string,
  message: string,
  severity: ReadinessCheck['severity'],
): void {
  checks.push({ tier, code, message, severity });
}

function tierHasErrors(checks: ReadinessCheck[], tier: ReadinessTier): boolean {
  return checks.some((c) => c.tier === tier && c.severity === 'error');
}

export function auditQuestaoReadiness(
  payload: QuestaoPayload,
  options: AuditQuestaoReadinessOptions = {},
): AuditQuestaoReadinessResult {
  const strict = options.strict !== false;
  const checks: ReadinessCheck[] = [];
  const subtopico = payload.meta?.subtopico?.trim();
  const instruction = String(payload.question_data?.instruction ?? '');
  const slides = slidesOf(payload);
  const isGoldenV1 = payload.meta?.content_standard === 'golden-v1';

  const writeResult = validateQuestaoForWrite(payload, {
    premiumGate: true,
    goldenLint: true,
  });

  if (!writeResult.ok) {
    for (const err of writeResult.errors) {
      const tier: ReadinessTier =
        err.layer === 'zod' || err.layer === 'tecconcursos'
          ? 'A1'
          : err.layer === 'golden_v1'
            ? 'A2'
            : err.layer === 'premium_gate' &&
                (err.code.startsWith('mold_l3') || err.code === 'pedagogical_branch_inferred')
              ? 'A3'
              : err.code.startsWith('molde_') || err.code === 'stub_markers'
                ? 'A2'
                : 'A3';
      push(checks, tier, err.code, err.message, 'error');
    }
  } else {
    push(checks, 'A1', 'l1_schema', 'QuestaoCompletaSchema + premiumGate estrutural OK', 'info');
  }

  const warnings = writeResult.ok ? writeResult.warnings : writeResult.warnings;
  for (const warn of warnings) {
    const tier: ReadinessTier =
      warn.layer === 'golden_v1'
        ? 'A2'
        : warn.code.startsWith('mold_l3') || warn.code === 'pedagogical_branch_inferred'
          ? 'A3'
          : 'A2';
    const asError =
      strict &&
      (warn.layer === 'golden_v1' ||
        warn.code === 'danger_gabarito_letter_mismatch' ||
        warn.code === 'mold_l3_unresolved_bespoke' ||
        warn.code === 'slide_topic_drift');
    push(
      checks,
      tier,
      warn.code,
      warn.message,
      asError ? 'error' : 'warn',
    );
  }

  const slideTypes = new Set(
    slides
      .filter((s) => s && typeof s === 'object')
      .map((s) => (s as { type?: string }).type)
      .filter(Boolean),
  );
  for (const t of REQUIRED_SLIDE_TYPES) {
    if (!slideTypes.has(t)) {
      push(checks, 'A1', 'l1_missing_slide', `Slide obrigatório ausente: ${t}`, 'error');
    }
  }

  if (!isGoldenV1) {
    push(
      checks,
      'A2',
      'l2_golden_v1',
      'meta.content_standard deve ser "golden-v1" para 100% pronto',
      'error',
    );
  }

  if (isGoldenV1 && !payload.meta?.family?.trim()) {
    push(checks, 'A2', 'l2_family', 'meta.family ausente em golden-v1', 'error');
  }

  if (isGoldenV1 && !payload.meta?.content_review) {
    push(
      checks,
      'A2',
      'l2_content_review',
      'meta.content_review ausente em golden-v1',
      strict ? 'error' : 'warn',
    );
  }

  if (isGoldenV1 && (!payload.meta?.sources || payload.meta.sources.length === 0)) {
    push(
      checks,
      'A2',
      'l2_sources',
      'meta.sources[] vazio em golden-v1',
      strict ? 'error' : 'warn',
    );
  }

  if (hasPremiumStubMarkers(slides)) {
    push(checks, 'A2', 'l2_stub', 'Slides contêm marcadores stub/genéricos', 'error');
  }

  const dup = detectDuplicateDangerJustifications(slides);
  if (dup.duplicate) {
    push(
      checks,
      'A2',
      'l2_duplicate_danger',
      `danger_zone: justificativas duplicadas (${dup.unique}/${dup.total} únicas)`,
      'error',
    );
  }

  if (instruction && detectSlideTopicDrift(instruction, slides)) {
    push(
      checks,
      'A2',
      'l2_topic_drift',
      'Vocabulário IPCS/CVC nos slides sem âncora no enunciado',
      strict ? 'error' : 'warn',
    );
  }

  const gabarito = detectDangerGabaritoMismatch(payload.question_data?.options, slides);
  if (gabarito.unparseable) {
    push(
      checks,
      'A2',
      'l2_gabarito_unparseable',
      `danger_zone.correct sem letra parseável (gabarito: ${gabarito.expected}) — OK em EXCETO/semântico`,
      'warn',
    );
  } else if (gabarito.mismatch) {
    push(
      checks,
      'A2',
      'l2_gabarito_mismatch',
      `Letra em danger_zone (${gabarito.parsed}) ≠ gabarito (${gabarito.expected})`,
      strict ? 'error' : 'warn',
    );
  }

  if (isGoldenV1) {
    for (const issue of lintGoldenContent(payload)) {
      const already = checks.some((c) => c.code === issue.code);
      if (already) continue;
      push(
        checks,
        'A2',
        issue.code,
        issue.message,
        strict ? 'error' : 'warn',
      );
    }
  }

  const inferredBranch = subtopico
    ? inferPedagogicalBranch(subtopico, instruction, slides as never[], payload.meta?.family)
    : undefined;
  const effectiveBranch = resolvePedagogicalBranch(
    subtopico,
    instruction,
    slides as never[],
    payload.meta?.pedagogical_branch,
    payload.meta?.family,
  );

  const premium = subtopico ? isPremiumSubtopico(subtopico) : false;
  const hasBranchMap = subtopico ? hasSubtopicBranchDesign(subtopico) : false;

  if (premium && hasBranchMap && !payload.meta?.pedagogical_branch?.trim()) {
    push(
      checks,
      'A3',
      'l3_branch_undeclared',
      `meta.pedagogical_branch ausente (inferido: ${inferredBranch ?? '—'})`,
      'error',
    );
  }

  if (
    payload.meta?.pedagogical_branch?.trim() &&
    inferredBranch &&
    payload.meta.pedagogical_branch.trim() !== inferredBranch
  ) {
    push(
      checks,
      'A3',
      'l3_branch_inference_mismatch',
      `Declarado "${payload.meta.pedagogical_branch}" ≠ inferido "${inferredBranch}" — revisar meta ou conteúdo`,
      'warn',
    );
  }

  for (const block of detectMoldL3WriteBlockers(payload, {
    slug: options.slug,
    strictL3: isGoldenV1 || Boolean(payload.meta?.pedagogical_branch?.trim()),
    phaseA: true,
  })) {
    const already = checks.some((c) => c.code === block.code && c.tier === 'A3');
    if (!already) {
      push(checks, 'A3', block.code, block.message, 'error');
    }
  }

  push(
    checks,
    'A4',
    'a4_player_pilot',
    'Validar manualmente em /estudar/[slug]: enunciado ↔ slides, molde visual, didática',
    'info',
  );

  const tier_pass: Record<ReadinessTier, boolean> = {
    A1: !tierHasErrors(checks, 'A1'),
    A2: !tierHasErrors(checks, 'A2'),
    A3: !tierHasErrors(checks, 'A3'),
    A4: true,
  };

  const ready_100 = tier_pass.A1 && tier_pass.A2 && tier_pass.A3;

  return {
    slug: options.slug,
    subtopico,
    ready_100,
    tier_pass,
    checks,
    family: payload.meta?.family,
    pedagogical_branch: payload.meta?.pedagogical_branch,
    inferred_branch: inferredBranch,
  };
}

export type SubtopicoReadinessReport = {
  subtopico: string;
  scanned: number;
  ready_100: number;
  pct_ready: number;
  registry?: {
    status?: string;
    total_slugs?: number;
    handcraft_applied?: number;
    complete: boolean;
  };
  tier_failures: { A1: number; A2: number; A3: number };
  not_ready: { slug: string; codes: string[] }[];
};

export function summarizeSubtopicoReadiness(
  subtopico: string,
  results: AuditQuestaoReadinessResult[],
  registry?: {
    status?: string;
    total_slugs?: number;
    handcraft_applied?: number;
  },
): SubtopicoReadinessReport {
  const ready_100 = results.filter((r) => r.ready_100).length;
  const tier_failures = { A1: 0, A2: 0, A3: 0 };
  const not_ready: { slug: string; codes: string[] }[] = [];

  for (const r of results) {
    if (r.ready_100) continue;
    const codes = r.checks.filter((c) => c.severity === 'error').map((c) => c.code);
    not_ready.push({ slug: r.slug ?? '—', codes });
    if (!r.tier_pass.A1) tier_failures.A1 += 1;
    if (!r.tier_pass.A2) tier_failures.A2 += 1;
    if (!r.tier_pass.A3) tier_failures.A3 += 1;
  }

  const regTotal = registry?.total_slugs;
  const regApplied = registry?.handcraft_applied;
  const registryComplete =
    registry?.status === 'applied' &&
    typeof regTotal === 'number' &&
    typeof regApplied === 'number' &&
    regApplied === regTotal;

  return {
    subtopico,
    scanned: results.length,
    ready_100,
    pct_ready: results.length > 0 ? Math.round((ready_100 / results.length) * 1000) / 10 : 0,
    registry: registry
      ? {
          status: registry.status,
          total_slugs: regTotal,
          handcraft_applied: regApplied,
          complete: registryComplete,
        }
      : undefined,
    tier_failures,
    not_ready,
  };
}

export function formatReadinessLine(result: AuditQuestaoReadinessResult): string {
  const status = result.ready_100 ? 'READY' : 'FAIL';
  const errors = result.checks.filter((c) => c.severity === 'error').map((c) => c.code);
  const branch = result.pedagogical_branch ?? result.inferred_branch ?? '—';
  return `[${status}] ${result.slug ?? '—'} branch=${branch} errors=${errors.join(',') || 'none'}`;
}
