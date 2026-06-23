import {
  formatQuestaoWriteErrors,
  validateQuestaoForWrite,
  type ValidatedQuestao,
} from '@/lib/questaoSpec';

export type { ValidatedQuestao };

export function correctOptionId(payload: unknown): string | null {
  const opts = (payload as { question_data?: { options?: { id: string; is_correct: boolean }[] } })
    ?.question_data?.options;
  return opts?.find((o) => o.is_correct)?.id ?? null;
}

export function validateAndNormalizeQuestao(
  moduloSlug: string,
  raw: unknown,
): { ok: true; data: ValidatedQuestao } | { ok: false; reason: string } {
  const result = validateQuestaoForWrite(raw, {
    moduloSlug,
    premiumGate: false,
    goldenLint: false,
  });

  if (!result.ok) {
    return { ok: false, reason: formatQuestaoWriteErrors(result.errors) };
  }

  return { ok: true, data: result.data };
}

export function buildConteudoJson(data: ValidatedQuestao, moduloSlug: string) {
  return {
    ...data,
    modulo_slug: moduloSlug,
  };
}
