/**
 * Core A4-mínimo — whitelist + mitigação de risco (genérico por pacote).
 *
 * Cada pacote pluga: isApplicable, whitelist, sensitiveHintRe, agentId, label.
 *
 * @see docs/PROTOCOLO_A4_MINIMO.md
 * @see docs/DECISAO_AUTO_APROVACAO_RISCO.md
 */

import {
  buildEfficacyContractFromRisk,
  type EfficacyContract,
  type RiskFactor,
  type RiskResult,
  type RiskScoringContext,
} from '@/lib/catalogMigration/riskScoring';

export type A4MinimoWhitelistClaim = {
  id: string;
  axis: string;
  match: RegExp;
  forbid?: RegExp;
  canonical: string;
  guidelineEntryId: string;
  groundsNumeric: boolean;
};

export type A4MinimoClaimHit = {
  claimId: string;
  axis: string;
  canonical: string;
  forbiddenHit: boolean;
};

export type A4MinimoAudit = {
  packageId: string;
  applicable: boolean;
  slideCorpus: string;
  matched: A4MinimoClaimHit[];
  axesHit: string[];
  sensitiveClaimsPresent: boolean;
  unmatchedSensitiveSnippets: string[];
  hasTierAWithCovers: boolean;
  examVsCurrentOk: boolean;
  contradictions: string[];
  agentA4Eligible: boolean;
  blockers: string[];
  checklistPassed: string[];
};

export type A4MinimoPackageConfig = {
  packageId: string;
  /** Rótulo em logs (ex.: "Punção", "História"). */
  label: string;
  agentId: string;
  isApplicable: (subtopico: string) => boolean;
  whitelist: readonly A4MinimoWhitelistClaim[];
  /** Hints que exigem ground-truth na whitelist. */
  sensitiveClaimHintRe: RegExp;
  /** Mínimo de itens na danger_zone (default 3). */
  minDangerItems?: number;
  /** Regex do último step do logic_flow para fixação (opcional). */
  fixacaoStepRe?: RegExp;
  /** Extrator extra de unmatched (opcional). */
  extraUnmatchedSensitive?: (
    corpus: string,
    matchedIds: Set<string>,
    whitelist: readonly A4MinimoWhitelistClaim[],
  ) => string[];
};

export type QuestaoLike = {
  meta?: {
    family?: string;
    subtopico?: string;
    content_review?: { exam_vs_current?: string };
    sources?: Array<{ tier?: string; covers?: string[] }>;
    efficacy_contract?: EfficacyContract;
  };
  question_data?: {
    instruction?: string;
    options?: Array<{ text?: string }>;
  };
  reverse_study_slides?: Record<string, unknown>[];
  study_slides?: Record<string, unknown>[];
};

const FACTORS_MITIGABLE = new Set<RiskFactor>([
  'family_high_stakes',
  'numeric_claim_critical',
  'numeric_claim_soft',
]);

const FACTORS_BLOCK_MITIGATION = new Set<RiskFactor>([
  'exam_vs_current_divergence',
  'source_tier_b_on_number',
]);

const DEFAULT_FIXACAO_RE =
  /similares|em outra|transfer|port[aá]til|fixa[cç][aã]o|cronologia|n[aã]o\s+confund/i;

function slidesOf(payload: QuestaoLike): Record<string, unknown>[] {
  return payload.reverse_study_slides ?? payload.study_slides ?? [];
}

function collectSlideCorpus(payload: QuestaoLike): string {
  return slidesOf(payload)
    .map((s) => JSON.stringify(s))
    .join(' ');
}

function hasTierAWithCovers(payload: QuestaoLike): boolean {
  const sources = payload.meta?.sources ?? [];
  return sources.some(
    (s) =>
      s.tier === 'A' &&
      Array.isArray(s.covers) &&
      s.covers.some((c) => typeof c === 'string' && c.trim().length > 0),
  );
}

function examVsCurrentOk(payload: QuestaoLike): boolean {
  const v = payload.meta?.content_review?.exam_vs_current;
  if (!v || v === 'none' || v.trim().length === 0) return true;
  return !/diverg|≠|!=|desatual|prova\s+antiga|guideline\s+atual|norma\s+atual|conflito|difere/i.test(
    v,
  );
}

function defaultUnmatchedSensitive(
  corpus: string,
  matchedIds: Set<string>,
  whitelist: readonly A4MinimoWhitelistClaim[],
  sensitiveRe: RegExp,
): string[] {
  if (!sensitiveRe.test(corpus)) return [];
  const hasGroundedNumeric = whitelist.some(
    (c) => matchedIds.has(c.id) && c.groundsNumeric,
  );
  const snippets: string[] = [];
  const criticalDose = corpus.match(
    /\b\d+([.,]\d+)?\s*(mg|mcg|µg|ug|ui|mmhg|bpm)\b/gi,
  );
  if (criticalDose && !hasGroundedNumeric) {
    for (const s of criticalDose.slice(0, 3)) snippets.push(s);
  }
  if (matchedIds.size === 0 && sensitiveRe.test(corpus)) {
    snippets.push('claim_sensivel_sem_match_whitelist');
  }
  return [...new Set(snippets)];
}

