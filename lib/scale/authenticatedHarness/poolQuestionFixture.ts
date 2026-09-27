import { resolveQuestionAttempt } from '@/lib/estudar/questionPayload';

type ConteudoJsonLike = {
  question_data?: {
    options?: Array<{ id?: string; is_correct?: boolean }>;
  };
};

/** Primeira alternativa válida do JSON (para POST registrar-tentativa / simulado). */
export function pickHarnessOpcaoIdFromConteudo(conteudoJson: unknown): string | null {
  const options = (conteudoJson as ConteudoJsonLike)?.question_data?.options;
  if (!Array.isArray(options)) return null;
  for (const option of options) {
    const id = option?.id?.trim();
    if (id && resolveQuestionAttempt(conteudoJson, id)) {
      return id;
    }
  }
  return null;
}

export function isHarnessOpcaoIdValid(conteudoJson: unknown, opcaoId: string): boolean {
  const trimmed = opcaoId.trim();
  if (!trimmed) return false;
  return resolveQuestionAttempt(conteudoJson, trimmed) !== null;
}
