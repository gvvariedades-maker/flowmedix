/**
 * FSRS MVP — contratos R1 + persistência R2 (server-only adapters).
 *
 * @see docs/DECISAO_REVISAO_FSRS_MVP.md
 * @see docs/R2_PERSISTENCIA_FSRS_MVP_CONVERSA.md
 * @see lib/fsrs/README.md
 */

export {
  FSRS_MVP_ALGORITHM,
  FSRS_MVP_ALGORITHM_VERSION_LABEL,
  FSRS_MVP_CARD_SCHEMA_VERSION,
  FSRS_MVP_DEFAULT_MIN_CLUSTER_INVENTORY,
  FSRS_MVP_DEFAULT_REQUEST_RETENTION,
  FSRS_MVP_ENABLE_FUZZ,
  FSRS_MVP_PACKAGE_VERSION,
  FSRS_MVP_REVIEW_UNIT_PREFIX,
} from './defaults';

export { createFsrsScheduler } from './adapter';
export type { CreateFsrsMvpSchedulerOptions } from './adapter';

export { mapCorrectToRating, isFsrsMvpRating } from './rating';

export {
  normalizeReviewUnitToken,
  escapeReviewUnitToken,
  resolveReviewUnitId,
} from './reviewUnit';

export {
  isFsrsAttemptContext,
  isFsrsEligibleAttempt,
  planFsrsRating,
} from './eligibility';

export {
  FsrsMvpSerializationError,
  cardToMvpState,
  cloneFsrsMvpCardState,
  deserializeFsrsMvpCard,
  mvpStateToCard,
  serializeFsrsMvpCard,
  validateMvpCardState,
} from './cardState';

export type {
  FsrsAttemptContext,
  FsrsMvpCardLearningState,
  FsrsMvpCardState,
  FsrsMvpConfig,
  FsrsMvpEligibilityInput,
  FsrsMvpEligibilityResult,
  FsrsMvpIneligibilityReason,
  FsrsMvpRating,
  FsrsMvpRatingPlanInput,
  FsrsMvpRatingPlanResult,
  FsrsMvpResolveReviewUnitInput,
  FsrsMvpResolveReviewUnitResult,
  FsrsMvpReviewInput,
  FsrsMvpReviewOutput,
  FsrsMvpReviewUnitKind,
  FsrsMvpScheduler,
  FsrsMvpSerializedCard,
} from './types';

export { FSRS_ATTEMPT_CONTEXTS } from './types';

export type {
  FsrsInvalidStateReason,
  FsrsPersistReviewInput,
  FsrsPersistReviewResult,
  FsrsPersistableContext,
  FsrsReviewPersistence,
  FsrsWriteStatus,
  SpacedReviewCardRow,
  SpacedReviewLogRow,
} from './persistenceTypes';

export {
  canonicalizeFingerprintPayload,
  computeSemanticFingerprint,
  normalizeReviewedAtIso,
} from './fingerprint';
export type { FsrsFingerprintInput } from './fingerprint';

export { createFsrsReviewPersistence } from './persistence';
export type { FsrsPersistRpcClient } from './persistence';

// createSupabaseFsrsPersistence: importar de `@/lib/fsrs/supabasePersistence`
// (tem `import 'server-only'` — não reexportar aqui para não contaminar o barrel R1).
