import {
  Rating,
  createEmptyCard,
  fsrs,
  generatorParameters,
  type Grade,
} from 'ts-fsrs';

import {
  assertValidDateInput,
  cardToMvpState,
  cloneFsrsMvpCardState,
  mvpStateToCard,
  serializeFsrsMvpCard,
} from './cardState';
import {
  FSRS_MVP_ALGORITHM_VERSION_LABEL,
  FSRS_MVP_DEFAULT_REQUEST_RETENTION,
  FSRS_MVP_ENABLE_FUZZ,
  FSRS_MVP_PACKAGE_VERSION,
} from './defaults';
import { isFsrsMvpRating } from './rating';
import type {
  FsrsMvpConfig,
  FsrsMvpRating,
  FsrsMvpReviewInput,
  FsrsMvpReviewOutput,
  FsrsMvpScheduler,
} from './types';

const RATING_TO_GRADE: Record<FsrsMvpRating, Grade> = {
  again: Rating.Again,
  good: Rating.Good,
};

export type CreateFsrsMvpSchedulerOptions = {
  requestRetention?: number;
  maximumIntervalDays?: number;
};

function assertRetention(value: number): void {
  if (!(value > 0 && value <= 1) || !Number.isFinite(value)) {
    throw new Error(
      `requestRetention deve estar em (0, 1]; recebido ${String(value)}`,
    );
  }
}

/**
 * Cria scheduler FSRS encapsulado.
 * `enable_fuzz: false` para determinismo no MVP.
 * Sem relógio oculto: `createInitialCard` e `review` exigem Date explícita.
 */
export function createFsrsScheduler(
  options: CreateFsrsMvpSchedulerOptions = {},
): FsrsMvpScheduler {
  const requestRetention =
    options.requestRetention ?? FSRS_MVP_DEFAULT_REQUEST_RETENTION;
  assertRetention(requestRetention);

  const params = generatorParameters({
    request_retention: requestRetention,
    enable_fuzz: FSRS_MVP_ENABLE_FUZZ,
    ...(options.maximumIntervalDays !== undefined
      ? { maximum_interval: options.maximumIntervalDays }
      : {}),
  });

  const engine = fsrs(params);

  const config: FsrsMvpConfig = {
    requestRetention: params.request_retention,
    maximumIntervalDays: params.maximum_interval,
    algorithmVersion: FSRS_MVP_ALGORITHM_VERSION_LABEL,
    packageVersion: FSRS_MVP_PACKAGE_VERSION,
  };

  return {
    config: Object.freeze({ ...config }),

    createInitialCard(now: Date) {
      assertValidDateInput(now, 'now');
      // Cópia do instante: evita mutação se o caller alterar o Date depois.
      const instant = new Date(now.getTime());
      return cardToMvpState(createEmptyCard(instant));
    },

    review(input: FsrsMvpReviewInput): FsrsMvpReviewOutput {
      if (!isFsrsMvpRating(input.rating)) {
        throw new Error(
          `Rating FSRS MVP inválido: ${String(input.rating)} (somente again|good)`,
        );
      }
      assertValidDateInput(input.reviewedAt, 'reviewedAt');
      const reviewedAt = new Date(input.reviewedAt.getTime());

      const stateBefore = input.card ? cloneFsrsMvpCardState(input.card) : null;

      // Clona card da lib para evitar mutação do estado de entrada pelo ts-fsrs.
      const libCard = input.card
        ? mvpStateToCard(cloneFsrsMvpCardState(input.card))
        : createEmptyCard(reviewedAt);

      const grade = RATING_TO_GRADE[input.rating];
      const { card: nextCard } = engine.next(libCard, reviewedAt, grade);
      const stateAfter = cardToMvpState(nextCard);

      return {
        card: stateAfter,
        due: new Date(stateAfter.due),
        scheduledDays: stateAfter.scheduledDays,
        stateBefore,
        stateAfter,
        rating: input.rating,
        algorithmVersion: FSRS_MVP_ALGORITHM_VERSION_LABEL,
        serialized: serializeFsrsMvpCard(stateAfter),
      };
    },
  };
}
