/**
 * Checklist Âncoras 100% — gates executáveis + assinatura por risco.
 *
 * Writer ≠ aprovador: o CLI agrega READY/L2c/densidade; assinatura `agent:`
 * só quando risk ≠ alto. Visual G2 e “teach once” LLM entram como checks
 * com source explícita (gate | heuristic | llm | human | skipped).
 *
 * @see docs/ANCHOR_CHECKLIST_100.md
 * @see docs/PROMPT_ANCORAS_100.md
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { auditQuestaoReadiness } from '@/lib/catalogMigration/auditQuestaoReadiness';
import { hasPremiumStubMarkers } from '@/lib/catalogMigration/premiumStubMarkers';
import {
  scoreQuestaoRisk,
  type RiskResult,
  type RiskTier,
} from '@/lib/catalogMigration/riskScoring';
import { detectUnifiedPedagogy } from '@/lib/catalogMigration/unifiedPedagogyDetector';
import { lintCardDensity, type GoldenFamilyId } from '@/lib/goldenContentStandard';
import { hasSubtopicBranchDesign } from '@/lib/slides/pedagogicalBranch';

export const ANCHOR_CHECKLIST_VERSION = 'anchor-checklist-v1';
export const ANCHOR_CHECKLIST_AGENT = 'agent:anchor-checklist-v1';

export type AnchorCheckSource = 'gate' | 'heuristic' | 'llm' | 'human' | 'skipped';

export type AnchorCheckItem = {
  id: string;
  pass: boolean;
  source: AnchorCheckSource;
  detail?: string;
  fails?: string[];
};

export type AnchorChecklistVerdict = 'pass' | 'fail' | 'human_required';

export type Anchor100Approval = {
  status: 'pending' | 'pass' | 'fail' | 'human_required';
  reviewed_at?: string;
  reviewer?: string;
  method?: 'agent' | 'human' | 'both';
  artifact?: string;
  risk_tier?: RiskTier;
  checklist_version?: string;
};

export type AnchorChecklist100Options = {
  filePath?: string;
  slug?: string;
  /** Exige entrada em visual-anchors.json para o pedagogical_branch. */
  requireVisual?: boolean;
  /**
   * Julgamento externo do Revisor B (teach_once / gesture_g2).
   * Não vem do Writer — arquivo ou decisão do segundo agente.
   */
  reviewerOverlay?: {
    teach_once?: { pass: boolean; evidence?: string; reviewer?: string };
    gesture_g2?: { pass: boolean; evidence?: string; reviewer?: string };
  };
  /** Se true e agent_may_sign, verdict/status = pass com reviewer agent. */
  signAgent?: boolean;
  /** Reviewer humano assina (só com gates verdes). */
  signHuman?: string;
  productionReady?: boolean;
  isoDate?: string;
};

export type AnchorChecklist100Result = {
  checklist_version: string;
  file: string | null;
  slug: string;
  branch_id: string | null;
  subtopico: string | null;
  family: string | null;
  risk_tier: RiskTier;
  risk_factors: string[];
  approval_mode: RiskResult['approval_mode'];
  checks: Record<string, AnchorCheckItem>;
  /** Todos os checks com source gate/heuristic (não skipped) passaram. */
  gates_pass: boolean;
  agent_may_sign: boolean;
  verdict: AnchorChecklistVerdict;
  approval: Anchor100Approval;
  ready_100: boolean;
  artifact_relpath: string;
};

type SlideLike = Record<string, unknown>;

type PayloadLike = {
  meta?: {
    subtopico?: string;
    family?: string;
    pedagogical_branch?: string;
    content_standard?: string;
    anchor_100_approval?: Anchor100Approval;
  };
  question_data?: unknown;
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
};

const SPOILER_CODES = new Set([
  'pedagogy_letter_spoiler',
  'pedagogy_vf_verdict_spoiler',
  'pedagogy_question_bound_label',
  'golden_rule_gabarito_spoiler',
  'concept_map_spoiler',
]);

const DZ_CODES = new Set([
  'danger_zone_letter_coverage',
  'danger_zone_transfer_missing',
  'danger_distractors_coverage',
  'duplicate_danger_justification',
]);

const DENSITY_CODES_PREFIX = 'card_density_';

/**
 * Duas sentenças completas no mesmo card → risco de “dois assuntos”.
 * Só aplica em strings longas (acima do soft §3b) para não falso-positivo em details curtos.
 */
const DUAL_SENTENCE_RE =
  /[.!?]\s+[A-ZÁÉÍÓÚÀÃÕÂÊÔÜ][\s\S]{20,}[.!?]/;
const DUAL_IDEA_MIN_CHARS = 100;

