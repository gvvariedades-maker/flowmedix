
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

  it('resgata com sucesso e concede Pro temporário', async () => {
    const upsert = jest.fn().mockResolvedValue({ error: null });
    const insertRedemption = jest.fn().mockResolvedValue({ error: null });
    createServerSupabase.mockResolvedValue(
      buildSupabaseMock({
        inviteLink: {
          id: 'link-ok',
          pro_days: 7,
          link_expires_at: '2099-06-01T00:00:00.000Z',
          max_uses: 3,
          use_count: 1,
          revoked_at: null,
        },
        upsertMatricula: upsert,
        insertRedemption,
      }),
    );
    getGeralMatriculaForUser.mockResolvedValue(null);

    const { redeemInvite } = await import('@/lib/invite/redeem');
    const result = await redeemInvite('user-1', 'token-valid');

    expect(result.ok).toBe(true);
    if (result.ok && !result.alreadyPro) {
      expect(result.proExpiresAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        concurso_id: 'geral-id',
        origem: 'invite',
        status: 'ativo',
      }),
      { onConflict: 'user_id,concurso_id' },
    );
    expect(insertRedemption).toHaveBeenCalledWith(
      expect.objectContaining({
        invite_link_id: 'link-ok',
        user_id: 'user-1',
      }),
    );
  });

  it('permite novo link após trial invite expirado', async () => {
    const upsert = jest.fn().mockResolvedValue({ error: null });
    createServerSupabase.mockResolvedValue(
      buildSupabaseMock({
        inviteLink: {
          id: 'link-new',
          pro_days: 14,
          link_expires_at: '2099-01-01T00:00:00.000Z',
          max_uses: 10,
          use_count: 0,
          revoked_at: null,
        },
        upsertMatricula: upsert,
      }),
    );
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    getGeralMatriculaForUser.mockResolvedValue({
      origem: 'invite',
      status: 'expirado',
      expires_at: past,
    });

    const { redeemInvite } = await import('@/lib/invite/redeem');
    const result = await redeemInvite('user-1', 'token-after-trial');

    expect(result).toEqual(expect.objectContaining({ ok: true }));
    expect(upsert).toHaveBeenCalled();
  });

  it('retorna ALREADY_REDEEMED quando o usuário já resgatou o mesmo link', async () => {
    const upsert = jest.fn();
    createServerSupabase.mockResolvedValue(
      buildSupabaseMock({
        inviteLink: {
          id: 'link-1',
          pro_days: 7,
          link_expires_at: '2099-01-01T00:00:00.000Z',
          max_uses: 5,
          use_count: 1,
          revoked_at: null,
        },
        existingRedemption: { id: 'red-1' },
        upsertMatricula: upsert,
      }),
    );

    const { redeemInvite } = await import('@/lib/invite/redeem');
    const result = await redeemInvite('user-1', 'token-used');

    expect(result).toEqual({
      ok: false,
      code: 'ALREADY_REDEEMED',
      message: 'Link já utilizado por esta conta.',
    });
    expect(upsert).not.toHaveBeenCalled();
  });

  it('retorna LINK_EXHAUSTED quando use_count >= max_uses', async () => {
    createServerSupabase.mockResolvedValue(
      buildSupabaseMock({
        inviteLink: {
          id: 'link-full',
          pro_days: 7,
          link_expires_at: '2099-01-01T00:00:00.000Z',
          max_uses: 2,
          use_count: 2,
          revoked_at: null,
        },
      }),
    );

    const { redeemInvite } = await import('@/lib/invite/redeem');
    const result = await redeemInvite('user-1', 'token-full');

    expect(result).toEqual({
      ok: false,
      code: 'LINK_EXHAUSTED',
      message: 'Este link de convite atingiu o limite de usos.',
    });
  });

  it('retorna LINK_REVOKED quando revoked_at está preenchido', async () => {
    createServerSupabase.mockResolvedValue(
      buildSupabaseMock({
        inviteLink: {
          id: 'link-rev',
          pro_days: 7,
          link_expires_at: '2099-01-01T00:00:00.000Z',
          max_uses: 10,
          use_count: 0,
          revoked_at: '2026-01-01T00:00:00.000Z',
        },
      }),
    );

    const { redeemInvite } = await import('@/lib/invite/redeem');
    const result = await redeemInvite('user-1', 'token-revoked');

    expect(result).toEqual({
      ok: false,
      code: 'LINK_REVOKED',
      message: 'Este link de convite foi revogado.',
    });
  });
});
