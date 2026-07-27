import type { FsrsMvpRating } from './types';

/**
 * Política binária do MVP: incorreta → Again; correta → Good.
 * Never emits Hard/Easy.
 *
 * `isCorrect` no R3 deve vir do servidor (`resolveQuestionAttempt`) — R1 não deriva.
 */
export function mapCorrectToRating(isCorrect: boolean): FsrsMvpRating {
  return isCorrect ? 'good' : 'again';
}

/** Guardrail: ratings permitidos no wire MVP. */
export function isFsrsMvpRating(value: unknown): value is FsrsMvpRating {
  return value === 'again' || value === 'good';
}
