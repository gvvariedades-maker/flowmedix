import {
  evaluateAuthenticatedDeniedRpc,
  evaluateCrossUserBlocked,
  evaluateEnrolledModulesVisible,
  evaluateOwnRowsVisible,
  evaluateUnenrolledModulesEmpty,
} from '@/lib/security/rlsAuthSmokeChecks';

describe('rlsAuthSmokeChecks', () => {
  it('evaluateOwnRowsVisible exige linhas próprias', () => {
    const ok = evaluateOwnRowsVisible({
      name: 't',
      rows: [{ id: '1', user_id: 'a' }],
      ownerId: 'a',
      getOwnerId: (r) => r.user_id as string,
      mustIncludeId: '1',
    });
    expect(ok.ok).toBe(true);

    const leak = evaluateOwnRowsVisible({
      name: 't',
      rows: [{ id: '1', user_id: 'b' }],
      ownerId: 'a',
      getOwnerId: (r) => r.user_id as string,
    });
    expect(leak.ok).toBe(false);
  });

  it('evaluateCrossUserBlocked aceita 0 linhas', () => {
    expect(evaluateCrossUserBlocked({ name: 't', rows: [] }).ok).toBe(true);
    expect(evaluateCrossUserBlocked({ name: 't', rows: [{ id: 'x' }] }).ok).toBe(false);
  });

  it('evaluateEnrolledModulesVisible exige count mínimo', () => {
    expect(
      evaluateEnrolledModulesVisible({ name: 't', count: 2, minExpected: 1 }).ok,
    ).toBe(true);
    expect(
      evaluateEnrolledModulesVisible({ name: 't', count: 0, minExpected: 1 }).ok,
    ).toBe(false);
  });

  it('evaluateUnenrolledModulesEmpty', () => {
    expect(evaluateUnenrolledModulesEmpty({ name: 't', count: 0 }).ok).toBe(true);
    expect(evaluateUnenrolledModulesEmpty({ name: 't', count: 3 }).ok).toBe(false);
  });

  it('evaluateAuthenticatedDeniedRpc', () => {
    expect(
      evaluateAuthenticatedDeniedRpc({ name: 't', errorMessage: 'permission denied' }).ok,
    ).toBe(true);
    expect(evaluateAuthenticatedDeniedRpc({ name: 't' }).ok).toBe(false);
  });
});
