import {
  StudyApiPhaseTimer,
  isStudyApiPhaseTimingEnabled,
  logStudyApiPhaseTiming,
} from '@/lib/estudar/studyApiPhaseTiming';
import { DataServiceUnavailableError } from '@/lib/dataServiceError';
import { logger } from '@/lib/logger';

describe('studyApiPhaseTiming', () => {
  const prev = process.env.SCALE_STUDY_API_PHASE_TIMING;

  afterEach(() => {
    process.env.SCALE_STUDY_API_PHASE_TIMING = prev;
    jest.restoreAllMocks();
  });

  it('is disabled unless SCALE_STUDY_API_PHASE_TIMING=1', () => {
    delete process.env.SCALE_STUDY_API_PHASE_TIMING;
    expect(isStudyApiPhaseTimingEnabled()).toBe(false);
    process.env.SCALE_STUDY_API_PHASE_TIMING = '1';
    expect(isStudyApiPhaseTimingEnabled()).toBe(true);
  });

  it('logs only when flag is on (warn level for Vercel preview)', () => {
    const warn = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    delete process.env.SCALE_STUDY_API_PHASE_TIMING;
    logStudyApiPhaseTiming('study_api_phase', { phase: 'auth' });
    expect(warn).not.toHaveBeenCalled();

    process.env.SCALE_STUDY_API_PHASE_TIMING = '1';
    logStudyApiPhaseTiming('study_api_phase', { phase: 'auth' });
    expect(warn).toHaveBeenCalledWith('study_api_phase', { phase: 'auth' });
  });

  it('emits start/end per phase with shared request_id', () => {
    process.env.SCALE_STUDY_API_PHASE_TIMING = '1';
    const warn = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const timer = new StudyApiPhaseTimer({
      slug: 'slug-a',
      requestId: 'req-correlation-1',
    });

    timer.phaseStart('auth');
    timer.phaseEnd('auth');
    timer.phaseStart('entitlement');
    timer.phaseEnd('entitlement');

    expect(warn).toHaveBeenCalledTimes(4);
    const requestIds = warn.mock.calls.map((c) => (c[1] as { request_id: string }).request_id);
    expect(new Set(requestIds)).toEqual(new Set(['req-correlation-1']));

    const endPhases = warn.mock.calls
      .filter((c) => (c[1] as { boundary: string }).boundary === 'end')
      .map((c) => (c[1] as { phase: string }).phase);
    expect(endPhases).toEqual(['auth', 'entitlement']);
  });

  it('logRouteFailure records last_completed_phase without PII fields', () => {
    process.env.SCALE_STUDY_API_PHASE_TIMING = '1';
    const warn = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const timer = new StudyApiPhaseTimer({ slug: 'slug-b', requestId: 'req-fail-1' });
    timer.phaseStart('modulo_fetch');
    timer.phaseEnd('modulo_fetch');
    timer.logRouteFailure(new DataServiceUnavailableError());

    const failureCall = warn.mock.calls.find((c) => c[0] === 'study_api_phase_failure');
    expect(failureCall).toBeDefined();
    const fields = failureCall![1] as Record<string, unknown>;
    expect(fields).toMatchObject({
      request_id: 'req-fail-1',
      slug: 'slug-b',
      last_completed_phase: 'modulo_fetch',
      error_class: 'DataServiceUnavailableError',
    });
    expect(fields).not.toHaveProperty('userId');
    expect(fields).not.toHaveProperty('token');
  });
});
