/**
 * Gate L2 — enunciado referencia figura/tirinha/charge/HQ sem asset nem transcrição.
 * @see docs/DECISAO_QUESTAO_FIGURES.md
 */
import {
  hasUsefulFigureTranscription,
  hasValidQuestaoFigures,
  type QuestaoFigure,
  type QuestaoFigurePolicy,
} from '@/lib/questaoFigures';

/** Referência visual explícita no enunciado (word-boundary onde aplicável). */
export const EXPLICIT_VISUAL_RE =
  /(\bfigura\b|\btirinha\b|\bcharge\b|\bcartaz\b|\bcartum\b|\bquadrinhos?\b|\bHQ\b|imagem acima|quadro acima|na figura|história em quadrinhos|historia em quadrinhos|história em hq|historia em hq)/i;

/** Sequência visual (N-ésimo quadro/quadrinho) — típico de HQ/tirinha em prova. */
export const VISUAL_SEQUENCE_RE =
  /\b(primeir[oa]|segund[oa]|terceir[oa]|quart[oa]|quint[oa]|últim[oa]|ultim[oa])\s+(quadro|quadrinho|painel|lâmina|lamina)\b/i;

/** Placeholder de handcraft sem asset — proibido em produção. */
export const FIGURE_HANDCRAFT_STUB_RE =
  /\(HQ em quadrinhos|\((?:HQ|tirinha|charge|cartum|cartaz|figura)[^)]*(?:adaptad[oa]|placeholder|ilustra)[^)]*\)/i;

/** Legado — mantido para imports existentes. */
export const NEEDS_FIGURE_RE = EXPLICIT_VISUAL_RE;

export type FigureContractIssue = {
  code: 'l2_missing_figure';
  message: string;
};

export type QuestaoFigurePayload = {
  question_data?: {
    instruction?: string;
    text_fragment?: string | null;
    figure_policy?: QuestaoFigurePolicy;
    figures?: QuestaoFigure[];
  };
};

export function instructionReferencesFigure(instruction: string): boolean {
  const text = String(instruction ?? '').trim();
  if (!text) return false;
  return (
    EXPLICIT_VISUAL_RE.test(text) ||
    VISUAL_SEQUENCE_RE.test(text) ||
    FIGURE_HANDCRAFT_STUB_RE.test(text)
  );
}

export function detectMissingFigure(questao: QuestaoFigurePayload): FigureContractIssue | null {
  const instruction = String(questao.question_data?.instruction ?? '');
  if (!instructionReferencesFigure(instruction)) return null;

  const policy = questao.question_data?.figure_policy;
  const figures = questao.question_data?.figures;
  const fragment = questao.question_data?.text_fragment;

  if (hasValidQuestaoFigures(figures)) return null;
  if (policy === 'transcribed' && hasUsefulFigureTranscription(fragment)) return null;

  const hint =
    policy === 'required'
      ? 'figure_policy=required exige figures[] com URL Supabase Storage.'
      : 'Adicione figures[] (WebP no bucket questao-figures) ou figure_policy=transcribed com text_fragment fiel.';

  return {
    code: 'l2_missing_figure',
    message: `Enunciado referencia figura/tirinha/charge/HQ/quadrinho sem asset nem transcrição válida. ${hint}`,
  };
}
