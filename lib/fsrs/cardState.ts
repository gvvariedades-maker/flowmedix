import type { Card, StateType } from 'ts-fsrs';
import { State, TypeConvert } from 'ts-fsrs';

import {
  FSRS_MVP_ALGORITHM,
  FSRS_MVP_CARD_SCHEMA_VERSION,
  FSRS_MVP_PACKAGE_VERSION,
} from './defaults';
import type {
  FsrsMvpCardLearningState,
  FsrsMvpCardState,
  FsrsMvpSerializedCard,
} from './types';

const STATE_TO_STRING: Record<State, FsrsMvpCardLearningState> = {
  [State.New]: 'New',
  [State.Learning]: 'Learning',
  [State.Review]: 'Review',
  [State.Relearning]: 'Relearning',
};

const STRING_TO_STATE: Record<FsrsMvpCardLearningState, State> = {
  New: State.New,
  Learning: State.Learning,
  Review: State.Review,
  Relearning: State.Relearning,
};

const VALID_STATES = new Set<string>(Object.keys(STRING_TO_STATE));

export class FsrsMvpSerializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FsrsMvpSerializationError';
  }
}

function assertFiniteNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new FsrsMvpSerializationError(
      `Campo '${field}' deve ser número finito; recebido ${String(value)}`,
    );
  }
  return value;
}

function assertNonNegative(value: number, field: string): number {
  if (value < 0) {
    throw new FsrsMvpSerializationError(
      `Campo '${field}' deve ser >= 0; recebido ${String(value)}`,
    );
  }
  return value;
}

/** Contadores inteiros do Card ts-fsrs (reps, lapses, dias, learning_steps). */
function assertNonNegativeInteger(value: unknown, field: string): number {
  const n = assertFiniteNumber(value, field);
  assertNonNegative(n, field);
  if (!Number.isInteger(n)) {
    throw new FsrsMvpSerializationError(
      `Campo '${field}' deve ser inteiro não negativo; recebido ${String(value)}`,
    );
  }
  return n;
}

const SERIALIZED_CARD_KEYS = new Set([
  'schemaVersion',
  'algorithm',
  'algorithmVersion',
  'due',
  'stability',
  'difficulty',
  'elapsedDays',
  'scheduledDays',
  'learningSteps',
  'reps',
  'lapses',
  'state',
  'lastReview',
]);

function toIso(value: Date): string {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new FsrsMvpSerializationError('Date inválida ao serializar');
  }
  return value.toISOString();
}

function parseIso(value: unknown, field: string): Date {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new FsrsMvpSerializationError(
      `Campo '${field}' deve ser ISO-8601 string`,
    );
  }
  // Exige instante absoluto com timezone explícito (Z ou offset).
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    throw new FsrsMvpSerializationError(
      `Campo '${field}' não é data ISO com timezone explícito: '${value}'`,
    );
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new FsrsMvpSerializationError(
      `Campo '${field}' não é data ISO válida: '${value}'`,
    );
  }
  return d;
}

function assertValidDateInput(value: Date, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new FsrsMvpSerializationError(`${field} deve ser um Date válido`);
  }
  return value;
}

/** Card `ts-fsrs` → estado MVP (preserva elapsed_days). */
export function cardToMvpState(card: Card): FsrsMvpCardState {
  const state = STATE_TO_STRING[card.state];
  if (!state) {
    throw new FsrsMvpSerializationError(
      `Estado FSRS desconhecido: ${String(card.state)}`,
    );
  }

  const due =
    card.due instanceof Date ? card.due : TypeConvert.time(card.due);
  const last =
    card.last_review == null
      ? null
      : card.last_review instanceof Date
        ? card.last_review
        : TypeConvert.time(card.last_review);

  return {
    due: toIso(due),
    stability: assertFiniteNumber(card.stability, 'stability'),
    difficulty: assertFiniteNumber(card.difficulty, 'difficulty'),
    elapsedDays: assertNonNegativeInteger(card.elapsed_days, 'elapsed_days'),
    scheduledDays: assertNonNegativeInteger(
      card.scheduled_days,
      'scheduled_days',
    ),
    learningSteps: assertNonNegativeInteger(
      card.learning_steps,
      'learning_steps',
    ),
    reps: assertNonNegativeInteger(card.reps, 'reps'),
    lapses: assertNonNegativeInteger(card.lapses, 'lapses'),
    state,
    lastReview: last ? toIso(last) : null,
  };
}

/** Estado MVP → Card `ts-fsrs` (uso interno; não muta `state`). */
export function mvpStateToCard(state: FsrsMvpCardState): Card {
  validateMvpCardState(state);
  const stateInput: StateType = state.state;
  return TypeConvert.card({
    due: parseIso(state.due, 'due'),
    stability: state.stability,
    difficulty: state.difficulty,
    elapsed_days: state.elapsedDays,
    scheduled_days: state.scheduledDays,
    learning_steps: state.learningSteps,
    reps: state.reps,
    lapses: state.lapses,
    state: stateInput,
    last_review: state.lastReview ? parseIso(state.lastReview, 'lastReview') : null,
  });
}

