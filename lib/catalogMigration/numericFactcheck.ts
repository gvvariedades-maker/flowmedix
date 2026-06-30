/**
 * Camada 2b — factcheck numérico contra guidelines versionadas.
 */
import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import { getGuidelineForSubtopico } from '@/lib/guidelines';
import type { GuidelineEntry } from '@/lib/guidelines/types';
import { NUMERIC_CLAIM_RE } from '@/lib/goldenContentStandard';
import type { GoldenMetaExtensions } from '@/lib/goldenContentStandard';

export type FactcheckSeverity = 'error' | 'warn';

export type NumericFactcheckIssue = {
  code: string;
  message: string;
  severity: FactcheckSeverity;
  claim?: string;
  path?: string;
};

type SlideLike = Record<string, unknown>;

function collectSlideStrings(node: unknown): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(collectSlideStrings).join(' ');
  if (node && typeof node === 'object') {
    return Object.values(node as Record<string, unknown>).map(collectSlideStrings).join(' ');
  }
  return '';
}

/** Normaliza notação científica, razões e unidades para comparação. */
export function normalizeNumericToken(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/⁻⁶|10-6|10\^-6/gi, '1e-6')
    .replace(/⁻³|10-3/gi, '1e-3')
    .replace(/[.:]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

const CLAIM_EXTRACT_RE =
  /10[⁻\-]?\s*6|1\s*:\s*1[.\s]?\d{3,}|1\s*:\s*\d{3,}|\d+([.,]\d+)?\s*(%|mg|ml|mcg|µg|ug|ui|g\b|kg|°c|graus|mmhg|bpm|min|minutos|hora|horas|dia|dias|semana|semanas)/gi;

/** Extrai claims numéricos dos slides. */
export function extractNumericClaims(slides: SlideLike[]): string[] {
  const text = collectSlideStrings(slides);
  const matches = text.match(CLAIM_EXTRACT_RE) ?? [];
  return [...new Set(matches.map((m) => m.trim()).filter(Boolean))];
}

function parseRatioDigits(claim: string): string | null {
  const m = claim.match(/1\s*:\s*([\d.,]+)/);
  if (!m) return null;
  return m[1].replace(/[.,]/g, '');
}

function entryMatchesClaim(entry: GuidelineEntry, claim: string): boolean {
  const normClaim = normalizeNumericToken(claim);
  const valueHay = normalizeNumericToken(entry.value);

  const claimRatio = parseRatioDigits(claim);
  const entryRatio = parseRatioDigits(entry.value);
  if (claimRatio && entryRatio) {
    return claimRatio === entryRatio;
  }

  if (valueHay.includes(normClaim) || normClaim.includes(valueHay)) return true;

  if (/sal|10-6|1e-6/i.test(normClaim) && /sal|10-6|1e-6|1000000/i.test(valueHay)) return true;
  if (/121/.test(normClaim) && /121/.test(valueHay)) return true;
  if (/30dia/i.test(normClaim) && /30/.test(entry.value)) return true;

  const claimDigits = normClaim.replace(/\D/g, '');
  const valueDigits = valueHay.replace(/\D/g, '');
  if (claimDigits.length >= 4 && claimDigits === valueDigits) return true;

  return false;
}

/** Busca entry na guideline do subtópico que cobre o claim. */
export function matchClaimToGuideline(
  subtopico: string,
  claim: string,
): GuidelineEntry | null {
  const table = getGuidelineForSubtopico(subtopico);
  if (!table) return null;

  for (const entry of table.entries) {
    if (entryMatchesClaim(entry, claim)) return entry;
  }
  return null;
}

function isNormativeExplicitClaim(claim: string): boolean {
  return (
    NUMERIC_CLAIM_RE.test(claim) ||
    /10[⁻\-]?6|sal|rdc|121|30\s*dia|1\s*:\s*\d/i.test(claim)
  );
}

function severityForFamily(
  family: FamilyId | undefined,
  code: 'mismatch' | 'unsourced',
): FactcheckSeverity {
  if (code === 'unsourced') return 'warn';

  switch (family) {
    case 'protocolo':
    case 'calc':
      return 'error';
    case 'legis':
      return 'warn';
    case 'vf':
    case 'conceito':
    case 'certo_errado':
      return 'error';
    default:
      return 'warn';
  }
}

export type LintNumericFactcheckOptions = {
  examVsCurrent?: string;
};

/**
 * Verifica claims numéricos nos slides contra guideline do subtópico.
 * Política exam_vs_current: mismatch vira warn se documentado.
 */
export function lintNumericFactcheck(
  payload: unknown,
  options: LintNumericFactcheckOptions = {},
): NumericFactcheckIssue[] {
  const q = payload as {
    meta?: GoldenMetaExtensions & { subtopico?: string; family?: FamilyId };
    reverse_study_slides?: SlideLike[];
    study_slides?: SlideLike[];
  };

  const subtopico = q.meta?.subtopico?.trim();
  if (!subtopico) return [];

  const slides = q.reverse_study_slides ?? q.study_slides ?? [];
  if (!Array.isArray(slides) || slides.length === 0) return [];

  const claims = extractNumericClaims(slides);
  if (claims.length === 0) return [];

  const family = q.meta?.family;
  const examVsCurrent =
    options.examVsCurrent ?? q.meta?.content_review?.exam_vs_current ?? 'none';
  const examDivergence = examVsCurrent !== 'none' && examVsCurrent !== undefined;

  const issues: NumericFactcheckIssue[] = [];
  const slideText = collectSlideStrings(slides);
  const hasNumericInSlides = NUMERIC_CLAIM_RE.test(slideText);
  const hasSubstantiveSource = (q.meta?.sources ?? []).some(
    (s) => Array.isArray(s.covers) && s.covers.some((c) => c?.trim()),
  );

  if (hasNumericInSlides && !hasSubstantiveSource) {
    issues.push({
      code: 'numeric_claim_unsourced',
      message: 'Claim numérico nos slides sem source substantiva (meta.sources[].covers).',
      severity: 'warn',
      path: 'meta.sources',
    });
  }

  for (const claim of claims) {
    const matched = matchClaimToGuideline(subtopico, claim);
    if (matched) continue;

    const explicit = isNormativeExplicitClaim(claim);
    if (!explicit && family !== 'protocolo' && family !== 'calc') continue;

    let severity = severityForFamily(family, 'mismatch');
    if (examDivergence) severity = 'warn';

    issues.push({
      code: 'numeric_fact_mismatch',
      message: `Claim "${claim}" não encontrado na guideline de ${subtopico}.`,
      severity,
      claim,
      path: 'reverse_study_slides',
    });
  }

  return issues;
}

export function numericFactcheckHasErrors(issues: NumericFactcheckIssue[]): boolean {
  return issues.some((i) => i.severity === 'error');
}