function emptyAudit(cfg: A4MinimoPackageConfig, reason: string): A4MinimoAudit {
  return {
    packageId: cfg.packageId,
    applicable: false,
    slideCorpus: '',
    matched: [],
    axesHit: [],
    sensitiveClaimsPresent: false,
    unmatchedSensitiveSnippets: [],
    hasTierAWithCovers: false,
    examVsCurrentOk: true,
    contradictions: [],
    agentA4Eligible: false,
    blockers: [reason],
    checklistPassed: [],
  };
}

/**
 * Audita payload contra a config do pacote.
 */
export function auditA4Minimo(
  cfg: A4MinimoPackageConfig,
  payload: QuestaoLike,
): A4MinimoAudit {
  const sub = payload.meta?.subtopico ?? '';
  if (!cfg.isApplicable(sub)) {
    return emptyAudit(cfg, `not_${cfg.packageId}_subtopico`);
  }

  const slideCorpus = collectSlideCorpus(payload);
  const matched: A4MinimoClaimHit[] = [];
  const contradictions: string[] = [];
  const checklistPassed: string[] = [];
  const blockers: string[] = [];

  for (const claim of cfg.whitelist) {
    if (!claim.match.test(slideCorpus)) continue;
    const forbiddenHit = Boolean(claim.forbid && claim.forbid.test(slideCorpus));
    matched.push({
      claimId: claim.id,
      axis: claim.axis,
      canonical: claim.canonical,
      forbiddenHit,
    });
    if (forbiddenHit) {
      contradictions.push(`${claim.id}: padrão proibido no corpus`);
    }
  }

  const matchedIds = new Set(matched.map((m) => m.claimId));
  const axesHit = [...new Set(matched.map((m) => m.axis))];
  const sensitiveClaimsPresent = cfg.sensitiveClaimHintRe.test(slideCorpus);
  let unmatchedSensitiveSnippets = defaultUnmatchedSensitive(
    slideCorpus,
    matchedIds,
    cfg.whitelist,
    cfg.sensitiveClaimHintRe,
  );
  if (cfg.extraUnmatchedSensitive) {
    unmatchedSensitiveSnippets = [
      ...new Set([
        ...unmatchedSensitiveSnippets,
        ...cfg.extraUnmatchedSensitive(slideCorpus, matchedIds, cfg.whitelist),
      ]),
    ];
  }

  const tierA = hasTierAWithCovers(payload);
  const examOk = examVsCurrentOk(payload);
  const family = String(payload.meta?.family ?? '');
  const minDanger = cfg.minDangerItems ?? 3;
  const fixacaoRe = cfg.fixacaoStepRe ?? DEFAULT_FIXACAO_RE;

  if (tierA) checklistPassed.push('tier_a_covers');
  else blockers.push('missing_tier_a_source_covers');

  if (examOk) checklistPassed.push('exam_vs_current_ok');
  else blockers.push('exam_vs_current_divergence');

  if (contradictions.length === 0) checklistPassed.push('no_forbid_hits');
  else blockers.push(...contradictions.map((c) => `forbid:${c}`));

  if (unmatchedSensitiveSnippets.length === 0) {
    checklistPassed.push('sensitive_claims_whitelisted');
  } else {
    blockers.push(
      `unmatched_sensitive:${unmatchedSensitiveSnippets.slice(0, 3).join('|')}`,
    );
  }

  if (family === 'calc') blockers.push('family_calc_always_human');
  else checklistPassed.push('family_not_calc');

  const danger = slidesOf(payload).find((s) => s.type === 'danger_zone') as
    | { items?: unknown[] }
    | undefined;
  const flow = slidesOf(payload).find((s) => s.type === 'logic_flow') as
    | { steps?: string[] }
    | undefined;
  const dangerCount = Array.isArray(danger?.items) ? danger.items.length : 0;
  if (dangerCount >= minDanger) checklistPassed.push('danger_zone_coverage_min');
  else blockers.push(`danger_zone_thin:${dangerCount}`);

  const lastStep = Array.isArray(flow?.steps)
    ? (flow.steps[flow.steps.length - 1] ?? '')
    : '';
  if (fixacaoRe.test(lastStep)) checklistPassed.push('logic_flow_fixacao');
  else if (flow?.steps && flow.steps.length >= 4) {
    checklistPassed.push('logic_flow_present');
  } else {
    blockers.push('logic_flow_weak');
  }

  if (matched.length > 0) checklistPassed.push(`whitelist_hits:${matched.length}`);

  const agentA4Eligible =
    blockers.length === 0 &&
    (matched.length > 0 || !sensitiveClaimsPresent) &&
    tierA &&
    examOk &&
    contradictions.length === 0 &&
    family !== 'calc';

  if (agentA4Eligible) checklistPassed.push('agent_a4_eligible');

  return {
    packageId: cfg.packageId,
    applicable: true,
    slideCorpus,
    matched,
    axesHit,
    sensitiveClaimsPresent,
    unmatchedSensitiveSnippets,
    hasTierAWithCovers: tierA,
    examVsCurrentOk: examOk,
    contradictions,
    agentA4Eligible,
    blockers,
    checklistPassed,
  };
}

