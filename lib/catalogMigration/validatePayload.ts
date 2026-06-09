import {
  QuestaoCompletaSchema,
  payloadContainsTecconcursosReference,
} from '@/lib/validations';
import { normalizeQuestaoSlideArrays } from '@/lib/reverseStudySlidesNormalize';
import type { z } from 'zod';

export type ValidatedQuestao = z.infer<typeof QuestaoCompletaSchema>;

export function correctOptionId(payload: unknown): string | null {
  const opts = (payload as { question_data?: { options?: { id: string; is_correct: boolean }[] } })
    ?.question_data?.options;
  return opts?.find((o) => o.is_correct)?.id ?? null;
}

export function validateAndNormalizeQuestao(
  moduloSlug: string,
  raw: unknown,
): { ok: true; data: ValidatedQuestao } | { ok: false; reason: string } {
  if (payloadContainsTecconcursosReference(raw)) {
    return { ok: false, reason: 'referência TecConcursos' };
  }

  const normalized = normalizeQuestaoSlideArrays(
    typeof raw === 'object' && raw !== null ? { ...(raw as object) } : raw,
  );
  const parsed = QuestaoCompletaSchema.safeParse(normalized);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    return { ok: false, reason: `Zod inválido — ${msg}` };
  }

  const data = parsed.data;
  if (!data.meta.subtopico) data.meta.subtopico = data.meta.topico || 'Geral';

  return {
    ok: true,
    data: {
      ...data,
      modulo_slug: moduloSlug,
    } as ValidatedQuestao & { modulo_slug: string },
  };
}

export function buildConteudoJson(data: ValidatedQuestao, moduloSlug: string) {
  return {
    ...data,
    modulo_slug: moduloSlug,
  };
}
