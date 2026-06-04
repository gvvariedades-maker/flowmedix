import type { LessonData } from '@/types/lesson';

const LESSON_META_FALLBACK: NonNullable<LessonData['meta']> = {
  banca: 'DESCONHECIDA',
  topico: 'Geral',
  subtopico: 'Geral',
};

/**
 * Garante `meta` e `question_data` mínimos antes de serializar para o player.
 * Evita crash no client quando o JSON legado omite `meta`.
 */
export function ensureLessonDataForPlayer<T extends LessonData>(dados: T): T {
  const question_data = dados?.question_data ?? { instruction: '', options: [] };
  const meta = dados?.meta ?? LESSON_META_FALLBACK;
  return { ...dados, meta, question_data };
}

/** Payload inválido para exibir questão (sem alternativas). */
export function lessonDataHasPlayableQuestion(dados: LessonData): boolean {
  const options = dados?.question_data?.options;
  return Array.isArray(options) && options.length > 0;
}

/** Alternativa exposta ao cliente em modo live (sem gabarito). */
export type QuestionOptionClient = {
  id: string;
  text: string;
};

export type GabaritoTentativa = {
  acertou: boolean;
  opcaoCorretaId: string;
};

type ConteudoJsonLike = {
  question_data?: {
    options?: Array<{ id?: string; is_correct?: boolean }>;
  };
};

/**
 * Remove `is_correct` das alternativas antes de serializar para o Client Component.
 * Slides e meta permanecem intactos.
 */
export function stripQuestionAnswersForClient<T extends LessonData>(dados: T): T {
  if (!dados?.question_data?.options) return dados;

  return {
    ...dados,
    question_data: {
      ...dados.question_data,
      options: dados.question_data.options.map(({ id, text }) => ({ id, text })),
    },
  };
}

/**
 * Payload mínimo para o runner de simulado: sem gabarito, sem NeuroSlides.
 */
export function stripQuestionForSimulado<T extends LessonData>(dados: T): T {
  const slim = stripQuestionAnswersForClient(dados);
  const { reverse_study_slides, study_slides, ...rest } = slim as T & {
    reverse_study_slides?: unknown;
    study_slides?: unknown;
  };
  return rest as T;
}

/** Retorna o id da alternativa correta no JSON completo da questão. */
export function findCorrectOptionId(conteudoJson: unknown): string | null {
  const options = (conteudoJson as ConteudoJsonLike)?.question_data?.options;
  if (!Array.isArray(options)) return null;

  const correct = options.find((option) => option?.is_correct === true);
  return typeof correct?.id === 'string' && correct.id.length > 0 ? correct.id : null;
}

/**
 * Valida a opção escolhida e calcula acerto no servidor (fonte de verdade).
 * Retorna null se o JSON estiver inválido ou a opção não existir.
 */
export function resolveQuestionAttempt(
  conteudoJson: unknown,
  opcaoId: string,
): GabaritoTentativa | null {
  const opcaoCorretaId = findCorrectOptionId(conteudoJson);
  if (!opcaoCorretaId) return null;

  const options = (conteudoJson as ConteudoJsonLike)?.question_data?.options ?? [];
  const validIds = options
    .map((option) => option?.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  if (!validIds.includes(opcaoId)) return null;

  return {
    acertou: opcaoId === opcaoCorretaId,
    opcaoCorretaId,
  };
}
