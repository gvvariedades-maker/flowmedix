import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import type { GuidelineTable } from '@/lib/guidelines';

export type ConfidenceInput = {
  attempts: number;
  family: FamilyId;
  guideline: GuidelineTable | null;
  factViolations: number;
  writeWarnings: number;
  premiumSubtopico: boolean;
};

/** Score 0–100 — heurística para priorizar revisão humana. */
export function scoreConfidence(input: ConfidenceInput): number {
  let score = 100;

  if (input.attempts > 1) score -= (input.attempts - 1) * 12;
  if (input.factViolations > 0) score -= 25;
  if (input.writeWarnings > 0) score -= Math.min(input.writeWarnings * 4, 20);
  if (!input.guideline) score -= 8;
  if (input.premiumSubtopico && input.attempts > 2) score -= 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}
