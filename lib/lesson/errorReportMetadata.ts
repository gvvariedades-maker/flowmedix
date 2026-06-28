import type { ReverseStudySlide } from '@/types/lesson';

export type LessonErrorReportContext = {
  etapa: string;
  slideAtual: number;
  totalSlides: number;
  questionHash: string;
  selecionada: string | null;
  gabarito: {
    acertou: boolean;
    opcaoCorretaId: string | null;
  } | null;
  meta: {
    topico?: string;
    subtopico?: string;
    banca?: string;
    ano?: string;
  };
  currentSlide?: ReverseStudySlide | null;
};

/** Metadata enviada com reportes de erro — contexto rico para triagem no admin. */
export function buildLessonErrorReportMetadata(ctx: LessonErrorReportContext): Record<string, unknown> {
  const slide = ctx.currentSlide;
  const slideType = slide?.type ?? slide?.layout_type ?? null;

  return {
    etapa: ctx.etapa,
    slide_atual: ctx.slideAtual,
    slide_index: ctx.slideAtual,
    total_slides: ctx.totalSlides,
    slide_type: slideType,
    slide_subtopico: slide?.meta?.subtopico ?? ctx.meta.subtopico ?? null,
    slide_topico: slide?.meta?.topico ?? ctx.meta.topico ?? null,
    question_hash: ctx.questionHash,
    alternativa_selecionada: ctx.selecionada,
    acertou: ctx.gabarito?.acertou ?? null,
    opcao_correta_id: ctx.gabarito?.opcaoCorretaId ?? null,
    meta_topico: ctx.meta.topico ?? null,
    meta_subtopico: ctx.meta.subtopico ?? null,
    meta_banca: ctx.meta.banca ?? null,
    meta_ano: ctx.meta.ano ?? null,
  };
}
