/**
 * @jest-environment node
 */
import { mapAssuranceLevelToState, getAdminAssuranceLevel } from '@/lib/admin/adminAssurance';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('mapAssuranceLevelToState', () => {
  it('mapeia aal2 -> AAL2_VERIFIED independente de nextLevel', () => {
    expect(mapAssuranceLevelToState('aal2', 'aal2')).toBe('AAL2_VERIFIED');
    expect(mapAssuranceLevelToState('aal2', 'aal1')).toBe('AAL2_VERIFIED');
    expect(mapAssuranceLevelToState('aal2', null)).toBe('AAL2_VERIFIED');
  });

  it('mapeia aal1 / aal2 -> MFA_CHALLENGE_REQUIRED', () => {
    expect(mapAssuranceLevelToState('aal1', 'aal2')).toBe('MFA_CHALLENGE_REQUIRED');
  });

  it('mapeia aal1 / aal1 ou aal1 / null -> NO_MFA_FACTOR', () => {
    expect(mapAssuranceLevelToState('aal1', 'aal1')).toBe('NO_MFA_FACTOR');
    expect(mapAssuranceLevelToState('aal1', null)).toBe('NO_MFA_FACTOR');
    expect(mapAssuranceLevelToState('aal1', undefined)).toBe('NO_MFA_FACTOR');
  });

  it('falha fechado (FAIL_CLOSED) para valores nulos, vazios ou desconhecidos', () => {
    expect(mapAssuranceLevelToState(null, null)).toBe('FAIL_CLOSED');
    expect(mapAssuranceLevelToState(undefined, undefined)).toBe('FAIL_CLOSED');
    expect(mapAssuranceLevelToState('unknown', 'unknown')).toBe('FAIL_CLOSED');
    expect(mapAssuranceLevelToState('', '')).toBe('FAIL_CLOSED');
  });
});

describe('getAdminAssuranceLevel', () => {
  it('retorna AAL2_VERIFIED quando API retorna aal2/aal2', async () => {
    const mockSupabase = {
      auth: {
        mfa: {
          getAuthenticatorAssuranceLevel: jest.fn().mockResolvedValue({
            data: { currentLevel: 'aal2', nextLevel: 'aal2' },
            error: null,
          }),
        },
      },
    } as unknown as SupabaseClient;

    const result = await getAdminAssuranceLevel(mockSupabase);
    expect(result.state).toBe('AAL2_VERIFIED');
    expect(result.currentLevel).toBe('aal2');
    expect(result.nextLevel).toBe('aal2');
  });

  it('retorna MFA_CHALLENGE_REQUIRED quando API retorna aal1/aal2', async () => {
    const mockSupabase = {
      auth: {
        mfa: {
          getAuthenticatorAssuranceLevel: jest.fn().mockResolvedValue({
            data: { currentLevel: 'aal1', nextLevel: 'aal2' },
            error: null,
          }),
        },
      },
    } as unknown as SupabaseClient;

    const result = await getAdminAssuranceLevel(mockSupabase);
    expect(result.state).toBe('MFA_CHALLENGE_REQUIRED');
    expect(result.currentLevel).toBe('aal1');
    expect(result.nextLevel).toBe('aal2');
  });

  it('retorna NO_MFA_FACTOR quando API retorna aal1/aal1', async () => {
    const mockSupabase = {
      auth: {
        mfa: {
          getAuthenticatorAssuranceLevel: jest.fn().mockResolvedValue({
            data: { currentLevel: 'aal1', nextLevel: 'aal1' },
            error: null,
          }),
        },
      },
    } as unknown as SupabaseClient;

    const result = await getAdminAssuranceLevel(mockSupabase);
    expect(result.state).toBe('NO_MFA_FACTOR');
    expect(result.currentLevel).toBe('aal1');
    expect(result.nextLevel).toBe('aal1');
  });

  it('retorna FAIL_CLOSED quando API retorna erro', async () => {
    const mockSupabase = {
      auth: {
        mfa: {
          getAuthenticatorAssuranceLevel: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Network error' },
          }),
        },
      },
    } as unknown as SupabaseClient;

    const result = await getAdminAssuranceLevel(mockSupabase);
    expect(result.state).toBe('FAIL_CLOSED');
    expect(result.error).toBe('Network error');
  });

  it('retorna FAIL_CLOSED quando chamada lança exceção inesperada', async () => {
    const mockSupabase = {
      auth: {
        mfa: {
          getAuthenticatorAssuranceLevel: jest.fn().mockRejectedValue(new Error('Crash')),
        },
      },
    } as unknown as SupabaseClient;

    const result = await getAdminAssuranceLevel(mockSupabase);
    expect(result.state).toBe('FAIL_CLOSED');
    expect(result.error).toBe('Crash');
  });
});
