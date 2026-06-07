import type { SupabaseClient, User } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { processProCheckoutCompleted, processProSubscriptionCancelled } from '@/lib/pro/webhook';
import { invalidateUserModulosCache } from '@/lib/cache';
import { findAuthUserByEmail, findOrCreateAuthUserByEmail } from '@/lib/supabase/adminUsers';
import { sendProAccessMagicLinkEmail } from '@/lib/pro/sendProAccessEmail';
import { getStripeClient } from '@/lib/stripe/client';

jest.mock('@/lib/supabase/adminUsers', () => ({
  findAuthUserByEmail: jest.fn(),
  findOrCreateAuthUserByEmail: jest.fn(),
}));

jest.mock('@/lib/pro/sendProAccessEmail', () => ({
  sendProAccessMagicLinkEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/cache', () => ({
  invalidateUserModulosCache: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/stripe/client', () => ({
  getStripeClient: jest.fn(),
}));

const mockFindAuthUserByEmail = findAuthUserByEmail as jest.MockedFunction<typeof findAuthUserByEmail>;
const mockFindOrCreateAuthUserByEmail = findOrCreateAuthUserByEmail as jest.MockedFunction<
  typeof findOrCreateAuthUserByEmail
>;
const mockSendProAccessMagicLinkEmail = sendProAccessMagicLinkEmail as jest.MockedFunction<
  typeof sendProAccessMagicLinkEmail
>;
const mockInvalidateUserModulosCache = invalidateUserModulosCache as jest.MockedFunction<
  typeof invalidateUserModulosCache
>;
const mockGetStripeClient = getStripeClient as jest.MockedFunction<typeof getStripeClient>;

function createProSupabaseMock(options?: { matriculaUpdateRows?: { id: string }[] }) {
  const upsert = jest.fn().mockResolvedValue({ error: null });
  const matriculaUpdate = jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: options?.matriculaUpdateRows ?? [{ id: 'mat-1' }],
            error: null,
          }),
        }),
      }),
    }),
  });
  const from = jest.fn((table: string) => {
    if (table === 'concursos') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'geral-id' }, error: null }),
      };
    }
    if (table === 'concurso_matriculas') {
      return { upsert, update: matriculaUpdate };
    }
    throw new Error(`Tabela inesperada: ${table}`);
  });

  return { from, upsert, matriculaUpdate } as unknown as SupabaseClient & {
    upsert: jest.Mock;
    matriculaUpdate: jest.Mock;
  };
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
    expect(mockInvalidateUserModulosCache).toHaveBeenCalledWith('user-new');
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
    expect(mockInvalidateUserModulosCache).toHaveBeenCalledWith('user-logado');
  });

  it('reutiliza usuário existente por e-mail sem enviar magic link', async () => {
    mockFindAuthUserByEmail.mockResolvedValue({
      user: { id: 'user-existing', email: 'existente@test.com' } as User,
      error: null,
    });

    const supabase = createProSupabaseMock();
    const result = await processProCheckoutCompleted(
      supabase,
      proSession({
        customer_details: { email: 'existente@test.com' } as Stripe.Checkout.Session['customer_details'],
      }),
    );

    expect(result).toEqual({ handled: true, userId: 'user-existing' });
    expect(mockFindOrCreateAuthUserByEmail).not.toHaveBeenCalled();
    expect(mockSendProAccessMagicLinkEmail).not.toHaveBeenCalled();
    expect(mockInvalidateUserModulosCache).toHaveBeenCalledWith('user-existing');
  });
});

describe('processProSubscriptionCancelled', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStripeClient.mockReturnValue({
      customers: {
        retrieve: jest.fn().mockResolvedValue({
          deleted: false,
          email: 'pro@test.com',
        }),
      },
    } as unknown as ReturnType<typeof getStripeClient>);
    mockFindAuthUserByEmail.mockResolvedValue({
      user: { id: 'user-pro', email: 'pro@test.com' } as User,
      error: null,
    });
  });

  it('expira matrícula stripe_pro e invalida cache do usuário', async () => {
    const supabase = createProSupabaseMock();
    const subscription = {
      id: 'sub_1',
      customer: 'cus_1',
    } as Stripe.Subscription;

    const result = await processProSubscriptionCancelled(supabase, subscription);

    expect(result).toEqual({ handled: true, userId: 'user-pro' });
    expect(supabase.matriculaUpdate).toHaveBeenCalledWith({ status: 'expirado' });
    expect(mockInvalidateUserModulosCache).toHaveBeenCalledWith('user-pro');
  });
});
