/**
 * Auto-aprovação por risco — classifica questão por custo do erro clínico.
 *
 * Princípio: automatizar 100% da detecção; humano só onde o custo do erro é alto
 * E a máquina não tem ground-truth (dose/conduta crítica).
 *
 * @see docs/DECISAO_AUTO_APROVACAO_RISCO.md
 */

import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import { NUMERIC_CLAIM_RE } from '@/lib/goldenContentStandard';

export type RiskTier = 'baixo' | 'medio' | 'alto';

export type ApprovalMode = 'auto' | 'auto_conditional' | 'human_required';

export type RiskFactor =
  | 'numeric_claim_critical'
  | 'numeric_claim_soft'
  | 'source_tier_b_on_number'
  | 'source_covers_gap'
  | 'family_high_stakes'
  | 'exam_vs_current_divergence'
  | 'subtopic_immature'
  | 'branch_novel'
  | 'residual_pedagogy_warn';

export type RiskResult = {
  risk_tier: RiskTier;
  approval_mode: ApprovalMode;
  risk_factors: RiskFactor[];
  reasons: string[];
};

export type AutoApprovalPolicy = {
  enabled: boolean;
  /** Maior tier que o agente pode auto-aprovar (default: medio). */
  default_max_tier_auto?: RiskTier;
  sample_rate?: { baixo: number; medio: number };
  downgrade_on_report_rate_pct?: number;
  last_calibrated_at?: string | null;
};

export type EfficacyContract = {
  risk_tier?: RiskTier;
  risk_factors?: RiskFactor[];
  approval_mode?: ApprovalMode;
  /** true = A4 fechado (agente ou humano). */
  a4_reviewed?: boolean;
  /** Ex.: "agent:golden-v2" ou iniciais humanas. */
  a4_reviewer?: string;
  a4_checklist_passed?: string[];
  auto_approved_at?: string;
  sampled?: boolean;
  transfer_targets?: string[];
  retrieval_first?: boolean;
};

export type RiskScoringContext = {
  /** Pacote production_ready no registry. Default: false se omitido. */
  productionReady?: boolean;
  /** Flag auto_approval.enabled do pacote. Default: true (scoring ainda roda). */
  autoApprovalEnabled?: boolean;
  /** Ramo sem âncora / cauda longa. */
  branchNovel?: boolean;
  /** Pedagogy v2/v3 passou com warns residuais. */
  residualPedagogyWarn?: boolean;
};

type SlideLike = Record<string, unknown>;

type QuestaoLike = {
  meta?: {
    family?: string;
    subtopico?: string;
    pedagogical_branch?: string;
    content_review?: { exam_vs_current?: string };
    sources?: Array<{ tier?: string; covers?: string[] }>;
    efficacy_contract?: EfficacyContract;
  };
  question_data?: {
    instruction?: string;
    options?: Array<{ id: string; text: string; is_correct: boolean }>;
  };
  reverse_study_slides?: SlideLike[];
  study_slides?: SlideLike[];
};

/** Dose / parâmetro vital / unidade que reprova aluno se errada. */
export const CRITICAL_NUMERIC_RE =
  /\b\d+([.,]\d+)?\s*(mg|ml|mcg|µg|ug|ui|g\b|kg|mmhg|bpm|°c|gota|gotas|ampola|comprimido)\b/i;

/** Intervalo/tempo/% — risco médio salvo família high-stakes.
 * Nota: `%` não é word-char — não exigir `\b` imediatamente após `%`.
 */
export const SOFT_NUMERIC_RE =
  /\b\d+([.,]\d+)?\s*%|\b\d+([.,]\d+)?\s*(h\b|hora|horas|dia|dias|semana|semanas|mes|meses|min|minuto|minutos|ponto|pontos|escore)\b/i;

/** Proporções de protocolo (ex.: 30:2 RCP). */
export const PROTOCOL_RATIO_RE = /\b\d+\s*:\s*\d+\b/;

const HIGH_STAKES_FAMILIES = new Set<FamilyId>(['protocolo', 'calc']);

const HIGH_STAKES_SUBTOPICOS = [
  'urgências e emergências',
  'imunização',
  'cálculo de administração de medicamentos e infusões',
  'cuidados na administração de medicamentos',
  'verificação de sinais vitais',
];

const CRITICAL_FACTORS = new Set<RiskFactor>([
  'numeric_claim_critical',
  'family_high_stakes',
  'source_tier_b_on_number',
  'exam_vs_current_divergence',
]);

const MEDIUM_FACTORS = new Set<RiskFactor>([
  'numeric_claim_soft',
  'subtopic_immature',
  'branch_novel',
  'residual_pedagogy_warn',
  'source_covers_gap',
]);

const SAMPLE_RATES_DEFAULT = { baixo: 0.05, medio: 0.2 } as const;

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function slidesOf(q: QuestaoLike): SlideLike[] {
  const s = q.reverse_study_slides ?? q.study_slides;
  return Array.isArray(s) ? s : [];
}

