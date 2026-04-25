/**
 * Ordem canônica das questões no assunto, alinhada a `getQuestoesByAssuntoCached`
 * (Supabase: `order('created_at', { ascending: true })`).
 * Evita começar na "última" questão quando a vitrine reordena por prioridade ou `created_at` desc global.
 */
export function compareModuloCurriculum(
  a: { created_at?: string | null; avant_codigo?: number | null; modulo_slug: string },
  b: { created_at?: string | null; avant_codigo?: number | null; modulo_slug: string },
): number {
  const ca = a.created_at ? new Date(a.created_at).getTime() : 0;
  const cb = b.created_at ? new Date(b.created_at).getTime() : 0;
  if (Number.isFinite(ca) && Number.isFinite(cb) && ca !== cb) {
    return ca - cb;
  }
  const na = a.avant_codigo;
  const nb = b.avant_codigo;
  if (na != null && nb != null && na !== nb) {
    return na - nb;
  }
  if (na != null && nb == null) return -1;
  if (na == null && nb != null) return 1;
  return a.modulo_slug.localeCompare(b.modulo_slug);
}
