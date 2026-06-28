import {
  FREEMIUM_FREE_WEEKLY_MISSIONS,
  FREEMIUM_WEEKLY_UNLOCK_DAYS,
  addFreemiumDaysToYmd,
  freemiumYmdDiffDays,
  toFreemiumTimezoneYmd,
} from '@/lib/freemium/constants';

jest.mock('@/lib/freemium', () => ({
  isFreemiumUnlimitedEmail: jest.fn(() => false),
  isUserPro: jest.fn(),
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(),
}));

jest.mock('@/lib/simulado/diagnosticoStatus', () => ({
  getDiagnosticoSimuladoCardState: jest.fn(),
}));

import { isUserPro } from '@/lib/freemium';
import { createServerSupabase } from '@/lib/supabase/server';
import { getDiagnosticoSimuladoCardState } from '@/lib/simulado/diagnosticoStatus';
import {
  countWeeklyMissionsForUser,
  getWeeklyMissionEntitlement,
  weeklyMissionBlockMessage,
} from '@/lib/freemium/weeklyMissionEntitlement';

const isUserProMock = isUserPro as jest.MockedFunction<typeof isUserPro>;
const getDiagnosticoMock = getDiagnosticoSimuladoCardState as jest.MockedFunction<
  typeof getDiagnosticoSimuladoCardState
>;

function mockSupabaseWithWeeklyCount(count: number) {
  const supabase = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          filter: jest.fn(() => ({
            neq: jest.fn(async () => ({ count, error: null })),
          })),
        })),
      })),
    })),
    auth: {
      admin: {
        getUserById: jest.fn(async () => ({
          data: { user: { created_at: '2026-01-01T12:00:00.000Z' } },
          error: null,
        })),
      },
    },
  };
  (createServerSupabase as jest.Mock).mockResolvedValue(supabase);
  return supabase;
}

describe('weeklyMissionEntitlement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isUserProMock.mockResolvedValue(false);
    getDiagnosticoMock.mockResolvedValue({
      show_card: false,
      onboarding_completed: true,
      diagnostico_completed: true,
      has_open_session: false,
      session: null,
    });
  });

  it('permite Pro sem restrições', async () => {
    isUserProMock.mockResolvedValue(true);
    const result = await getWeeklyMissionEntitlement('user-1');
    expect(result).toEqual({ allowed: true, tier: 'pro' });
  });

  it('bloqueia upgrade após missão gratuita usada', async () => {
    mockSupabaseWithWeeklyCount(FREEMIUM_FREE_WEEKLY_MISSIONS);
    const result = await getWeeklyMissionEntitlement('user-1');
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe('upgrade_required');
    }
  });

  it('bloqueia antes de 7 dias do cadastro', async () => {
    const signupYmd = toFreemiumTimezoneYmd();
    const supabase = mockSupabaseWithWeeklyCount(0);
    supabase.auth.admin.getUserById.mockResolvedValue({
      data: { user: { created_at: new Date().toISOString() } },
      error: null,
    });

    const result = await getWeeklyMissionEntitlement('user-1');
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe('waiting_period');
      expect(result.daysRemaining).toBeGreaterThan(0);
    }

    const unlockYmd = addFreemiumDaysToYmd(signupYmd, FREEMIUM_WEEKLY_UNLOCK_DAYS);
    expect(freemiumYmdDiffDays(signupYmd, unlockYmd)).toBe(FREEMIUM_WEEKLY_UNLOCK_DAYS);
  });

  it('exige diagnóstico concluído', async () => {
    mockSupabaseWithWeeklyCount(0);
    getDiagnosticoMock.mockResolvedValue({
      show_card: true,
      onboarding_completed: true,
      diagnostico_completed: false,
      has_open_session: false,
      session: null,
    });

    const result = await getWeeklyMissionEntitlement('user-1');
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe('diagnostico_pending');
      expect(weeklyMissionBlockMessage(result)).toMatch(/diagnóstico/i);
    }
  });

  it('countWeeklyMissionsForUser retorna total', async () => {
    mockSupabaseWithWeeklyCount(2);
    const supabase = await createServerSupabase();
    const count = await countWeeklyMissionsForUser(supabase, 'user-1');
    expect(count).toBe(2);
  });
});
