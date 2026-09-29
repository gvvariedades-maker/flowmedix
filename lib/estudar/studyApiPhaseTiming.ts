import { randomUUID } from 'crypto';
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

export type StudyApiPhaseName =
  | 'auth'
  | 'entitlement'
  | 'modulo_fetch'
  | 'nav_catalog'
  | 'payload';

const STUDY_API_QUESTAO_ROUTE = '/api/estudar/questao';

export class StudyApiPhaseTimer {
  readonly requestId: string;
  readonly slug: string;
  readonly route: string;
  private readonly routeStartedAt: number;
  private lastCompletedPhase: StudyApiPhaseName | null = null;
  private readonly phaseStartedAt = new Map<StudyApiPhaseName, number>();

  constructor(opts: { slug: string; route?: string; requestId?: string }) {
    this.requestId = opts.requestId ?? randomUUID();
    this.slug = opts.slug;
    this.route = opts.route ?? STUDY_API_QUESTAO_ROUTE;
    this.routeStartedAt = Date.now();
  }

  phaseStart(phase: StudyApiPhaseName): void {
    this.phaseStartedAt.set(phase, Date.now());
    logStudyApiPhaseTiming('study_api_phase', {
      request_id: this.requestId,
      slug: this.slug,
      route: this.route,
      phase,
      boundary: 'start',
    });
  }

  phaseEnd(
    phase: StudyApiPhaseName,
    extra?: Record<string, string | number | boolean | null | undefined>,
  ): void {
    const started = this.phaseStartedAt.get(phase) ?? Date.now();
    const elapsed_ms = Date.now() - started;
    this.lastCompletedPhase = phase;
    logStudyApiPhaseTiming('study_api_phase', {
      request_id: this.requestId,
      slug: this.slug,
      route: this.route,
      phase,
      boundary: 'end',
      elapsed_ms,
      ...extra,
    });
  }

  logRouteFailure(error: unknown): void {
    const error_class =
      error instanceof Error ? error.constructor.name : typeof error === 'string' ? 'string' : 'Unknown';
    logStudyApiPhaseTiming('study_api_phase_failure', {
      request_id: this.requestId,
      slug: this.slug,
      route: this.route,
      last_completed_phase: this.lastCompletedPhase,
      route_total_ms: Date.now() - this.routeStartedAt,
      error_class,
    });
  }
}