function slidesOf(payload: PayloadLike): SlideLike[] {
  const s = payload.reverse_study_slides ?? payload.study_slides;
  return Array.isArray(s) ? s : [];
}

function collectStrings(slides: SlideLike[]): { path: string; text: string }[] {
  const out: { path: string; text: string }[] = [];
  for (const slide of slides) {
    const type = String(slide.type ?? 'slide');
    if (typeof slide.content === 'string' && slide.content.trim()) {
      out.push({ path: `${type}.content`, text: slide.content });
    }
    if (typeof slide.footer_rule === 'string' && slide.footer_rule.trim()) {
      out.push({ path: `${type}.footer_rule`, text: slide.footer_rule });
    }
    if (Array.isArray(slide.steps)) {
      slide.steps.forEach((step, i) => {
        if (typeof step === 'string' && step.trim()) {
          out.push({ path: `${type}.steps[${i}]`, text: step });
        }
      });
    }
    if (Array.isArray(slide.items)) {
      (slide.items as Record<string, unknown>[]).forEach((it, i) => {
        for (const key of ['label', 'detail', 'correct'] as const) {
          const v = it[key];
          if (typeof v === 'string' && v.trim()) {
            out.push({ path: `${type}.items[${i}].${key}`, text: v });
          }
        }
      });
    }
    if (Array.isArray(slide.rows)) {
      (slide.rows as Record<string, unknown>[]).forEach((row, i) => {
        for (const key of ['label', 'value'] as const) {
          const v = row[key];
          if (typeof v === 'string' && v.trim()) {
            out.push({ path: `${type}.rows[${i}].${key}`, text: v });
          }
        }
      });
    }
  }
  return out;
}

/** Heurística: string longa com duas sentenças tipográficas. */
export function detectDualIdeaStrings(payload: PayloadLike): string[] {
  const fails: string[] = [];
  for (const { path, text } of collectStrings(slidesOf(payload))) {
    if (text.length < DUAL_IDEA_MIN_CHARS) continue;
    if (DUAL_SENTENCE_RE.test(text)) {
      fails.push(`${path}: possível duas ideias (${text.length} chars)`);
    }
  }
  return fails;
}

function loadVisualAnchorBranchIds(cwd = process.cwd()): Set<string> {
  const path = resolve(cwd, 'data/catalog-migration/visual-anchors.json');
  if (!existsSync(path)) return new Set();
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as {
      anchors?: Record<string, { pedagogical_branch?: string }>;
    };
    const ids = new Set<string>();
    for (const [key, val] of Object.entries(raw.anchors ?? {})) {
      ids.add(key);
      if (val.pedagogical_branch) ids.add(val.pedagogical_branch);
    }
    return ids;
  } catch {
    return new Set();
  }
}

function captureDirExists(slug: string, cwd = process.cwd()): boolean {
  return existsSync(resolve(cwd, 'artifacts/questao-review', slug));
}

function checkReady(payload: PayloadLike, slug: string, productionReady?: boolean) {
  return auditQuestaoReadiness(payload as never, {
    slug,
    strict: true,
    strictV2Pedagogy: true,
    productionReady,
  });
}

function errorsMatching(
  readinessCodes: string[],
  pedagogyCodes: string[],
  predicate: (code: string) => boolean,
): string[] {
  return [...readinessCodes, ...pedagogyCodes].filter(predicate);
}

/**
 * Avalia checklist Âncoras 100% para um JSON de âncora (examples/ ou lote).
 */
