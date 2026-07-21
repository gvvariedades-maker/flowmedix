/** Helpers de Storage para figuras de enunciado. */
export const QUESTAO_FIGURES_BUCKET = 'questao-figures';

export function buildQuestaoFigureStoragePath(tecId: string, figureId = 'f1'): string {
  return `${tecId}/${figureId}.webp`;
}

export function buildPublicQuestaoFigureUrl(tecId: string, figureId = 'f1'): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  if (!base) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurada');
  }
  const path = buildQuestaoFigureStoragePath(tecId, figureId);
  return `${base}/storage/v1/object/public/${QUESTAO_FIGURES_BUCKET}/${path}`;
}