function tierFromFactors(factors: RiskFactor[]): RiskResult['risk_tier'] {
  const CRITICAL = new Set<RiskFactor>([
    'numeric_claim_critical',
    'family_high_stakes',
    'source_tier_b_on_number',
    'exam_vs_current_divergence',
  ]);
  if (factors.some((f) => CRITICAL.has(f))) return 'alto';
  if (factors.length > 0) return 'medio';
  return 'baixo';
}

function modeFromTier(
  tier: RiskResult['risk_tier'],
  autoEnabled: boolean,
): RiskResult['approval_mode'] {
  if (!autoEnabled) return 'human_required';
  if (tier === 'alto') return 'human_required';
  if (tier === 'medio') return 'auto_conditional';
  return 'auto';
}

/**
 * Mitiga risco alto → médio quando whitelist do pacote passa.
 */
export function applyA4MinimoMitigation(
  cfg: A4MinimoPackageConfig,
  risk: RiskResult,
  audit: A4MinimoAudit,
  options?: { autoApprovalEnabled?: boolean },
): RiskResult {
  const tag = `A4-mínimo ${cfg.label}`;

  if (!audit.applicable || !audit.agentA4Eligible) {
    if (audit.applicable && !audit.agentA4Eligible) {
      return {
        ...risk,
        reasons: [
          ...risk.reasons,
          `${tag}: não elegível (${audit.blockers.slice(0, 3).join('; ') || '—'}).`,
        ],
      };
    }
    return risk;
  }

  if (risk.risk_factors.some((f) => FACTORS_BLOCK_MITIGATION.has(f))) {
    return {
      ...risk,
      reasons: [
        ...risk.reasons,
        `${tag}: whitelist OK, mas fator bloqueante (divergência/fonte B) mantém humano.`,
      ],
    };
  }

  const wasAlto = risk.risk_tier === 'alto';
  const onlyMitigableAlto =
    wasAlto &&
    risk.risk_factors.every(
      (f) =>
        FACTORS_MITIGABLE.has(f) ||
        f === 'subtopic_immature' ||
        f === 'source_covers_gap',
    );

  if (!wasAlto || !onlyMitigableAlto) {
    return {
      ...risk,
      reasons: [
        ...risk.reasons,
        `${tag}: whitelist PASS (${audit.matched.map((m) => m.claimId).join(', ') || '—'}).`,
      ],
    };
  }

  const autoEnabled = options?.autoApprovalEnabled !== false;
  const mitigatedFactors = risk.risk_factors.filter((f) => !FACTORS_MITIGABLE.has(f));
  const newFactors = mitigatedFactors.filter(
    (f) => f !== 'source_covers_gap' || !audit.hasTierAWithCovers,
  );
  const risk_tier = tierFromFactors(newFactors.length ? newFactors : []);
  const hasGroundedNumeric = audit.matched.some((m) =>
    cfg.whitelist.find((c) => c.id === m.claimId)?.groundsNumeric,
  );
  const finalTier =
    risk_tier === 'baixo' ? (hasGroundedNumeric || wasAlto ? 'medio' : 'medio') : risk_tier;
  const approval_mode = modeFromTier(finalTier, autoEnabled);

  return {
    risk_tier: finalTier,
    approval_mode,
    risk_factors: newFactors.length > 0 ? newFactors : [],
    reasons: [
      ...risk.reasons.filter((r) => !/alto risco clínico|parâmetro numérico/i.test(r)),
      `${tag}: whitelist grounded → ${risk.risk_tier}↓${finalTier} [${audit.matched.map((m) => m.claimId).join(', ')}].`,
    ],
  };
}

export function buildA4MinimoEfficacyContract(
  cfg: A4MinimoPackageConfig,
  risk: RiskResult,
  audit: A4MinimoAudit,
  options?: { sampled?: boolean; isoDate?: string },
): EfficacyContract | null {
  if (!audit.agentA4Eligible) return null;
  if (risk.approval_mode === 'human_required') return null;

  const base = buildEfficacyContractFromRisk(risk, {
    reviewerAgent: cfg.agentId,
    sampled: options?.sampled,
    isoDate: options?.isoDate,
  });

  return {
    ...base,
    a4_checklist_passed: audit.checklistPassed,
    retrieval_first: true,
    transfer_targets: audit.axesHit,
  };
}

export function scoreWithA4Minimo(
  cfg: A4MinimoPackageConfig,
  scoreFn: (payload: QuestaoLike, ctx?: RiskScoringContext) => RiskResult,
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): { risk: RiskResult; audit: A4MinimoAudit } {
  const base = scoreFn(payload, context);
  const audit = auditA4Minimo(cfg, payload);
  const risk = applyA4MinimoMitigation(cfg, base, audit, {
    autoApprovalEnabled: context.autoApprovalEnabled,
  });
  return { risk, audit };
}