function corpusText(q: QuestaoLike): string {
  const slides = slidesOf(q);
  const instruction = q.question_data?.instruction ?? '';
  const options = (q.question_data?.options ?? []).map((o) => o.text).join(' ');
  return `${instruction}\n${options}\n${JSON.stringify(slides)}`;
}

export function isHighStakesSubtopico(subtopico: string | undefined): boolean {
  if (!subtopico?.trim()) return false;
  const key = normalizeKey(subtopico);
  return HIGH_STAKES_SUBTOPICOS.some((h) => key.includes(normalizeKey(h)));
}

function hasCriticalNumeric(text: string): boolean {
  return CRITICAL_NUMERIC_RE.test(text) || PROTOCOL_RATIO_RE.test(text);
}

function hasSoftNumeric(text: string): boolean {
  return SOFT_NUMERIC_RE.test(text) || NUMERIC_CLAIM_RE.test(text);
}

function hasAnyNumeric(text: string): boolean {
  return hasCriticalNumeric(text) || hasSoftNumeric(text) || NUMERIC_CLAIM_RE.test(text);
}

function resolveFamily(q: QuestaoLike): FamilyId | undefined {
  const f = q.meta?.family;
  if (
    f === 'legis' ||
    f === 'protocolo' ||
    f === 'calc' ||
    f === 'vf' ||
    f === 'certo_errado' ||
    f === 'conceito' ||
    f === 'text_fragment'
  ) {
    return f;
  }
  return undefined;
}

function aggregateTier(factors: RiskFactor[]): RiskTier {
  if (factors.some((f) => CRITICAL_FACTORS.has(f))) return 'alto';
  if (factors.some((f) => MEDIUM_FACTORS.has(f))) return 'medio';
  return 'baixo';
}

function tierToApprovalMode(tier: RiskTier, autoEnabled: boolean): ApprovalMode {
  if (!autoEnabled) return 'human_required';
  if (tier === 'alto') return 'human_required';
  if (tier === 'medio') return 'auto_conditional';
  return 'auto';
}

/**
 * Classifica risco pedagógico/clínico da questão.
 * Conservador: dúvida sobe o tier.
 */
export function scoreQuestaoRisk(
  payload: QuestaoLike,
  context: RiskScoringContext = {},
): RiskResult {
  const factors: RiskFactor[] = [];
  const reasons: string[] = [];
  const text = corpusText(payload);
  const family = resolveFamily(payload);
  const subtopico = payload.meta?.subtopico;
  const sources = payload.meta?.sources ?? [];
  const examVs = payload.meta?.content_review?.exam_vs_current;
  const productionReady = context.productionReady === true;
  const autoEnabled = context.autoApprovalEnabled !== false;
  const hasNumeric = hasAnyNumeric(text);
  const critical = hasCriticalNumeric(text);
  const soft = !critical && hasSoftNumeric(text);

  if (family === 'calc') {
    factors.push('family_high_stakes');
    reasons.push('family=calc — resposta é número; revisão humana obrigatória.');
  } else if (family === 'protocolo' && hasNumeric) {
    factors.push('family_high_stakes');
    reasons.push('family=protocolo com parâmetro numérico — alto risco clínico.');
  } else if (isHighStakesSubtopico(subtopico) && critical) {
    factors.push('family_high_stakes');
    reasons.push(
      `Subtópico de alto risco ("${subtopico}") com dose/parâmetro vital nos slides.`,
    );
  }

  if (critical) {
    if (!factors.includes('numeric_claim_critical')) {
      factors.push('numeric_claim_critical');
    }
    reasons.push(
      'Slides/enunciado afirmam dose ou parâmetro vital (mg/mL/UI/mmHg/bpm/°C/proporção).',
    );
  } else if (soft) {
    factors.push('numeric_claim_soft');
    reasons.push('Claim numérico suave (%, tempo, escore) — amostragem elevada.');
  }

  if (hasNumeric) {
    const withCovers = sources.filter(
      (s) => Array.isArray(s.covers) && s.covers.some((c) => c && c.trim().length > 0),
    );
    if (withCovers.length === 0) {
      factors.push('source_covers_gap');
      reasons.push('Número normativo sem sources[].covers — binding incompleto.');
    }
    const tierBOnly =
      withCovers.length > 0 && withCovers.every((s) => s.tier === 'B');
    if (tierBOnly) {
      factors.push('source_tier_b_on_number');
      reasons.push('Número apoiado só em fonte tier B — exige humano.');
    }
  }

  if (examVs && examVs !== 'none' && examVs.trim().length > 0) {
    // Só sobe risco quando há divergência real (prova ≠ guideline), não nota descritiva.
    const looksLikeDivergence =
      /diverg|≠|!=|desatual|prova\s+antiga|guideline\s+atual|norma\s+atual|conflito|difere/i.test(
        examVs,
      );
    if (looksLikeDivergence) {
      factors.push('exam_vs_current_divergence');
      reasons.push(`Divergência prova × guideline: ${examVs.slice(0, 120)}`);
    }
  }

  if (!productionReady) {
    factors.push('subtopic_immature');
    reasons.push('Pacote ainda não está production_ready — confiança limitada.');
  }

  if (context.branchNovel === true) {
    factors.push('branch_novel');
    reasons.push('Ramo pedagógico sem âncora / cauda longa.');
  }

  if (context.residualPedagogyWarn === true) {
    factors.push('residual_pedagogy_warn');
    reasons.push('Pedagogia v2/v3 passou com warns residuais.');
  }

  const uniqueFactors = [...new Set(factors)];
  const risk_tier = aggregateTier(uniqueFactors);
  const approval_mode = tierToApprovalMode(risk_tier, autoEnabled);

  if (uniqueFactors.length === 0) {
    reasons.push('Sem gatilhos de risco — candidato a auto-aprovação (amostra 5%).');
  }

  if (!autoEnabled && approval_mode === 'human_required') {
    reasons.push('auto_approval.enabled=false no pacote — força revisão humana.');
  }

  return {
    risk_tier,
    approval_mode,
    risk_factors: uniqueFactors,
    reasons,
  };
}

