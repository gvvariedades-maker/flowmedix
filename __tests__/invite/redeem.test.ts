
jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(),
}));

jest.mock('@/lib/cache', () => ({
  invalidateUserModulosCache: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/freemium', () => ({
  getGeralMatriculaForUser: jest.fn(),
}));

jest.mock('@/lib/concursos/entitlements', () => {
  const actual = jest.requireActual('@/lib/concursos/entitlements');
  return {
    ...actual,
    getConcursoBySlug: jest.fn(),
  };
});

const { createServerSupabase } = jest.requireMock('@/lib/supabase/server') as {
  createServerSupabase: jest.Mock;
};
const { getGeralMatriculaForUser } = jest.requireMock('@/lib/freemium') as {
  getGeralMatriculaForUser: jest.Mock;
};
const { getConcursoBySlug } = jest.requireMock('@/lib/concursos/entitlements') as {
  getConcursoBySlug: jest.Mock;
};

function buildSupabaseMock(handlers: {
  inviteLink?: object | null;
  existingRedemption?: object | null;
  upsertMatricula?: jest.Mock;
  insertRedemption?: jest.Mock;
  incrementUseCount?: object | null;
}) {
  const from = jest.fn((table: string) => {
    if (table === 'invite_links') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: handlers.inviteLink ?? null, error: null }),
          }),
        }),
        update: () => ({
          eq: () => ({
            eq: () => ({
              select: () => ({
                maybeSingle: async () => ({
                  data: handlers.incrementUseCount ?? { id: 'link-1' },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };
    }
    if (table === 'invite_redemptions') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: handlers.existingRedemption ?? null,
                error: null,
              }),
            }),
          }),
        }),
        insert: handlers.insertRedemption ?? jest.fn().mockResolvedValue({ error: null }),
      };
    }
    if (table === 'concurso_matriculas') {
      return {
        upsert: handlers.upsertMatricula ?? jest.fn().mockResolvedValue({ error: null }),
      };
    }
    throw new Error(`unexpected table ${table}`);
  });

  return { from };
}

describe('redeemInvite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getGeralMatriculaForUser.mockResolvedValue(null);
    getConcursoBySlug.mockResolvedValue({ id: 'geral-id', slug: 'geral', status: 'ativo' });
  });

  it('retorna LINK_EXPIRED quando link_expires_at passou', async () => {
    createServerSupabase.mockResolvedValue(
      buildSupabaseMock({
        inviteLink: {
          id: 'link-1',
          pro_days: 7,
          link_expires_at: '2020-01-01T00:00:00.000Z',
          max_uses: 10,
          use_count: 0,
          revoked_at: null,
        },
      }),
    );

    const { redeemInvite } = await import('@/lib/invite/redeem');
    const result = await redeemInvite('user-1', 'token-abc');

    expect(result).toEqual({
      ok: false,
      code: 'LINK_EXPIRED',
      message: 'Este link de convite expirou.',
    });
  });

  it('retorna alreadyPro sem upsert quando stripe_pro ativo', async () => {
    const upsert = jest.fn();
    createServerSupabase.mockResolvedValue(
      buildSupabaseMock({
        inviteLink: {
          id: 'link-1',
          pro_days: 30,
          link_expires_at: '2099-01-01T00:00:00.000Z',
          max_uses: 1,
          use_count: 0,
          revoked_at: null,
        },
        upsertMatricula: upsert,
      }),
    );
    getGeralMatriculaForUser.mockResolvedValue({
      origem: 'stripe_pro',
      status: 'ativo',
      expires_at: null,
    });

    const { redeemInvite } = await import('@/lib/invite/redeem');
    const result = await redeemInvite('user-1', 'token-abc');

    expect(result).toEqual({ ok: true, alreadyPro: true });
    expect(upsert).not.toHaveBeenCalled();
  });

  it('bloqueia segundo convite com invite Pro ainda ativo', async () => {
    createServerSupabase.mockResolvedValue(
      buildSupabaseMock({
        inviteLink: {
          id: 'link-2',
          pro_days: 14,
          link_expires_at: '2099-01-01T00:00:00.000Z',
          max_uses: 5,
          use_count: 0,
          revoked_at: null,
        },
      }),
    );
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    getGeralMatriculaForUser.mockResolvedValue({
      origem: 'invite',
      status: 'ativo',
      expires_at: future,
    });

    const { redeemInvite } = await import('@/lib/invite/redeem');
    const result = await redeemInvite('user-1', 'token-xyz');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVITE_PRO_ACTIVE');
    }
  });
});
