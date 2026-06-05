import type { AvantLessonPlayerProps } from '@/types/lesson';

/**
 * Marca `estudada: true` na entrada de `questoesDoAssunto` do slug informado (patch otimista pós concluir estudo).
 */
export function patchQuestaoEstudadaInPayload(
  payload: AvantLessonPlayerProps,
  slug: string,
): AvantLessonPlayerProps {
  const target = slug.trim();
  const lista = payload.questoesDoAssunto;
  if (!target || !lista?.length) return payload;
  if (!lista.some((q) => q.slug === target)) return payload;

  return {
    ...payload,
    questoesDoAssunto: lista.map((q) =>
      q.slug === target ? { ...q, estudada: true } : q,
    ),
  };
}
