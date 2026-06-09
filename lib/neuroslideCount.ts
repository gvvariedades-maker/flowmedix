/**
 * Contagem de NeuroSlides em `conteudo_json` — mesma regra de `avant_catalog_stats` e da RPC da vitrine.
 */
export function countNeuroSlidesInConteudoJson(raw: unknown): number {
  if (!raw || typeof raw !== 'object') return 0;
  const o = raw as Record<string, unknown>;
  const reverse = o.reverse_study_slides;
  if (Array.isArray(reverse) && reverse.length > 0) return reverse.length;
  const study = o.study_slides;
  if (Array.isArray(study) && study.length > 0) return study.length;
  return 0;
}
