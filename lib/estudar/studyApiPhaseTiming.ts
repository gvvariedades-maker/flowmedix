import { logger } from '@/lib/logger';

/** Opt-in DIAG-504: `SCALE_STUDY_API_PHASE_TIMING=1` (staging only; não validado em lib/env — flag operacional). */
export function isStudyApiPhaseTimingEnabled(): boolean {
  return process.env.SCALE_STUDY_API_PHASE_TIMING === '1';
}

export function logStudyApiPhaseTiming(
  event: string,
  fields: Record<string, string | number | boolean | null | undefined>,
): void {
  if (!isStudyApiPhaseTimingEnabled()) return;
  logger.info(event, fields);
}