export function validateMvpCardState(state: FsrsMvpCardState): void {
  if (!state || typeof state !== 'object') {
    throw new FsrsMvpSerializationError('Card state ausente');
  }
  parseIso(state.due, 'due');
  assertFiniteNumber(state.stability, 'stability');
  assertFiniteNumber(state.difficulty, 'difficulty');
  assertNonNegativeInteger(state.elapsedDays, 'elapsedDays');
  assertNonNegativeInteger(state.scheduledDays, 'scheduledDays');
  assertNonNegativeInteger(state.learningSteps, 'learningSteps');
  assertNonNegativeInteger(state.reps, 'reps');
  assertNonNegativeInteger(state.lapses, 'lapses');
  if (!VALID_STATES.has(state.state)) {
    throw new FsrsMvpSerializationError(`state inválido: ${String(state.state)}`);
  }
  if (state.lastReview !== null) {
    parseIso(state.lastReview, 'lastReview');
  }
}

export function cloneFsrsMvpCardState(state: FsrsMvpCardState): FsrsMvpCardState {
  validateMvpCardState(state);
  return {
    due: state.due,
    stability: state.stability,
    difficulty: state.difficulty,
    elapsedDays: state.elapsedDays,
    scheduledDays: state.scheduledDays,
    learningSteps: state.learningSteps,
    reps: state.reps,
    lapses: state.lapses,
    state: state.state,
    lastReview: state.lastReview,
  };
}

/** Estado → payload persistível versionado. */
export function serializeFsrsMvpCard(
  state: FsrsMvpCardState,
): FsrsMvpSerializedCard {
  validateMvpCardState(state);
  return {
    schemaVersion: FSRS_MVP_CARD_SCHEMA_VERSION,
    algorithm: FSRS_MVP_ALGORITHM,
    algorithmVersion: FSRS_MVP_PACKAGE_VERSION,
    due: state.due,
    stability: state.stability,
    difficulty: state.difficulty,
    elapsedDays: state.elapsedDays,
    scheduledDays: state.scheduledDays,
    learningSteps: state.learningSteps,
    reps: state.reps,
    lapses: state.lapses,
    state: state.state,
    lastReview: state.lastReview,
  };
}

/** Payload persistível → estado (rejeita schema/algorithm incompatíveis). */
export function deserializeFsrsMvpCard(
  payload: unknown,
): FsrsMvpCardState {
  if (!payload || typeof payload !== 'object') {
    throw new FsrsMvpSerializationError('Payload ausente ou parcial');
  }
  const p = payload as Record<string, unknown>;

  const required = [
    'schemaVersion',
    'algorithm',
    'algorithmVersion',
    'due',
    'stability',
    'difficulty',
    'elapsedDays',
    'scheduledDays',
    'learningSteps',
    'reps',
    'lapses',
    'state',
    'lastReview',
  ] as const;
  for (const key of required) {
    if (!(key in p)) {
      throw new FsrsMvpSerializationError(`Payload parcial: falta '${key}'`);
    }
  }

  // schemaVersion 1: rejeitar extras desconhecidas (sem ignore silencioso).
  for (const key of Object.keys(p)) {
    if (!SERIALIZED_CARD_KEYS.has(key)) {
      throw new FsrsMvpSerializationError(
        `Propriedade desconhecida no schema v1: '${key}'`,
      );
    }
  }

  if (p.schemaVersion !== FSRS_MVP_CARD_SCHEMA_VERSION) {
    throw new FsrsMvpSerializationError(
      `schemaVersion incompatível: ${String(p.schemaVersion)}`,
    );
  }
  if (p.algorithm !== FSRS_MVP_ALGORITHM) {
    throw new FsrsMvpSerializationError(
      `algorithm incompatível: ${String(p.algorithm)}`,
    );
  }
  if (p.algorithmVersion !== FSRS_MVP_PACKAGE_VERSION) {
    throw new FsrsMvpSerializationError(
      `algorithmVersion incompatível: ${String(p.algorithmVersion)}`,
    );
  }
  if (typeof p.state !== 'string' || !VALID_STATES.has(p.state)) {
    throw new FsrsMvpSerializationError(`state inválido: ${String(p.state)}`);
  }
  if (p.lastReview !== null && typeof p.lastReview !== 'string') {
    throw new FsrsMvpSerializationError('lastReview deve ser string ISO ou null');
  }

  const state: FsrsMvpCardState = {
    due: String(p.due),
    stability: assertFiniteNumber(p.stability, 'stability'),
    difficulty: assertFiniteNumber(p.difficulty, 'difficulty'),
    elapsedDays: assertNonNegativeInteger(p.elapsedDays, 'elapsedDays'),
    scheduledDays: assertNonNegativeInteger(p.scheduledDays, 'scheduledDays'),
    learningSteps: assertNonNegativeInteger(p.learningSteps, 'learningSteps'),
    reps: assertNonNegativeInteger(p.reps, 'reps'),
    lapses: assertNonNegativeInteger(p.lapses, 'lapses'),
    state: p.state as FsrsMvpCardLearningState,
    lastReview: p.lastReview as string | null,
  };
  validateMvpCardState(state);
  return state;
}

export { assertValidDateInput, STRING_TO_STATE };
