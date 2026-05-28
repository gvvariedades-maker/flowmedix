import type { SimuladoQuestaoItem } from '@/lib/simulado/types';

export function findFirstPendingSlug(questoes: SimuladoQuestaoItem[]): string | null {
  return questoes.find((q) => !q.respondida)?.modulo_slug ?? null;
}

/** Próximas questões pendentes na ordem do simulado (exclui a ativa). */
export function getSimuladoPrefetchSlugs(
  questoes: SimuladoQuestaoItem[],
  activeSlug: string,
  depth = 2,
): string[] {
  if (depth <= 0) return [];

  const slugs: string[] = [];
  for (const item of questoes) {
    if (item.modulo_slug === activeSlug) continue;
    if (item.respondida) continue;
    slugs.push(item.modulo_slug);
    if (slugs.length >= depth) break;
  }
  return slugs;
}