/** true se o apply exige assinatura humana (a4_reviewer não-agente). */
export function requiresHumanApproval(risk: RiskResult): boolean {
  return risk.approval_mode === 'human_required';
}

/**
 * Assinatura humana válida: a4_reviewed + reviewer que NÃO começa com "agent:".
 */
export function hasHumanA4Signature(payload: QuestaoLike): boolean {
  const c = payload.meta?.efficacy_contract;
  if (!c?.a4_reviewed) return false;
  const reviewer = (c.a4_reviewer ?? '').trim();
  if (!reviewer) return false;
  return !/^agent:/i.test(reviewer);
}

/**
 * Gate de apply: alto risco sem assinatura humana → bloquear.
 * Retorna lista de blockers (vazia = ok).
 */
export function assertApprovalGate(
  payload: QuestaoLike,
  risk: RiskResult,
): string[] {
  if (!requiresHumanApproval(risk)) return [];
  if (hasHumanA4Signature(payload)) return [];
  return [
    `risk_tier=${risk.risk_tier}: revisão humana obrigatória antes do apply ` +
      `(factors: ${risk.risk_factors.join(', ') || '—'}). ` +
      `Assine meta.efficacy_contract com a4_reviewed=true e a4_reviewer humano (não agent:).`,
  ];
}

/** Taxa de amostragem sugerida para o tier (quando auto/auto_conditional). */
export function sampleRateForTier(
  tier: RiskTier,
  policy?: AutoApprovalPolicy,
): number {
  if (tier === 'alto') return 1;
  const rates = policy?.sample_rate ?? SAMPLE_RATES_DEFAULT;
  if (tier === 'medio') return rates.medio ?? SAMPLE_RATES_DEFAULT.medio;
  return rates.baixo ?? SAMPLE_RATES_DEFAULT.baixo;
}

/**
 * Sorteia se o slug cai na amostra humana (determinístico por slug opcional).
 */
export function shouldSampleForHumanReview(
  tier: RiskTier,
  policy?: AutoApprovalPolicy,
  slug?: string,
): boolean {
  if (tier === 'alto') return true;
  const rate = sampleRateForTier(tier, policy);
  if (rate <= 0) return false;
  if (rate >= 1) return true;
  if (!slug) return Math.random() < rate;
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return hash % 1000 < Math.round(rate * 1000);
}

/**
 * Monta efficacy_contract parcial a partir do risk score (não persiste sozinho).
 * Em human_required NÃO marca a4_reviewed — evita auto-aprovação indevida.
 */
export function buildEfficacyContractFromRisk(
  risk: RiskResult,
  options?: { reviewerAgent?: string; sampled?: boolean; isoDate?: string },
): EfficacyContract {
  const agent = options?.reviewerAgent ?? 'agent:golden-v2';
  const today = options?.isoDate ?? new Date().toISOString().slice(0, 10);
  const base: EfficacyContract = {
    risk_tier: risk.risk_tier,
    risk_factors: risk.risk_factors,
    approval_mode: risk.approval_mode,
    sampled: options?.sampled === true,
  };

  if (risk.approval_mode === 'human_required') {
    return {
      ...base,
      a4_reviewed: false,
    };
  }

  return {
    ...base,
    a4_reviewed: true,
    a4_reviewer: agent,
    auto_approved_at: today,
  };
}

export const DEFAULT_AUTO_APPROVAL_POLICY: AutoApprovalPolicy = {
  enabled: false,
  default_max_tier_auto: 'medio',
  sample_rate: { ...SAMPLE_RATES_DEFAULT },
  downgrade_on_report_rate_pct: 2,
  last_calibrated_at: null,
};
