import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { processProCheckoutCompleted } from '@/lib/pro/webhook';
import { findAuthUserByEmail, findOrCreateAuthUserByEmail } from '@/lib/supabase/adminUsers';
import { sendProAccessMagicLinkEmail } from '@/lib/pro/sendProAccessEmail';

jest.mock('@/lib/supabase/adminUsers', () => ({
  findAuthUserByEmail: jest.fn(),
  findOrCreateAuthUserByEmail: jest.fn(),
}));

jest.mock('@/lib/pro/sendProAccessEmail', () => ({
  sendProAccessMagicLinkEmail: jest.fn().mockResolvedValue(undefined),
}));

const mockFindAuthUserByEmail = findAuthUserByEmail as jest.MockedFunction<typeof findAuthUserByEmail>;
const mockFindOrCreateAuthUserByEmail = findOrCreateAuthUserByEmail as jest.MockedFunction<
  typeof findOrCreateAuthUserByEmail
>;
const mockSendProAccessMagicLinkEmail = sendProAccessMagicLinkEmail as jest.MockedFunction<
  typeof sendProAccessMagicLinkEmail
>;

function createProSupabaseMock() {
  const upsert = jest.fn().mockResolvedValue({ error: null });
  const from = jest.fn((table: string) => {
    if (table === 'concursos') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'geral-id' }, error: null }),
      };
    }
    if (table === 'concurso_matriculas') {
      return { upsert };
    }
    throw new Error(`Tabela inesperada: ${table}`);
  });

  return { from, upsert } as unknown as SupabaseClient & { upsert: jest.Mock };
}

function proSession(overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Checkout.Session {
  return {
    id: 'cs_pro_1',
    payment_status: 'paid',
    metadata: { produto: 'avant-pro', user_id: '' },
    customer_details: { email: 'novo@test.com' },
    ...overrides,
  } as Stripe.Checkout.Session;
}

describe('processProCheckoutCompleted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindAuthUserByEmail.mockResolvedValue({ user: null, error: null });
    mockFindOrCreateAuthUserByEmail.mockResolvedValue({ userId: 'user-new', created: true });
  });

  it('cria usuário, envia magic link e ativa matrícula stripe_pro', async () => {
    const supabase = createProSupabaseMock();
    const result = await processProCheckoutCompleted(supabase, proSession());

    expect(result).toEqual({ handled: true, userId: 'user-new' });
    expect(mockFindOrCreateAuthUserByEmail).toHaveBeenCalledWith(
      supabase,
      'novo@test.com',
      null,
    );
    expect(mockSendProAccessMagicLinkEmail).toHaveBeenCalledWith(supabase, 'novo@test.com');
    expect(supabase.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-new',
        concurso_id: 'geral-id',
        origem: 'stripe_pro',
        status: 'ativo',
      }),
      { onConflict: 'user_id,concurso_id' },
    );
  });

  it('usa user_id do metadata sem criar conta', async () => {
    const supabase = createProSupabaseMock();
    const result = await processProCheckoutCompleted(
      supabase,
      proSession({ metadata: { produto: 'avant-pro', user_id: 'user-logado' } }),
    );

    expect(result).toEqual({ handled: true, userId: 'user-logado' });
    expect(mockFindOrCreateAuthUserByEmail).not.toHaveBeenCalled();
    expect(mockSendProAccessMagicLinkEmail).not.toHaveBeenCalled();
  });

  it('reutiliza usuário existente por e-mail sem enviar magic link', async () => {
    mockFindAuthUserByEmail.mockResolvedValue({
      user: { id: 'user-existing', email: 'existente@test.com' } as { id: string; email: string },
      error: null,
    });

    const supabase = createProSupabaseMock();
    const result = await processProCheckoutCompleted(
      supabase,
      proSession({ customer_details: { email: 'existente@test.com' } }),
    );

    expect(result).toEqual({ handled: true, userId: 'user-existing' });
    expect(mockFindOrCreateAuthUserByEmail).not.toHaveBeenCalled();
    expect(mockSendProAccessMagicLinkEmail).not.toHaveBeenCalled();
  });
});
