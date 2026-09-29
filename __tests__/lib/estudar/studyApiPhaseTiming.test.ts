import { isStudyApiPhaseTimingEnabled, logStudyApiPhaseTiming } from '@/lib/estudar/studyApiPhaseTiming';
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

  it('logs only when flag is on', () => {
    const info = jest.spyOn(logger, 'info').mockImplementation(() => {});
    delete process.env.SCALE_STUDY_API_PHASE_TIMING;
    logStudyApiPhaseTiming('study_api_route_timing', { auth_ms: 12 });
    expect(info).not.toHaveBeenCalled();

    process.env.SCALE_STUDY_API_PHASE_TIMING = '1';
    logStudyApiPhaseTiming('study_api_route_timing', { auth_ms: 12 });
    expect(info).toHaveBeenCalledWith('study_api_route_timing', { auth_ms: 12 });
  });
});
