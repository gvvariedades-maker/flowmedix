import type { VitrineListQuery } from '@/lib/vitrine/parseListQuery';

export type VitrineEstudarQueryInput = Pick<
  VitrineListQuery,
  'bancas' | 'assuntos' | 'q' | 'page'
>;

/**
 * Query repassada ao abrir questão e ao prefetch — mesma forma que a URL da vitrine
 * (`banca`/`assunto` singulares, `q`, `page`).
 * Usar o mesmo `q` da lista carregada (debounced) para paridade vitrine ↔ player.
 */
export function buildVitrineEstudarQuery(input: VitrineEstudarQueryInput): string {
  const p = new URLSearchParams();
  input.bancas.forEach((b) => p.append('banca', b));
  input.assuntos.forEach((a) => p.append('assunto', a));
  const q = input.q?.trim();
  if (q) p.set('q', q);
  if (input.page > 1) p.set('page', String(input.page));
  const s = p.toString();
  return s ? `?${s}` : '';
}

/** Monta slug+query para prefetch (`firstSlug` + contexto de filtros). */
export function buildVitrineSlugComQueryFromList(
  slug: string,
  listQuery: VitrineEstudarQueryInput,
): string {
  return `${slug}${buildVitrineEstudarQuery(listQuery)}`;
}