export function auditAnchorChecklist100(
  payload: unknown,
  options: AnchorChecklist100Options = {},
): AnchorChecklist100Result {
  const p = (payload ?? {}) as PayloadLike;
  const slug =
    options.slug ??
    options.filePath?.replace(/^.*[/\\]/, '').replace(/\.json$/i, '') ??
    'anchor';
  const branchId = p.meta?.pedagogical_branch?.trim() || null;
  const subtopico = p.meta?.subtopico?.trim() || null;
  const family = p.meta?.family?.trim() || null;
  const today = options.isoDate ?? new Date().toISOString().slice(0, 10);
  const artifactRel = join('artifacts', 'anchor-checklist', `${slug}.json`).replace(/\\/g, '/');

  const readiness = checkReady(p, slug, options.productionReady);
  const risk = readiness.risk ?? scoreQuestaoRisk(p as never, {
    productionReady: options.productionReady,
    autoApprovalEnabled: true,
  });

  const pedagogy = detectUnifiedPedagogy(p as never);
  const pedagogyCodes = pedagogy.map((f) => f.code);
  const readinessErrorCodes = readiness.checks
    .filter((c) => c.severity === 'error')
    .map((c) => c.code);

  const densityIssues = lintCardDensity(
    slidesOf(p),
    family as GoldenFamilyId | undefined,
  );
  const dualIdeaFails = detectDualIdeaStrings(p);

  const checks: Record<string, AnchorCheckItem> = {};

  // 1) READY strict-v2
  checks.ready_strict = {
    id: 'ready_strict',
    pass: readiness.ready_100 === true,
    source: 'gate',
    detail: readiness.ready_100
      ? '[READY] strict-v2-pedagogy'
      : readinessErrorCodes.slice(0, 8).join(', ') || 'ready_100=false',
    fails: readiness.ready_100 ? undefined : readinessErrorCodes,
  };

  // 2) Sem spoiler CM/GR (detector + readiness)
  const spoilerFails = errorsMatching(readinessErrorCodes, pedagogyCodes, (c) =>
    SPOILER_CODES.has(c) || c.includes('spoiler') || c.includes('gabarito_spoiler'),
  );
  checks.no_spoiler_cm_gr = {
    id: 'no_spoiler_cm_gr',
    pass: spoilerFails.length === 0,
    source: 'gate',
    detail:
      spoilerFails.length === 0
        ? 'detectUnifiedPedagogy + readiness sem spoiler pré-resposta'
        : spoilerFails.join(', '),
    fails: spoilerFails.length ? spoilerFails : undefined,
  };

  // 3) danger_zone completo
  const dzFails = errorsMatching(readinessErrorCodes, pedagogyCodes, (c) =>
    DZ_CODES.has(c) || c.startsWith('danger_zone_') || c.includes('duplicate_danger'),
  );
  checks.danger_zone_complete = {
    id: 'danger_zone_complete',
    pass: dzFails.length === 0,
    source: 'gate',
    detail:
      dzFails.length === 0
        ? 'cobertura distratores + transferência / correct únicos'
        : dzFails.join(', '),
    fails: dzFails.length ? dzFails : undefined,
  };

  // 4) Densidade + 1 ideia
  const densityFails = [
    ...densityIssues.map((i) => i.code),
    ...readinessErrorCodes.filter((c) => c.startsWith(DENSITY_CODES_PREFIX)),
    ...pedagogyCodes.filter((c) => c === 'pedagogy_density'),
  ];
  const uniqueDensity = [...new Set(densityFails)];
  const densityPass = uniqueDensity.length === 0 && dualIdeaFails.length === 0;
  checks.density_one_idea = {
    id: 'density_one_idea',
    pass: densityPass,
    source: dualIdeaFails.length ? 'heuristic' : 'gate',
    detail: densityPass
      ? 'limites §3b + sem duas sentenças no mesmo card'
      : [...uniqueDensity, ...dualIdeaFails].slice(0, 10).join('; '),
    fails: densityPass ? undefined : [...uniqueDensity, ...dualIdeaFails],
  };

  // 5) teach_once — overlay LLM/humano ou heurística (proxy)
  const overlayTeach = options.reviewerOverlay?.teach_once;
  if (overlayTeach) {
    checks.teach_once = {
      id: 'teach_once',
      pass: overlayTeach.pass === true,
      source: overlayTeach.reviewer?.startsWith('agent:') ? 'llm' : 'human',
      detail: overlayTeach.evidence ?? (overlayTeach.pass ? 'revisor B ok' : 'revisor B fail'),
    };
  } else {
    const slides = slidesOf(p);
    const concept = slides.find((s) => s.type === 'concept_map');
    const items = Array.isArray(concept?.items) ? concept!.items.length : 0;
    const stub = hasPremiumStubMarkers(slides);
    const teachProxy =
      readiness.ready_100 &&
      items >= 3 &&
      !stub &&
      spoilerFails.length === 0 &&
      !readinessErrorCodes.includes('logic_flow_fixation_missing');
    checks.teach_once = {
      id: 'teach_once',
      pass: teachProxy,
      source: 'heuristic',
      detail: teachProxy
        ? 'proxy: READY + CM≥3 + fixação + sem stub/spoiler (Revisor B opcional via --reviewer-file)'
        : 'proxy falhou — reescrever ou passar --reviewer-file com teach_once',
    };
  }

  // 6) gesture_g2
  const overlayGesture = options.reviewerOverlay?.gesture_g2;
  const visualIds = loadVisualAnchorBranchIds();
  const inVisualRegistry = branchId ? visualIds.has(branchId) : false;
  const hasCapture = captureDirExists(slug);
  const needsBranch = hasSubtopicBranchDesign(subtopico ?? undefined);

  if (overlayGesture) {
    checks.gesture_g2 = {
      id: 'gesture_g2',
      pass: overlayGesture.pass === true,
      source: overlayGesture.reviewer?.startsWith('agent:') ? 'llm' : 'human',
      detail: overlayGesture.evidence ?? 'revisor B visual',
    };
  } else if (options.requireVisual) {
    const pass = Boolean(branchId && (inVisualRegistry || hasCapture));
    checks.gesture_g2 = {
      id: 'gesture_g2',
      pass,
      source: 'gate',
      detail: pass
        ? inVisualRegistry
          ? `visual-anchors.json tem ${branchId}`
          : `capture em artifacts/questao-review/${slug}`
        : needsBranch
          ? `faltando visual-anchors / capture para branch=${branchId ?? 'null'}`
          : 'subtópico sem BRANCH_DESIGN_MAP — declare branch ou capture',
    };
  } else {
    checks.gesture_g2 = {
      id: 'gesture_g2',
      pass: true,
      source: 'skipped',
      detail: needsBranch
        ? `warn: rode preview G2 / --require-visual (branch=${branchId ?? ' mag'})`
        : 'skipped (use --require-visual para barrar)',
    };
  }

  const hardChecks = [
    checks.ready_strict,
    checks.no_spoiler_cm_gr,
    checks.danger_zone_complete,
    checks.density_one_idea,
    checks.teach_once,
    checks.gesture_g2,
  ];
  const gates_pass = hardChecks.every((c) => c.pass);

  const agent_may_sign =
    gates_pass && risk.approval_mode !== 'human_required' && risk.risk_tier !== 'alto';

  let verdict: AnchorChecklistVerdict = 'fail';
  let approval: Anchor100Approval = {
    status: 'pending',
    checklist_version: ANCHOR_CHECKLIST_VERSION,
    risk_tier: risk.risk_tier,
    artifact: artifactRel,
  };

  const highRisk = risk.risk_tier === 'alto' || risk.approval_mode === 'human_required';

  if (!gates_pass) {
    verdict = 'fail';
    approval = {
      ...approval,
      status: 'fail',
      reviewed_at: today,
      method: 'agent',
    };
  } else if (options.signHuman) {
    verdict = 'pass';
    approval = {
      ...approval,
      status: 'pass',
      reviewed_at: today,
      reviewer: options.signHuman,
      method: 'human',
    };
  } else if (highRisk) {
    verdict = 'human_required';
    approval = {
      ...approval,
      status: 'human_required',
      reviewed_at: today,
    };
  } else if (options.signAgent) {
    verdict = 'pass';
    approval = {
      ...approval,
      status: 'pass',
      reviewed_at: today,
      reviewer: ANCHOR_CHECKLIST_AGENT,
      method: 'agent',
    };
  } else {
    // Gates verdes — verdict pass; approval pending até --sign-agent
    verdict = 'pass';
    approval = {
      status: 'pending',
      checklist_version: ANCHOR_CHECKLIST_VERSION,
      risk_tier: risk.risk_tier,
      artifact: artifactRel,
    };
  }

  return {
    checklist_version: ANCHOR_CHECKLIST_VERSION,
    file: options.filePath ?? null,
    slug,
    branch_id: branchId,
    subtopico,
    family,
    risk_tier: risk.risk_tier,
    risk_factors: risk.risk_factors,
    approval_mode: risk.approval_mode,
    checks,
    gates_pass,
    agent_may_sign,
    verdict,
    approval,
    ready_100: readiness.ready_100,
    artifact_relpath: artifactRel,
  };
}

export function formatAnchorChecklistLine(result: AnchorChecklist100Result): string {
  const sign =
    result.approval.status === 'pass'
      ? `signed:${result.approval.reviewer}`
      : result.approval.status;
  return (
    `[anchor-100] ${result.verdict.toUpperCase()} gates=${result.gates_pass ? 'PASS' : 'FAIL'} ` +
    `risk=${result.risk_tier} agent_may_sign=${result.agent_may_sign} approval=${sign} ` +
    `slug=${result.slug}`
  );
}

/** Aplica `meta.anchor_100_approval` no payload (mutável clone). */
export function applyAnchor100ApprovalToPayload(
  payload: unknown,
  approval: Anchor100Approval,
): unknown {
  const clone = JSON.parse(JSON.stringify(payload)) as PayloadLike;
  if (!clone.meta) clone.meta = {};
  clone.meta.anchor_100_approval = {
    status: approval.status,
    reviewed_at: approval.reviewed_at,
    reviewer: approval.reviewer,
    method: approval.method,
    artifact: approval.artifact,
    risk_tier: approval.risk_tier,
    checklist_version: approval.checklist_version ?? ANCHOR_CHECKLIST_VERSION,
  };
  return clone;
}
