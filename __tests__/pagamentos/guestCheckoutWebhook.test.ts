import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { processGuestConcursoCheckoutCompleted } from '@/lib/concursos/guestCheckoutWebhook';
import { invalidateUserModulosCache } from '@/lib/cache';
import { getConcursoBySlug } from '@/lib/concursos/entitlements';
import { findOrCreateAuthUserByEmail } from '@/lib/supabase/adminUsers';

jest.mock('@/lib/cache', () => ({
  invalidateUserModulosCache: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/concursos/entitlements', () => ({
  getConcursoBySlug: jest.fn(),
  isActiveMatriculaRow: jest.fn((row: { status?: string | null }) => row.status === 'ativo'),
}));

jest.mock('@/lib/supabase/adminUsers', () => ({
  findOrCreateAuthUserByEmail: jest.fn(),
}));

const mockGetConcursoBySlug = getConcursoBySlug as jest.MockedFunction<typeof getConcursoBySlug>;
const mockFindOrCreateAuthUserByEmail = findOrCreateAuthUserByEmail as jest.MockedFunction<
  typeof findOrCreateAuthUserByEmail
>;
const mockInvalidateUserModulosCache = invalidateUserModulosCache as jest.MockedFunction<
  typeof invalidateUserModulosCache
>;

function createGuestSupabaseMock() {
  const rpc = jest.fn().mockResolvedValue({ error: null });
  const purchaseInsert = jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: { id: 'purchase-guest-1' }, error: null }),
    }),
  });

  const from = jest.fn((table: string) => {
    if (table === 'concurso_purchases') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        insert: purchaseInsert,
      };
    }

    if (table === 'concurso_matriculas') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
    }

    throw new Error(`Tabela inesperada: ${table}`);
  });

  return { from, rpc, purchaseInsert } as unknown as SupabaseClient & {
    rpc: jest.Mock;
    purchaseInsert: jest.Mock;
  };
}

describe('processGuestConcursoCheckoutCompleted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConcursoBySlug.mockResolvedValue({
      id: 'concurso-1',
      slug: 'goianinha-rn',
      nome: 'Goianinha',
      status: 'ativo',
      price_cents: 3700,
    } as Awaited<ReturnType<typeof getConcursoBySlug>>);
    mockFindOrCreateAuthUserByEmail.mockResolvedValue({ userId: 'user-guest-1', created: true });
  });

  it('fulfill compra guest em checkout.session.completed', async () => {
    const supabase = createGuestSupabaseMock();

    const session = {
      id: 'cs_guest_123',
      payment_status: 'paid',
      metadata: { guest_checkout: '1', concurso_slug: 'goianinha-rn' },
      customer_details: { email: 'aluno@example.com' },
    } as unknown as Stripe.Checkout.Session;

    const result = await processGuestConcursoCheckoutCompleted(supabase, session);

    expect(result).toEqual({
      handled: true,
      purchaseId: 'purchase-guest-1',
      userId: 'user-guest-1',
    });
    expect(mockFindOrCreateAuthUserByEmail).toHaveBeenCalledWith(
      supabase,
      'aluno@example.com',
      null,
    );
    expect(supabase.purchaseInsert).toHaveBeenCalledWith({
      user_id: 'user-guest-1',
      concurso_id: 'concurso-1',
      amount: 3700,
      status: 'pending',
      gateway: 'stripe',
      gateway_payment_id: 'cs_guest_123',
      currency: 'brl',
    });
    expect(supabase.rpc).toHaveBeenCalledWith('fulfill_concurso_purchase', {
      purchase_id: 'purchase-guest-1',
    });
    expect(mockInvalidateUserModulosCache).toHaveBeenCalledWith('user-guest-1');
  });

  it('usa customer_email quando customer_details não tem e-mail', async () => {
    const supabase = createGuestSupabaseMock();
    const session = {
      id: 'cs_guest_email',
      payment_status: 'paid',
      metadata: { guest_checkout: '1', concurso_slug: 'goianinha-rn' },
      customer_email: 'Outro@Example.COM',
    } as unknown as Stripe.Checkout.Session;

    await processGuestConcursoCheckoutCompleted(supabase, session);

    expect(mockFindOrCreateAuthUserByEmail).toHaveBeenCalledWith(
      supabase,
      'outro@example.com',
      null,
    );
  });

  it('ignora checkout.session.completed não pago', async () => {
    const supabase = createGuestSupabaseMock();
    const session = {
      id: 'cs_guest_unpaid',
      payment_status: 'unpaid',
      metadata: { guest_checkout: '1', concurso_slug: 'goianinha-rn' },
      customer_details: { email: 'aluno@example.com' },
    } as unknown as Stripe.Checkout.Session;

    const result = await processGuestConcursoCheckoutCompleted(supabase, session);

    expect(result).toEqual({ handled: false, reason: 'checkout_not_paid' });
    expect(supabase.purchaseInsert).not.toHaveBeenCalled();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it('ignora sessão guest sem concurso_slug', async () => {
    const supabase = createGuestSupabaseMock();
    const session = {
      id: 'cs_guest_no_slug',
      payment_status: 'paid',
      metadata: { guest_checkout: '1' },
      customer_details: { email: 'aluno@example.com' },
    } as unknown as Stripe.Checkout.Session;

    const result = await processGuestConcursoCheckoutCompleted(supabase, session);

    expect(result).toEqual({ handled: false, reason: 'missing_concurso_slug' });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it('ignora sessão guest sem e-mail do cliente', async () => {
    const supabase = createGuestSupabaseMock();
    const session = {
      id: 'cs_guest_no_email',
      payment_status: 'paid',
      metadata: { guest_checkout: '1', concurso_slug: 'goianinha-rn' },
    } as unknown as Stripe.Checkout.Session;

    const result = await processGuestConcursoCheckoutCompleted(supabase, session);

    expect(result).toEqual({ handled: false, reason: 'missing_customer_email' });
    expect(supabase.purchaseInsert).not.toHaveBeenCalled();
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it('retorna idempotente quando compra guest já está paga', async () => {
    const rpc = jest.fn();
    const purchaseInsert = jest.fn();
    const from = jest.fn((table: string) => {
      if (table === 'concurso_purchases') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: { id: 'purchase-existing', user_id: 'user-existing', status: 'paid' },
            error: null,
          }),
          insert: purchaseInsert,
        };
      }
      throw new Error(`Tabela inesperada: ${table}`);
    });
    const supabase = { from, rpc } as unknown as SupabaseClient & { rpc: jest.Mock };

    const session = {
      id: 'cs_guest_dup',
      payment_status: 'paid',
      metadata: { guest_checkout: '1', concurso_slug: 'goianinha-rn' },
      customer_details: { email: 'aluno@example.com' },
    } as unknown as Stripe.Checkout.Session;

    const result = await processGuestConcursoCheckoutCompleted(supabase, session);

    expect(result).toEqual({
      handled: true,
      purchaseId: 'purchase-existing',
      userId: 'user-existing',
    });
    expect(purchaseInsert).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
    expect(mockFindOrCreateAuthUserByEmail).not.toHaveBeenCalled();
  });

  it('não insere compra quando matrícula já está ativa', async () => {
    const supabase = createGuestSupabaseMock();
    const matriculaChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { status: 'ativo', expires_at: null },
        error: null,
      }),
    };
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'concurso_purchases') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          insert: supabase.purchaseInsert,
        };
      }
      if (table === 'concurso_matriculas') {
        return matriculaChain;
      }
      throw new Error(`Tabela inesperada: ${table}`);
    });

    const session = {
      id: 'cs_guest_matricula',
      payment_status: 'paid',
      metadata: { guest_checkout: '1', concurso_slug: 'goianinha-rn' },
      customer_details: { email: 'aluno@example.com' },
    } as unknown as Stripe.Checkout.Session;

    const result = await processGuestConcursoCheckoutCompleted(supabase, session);

    expect(result).toEqual({ handled: true, userId: 'user-guest-1' });
    expect(supabase.purchaseInsert).not.toHaveBeenCalled();
    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(mockInvalidateUserModulosCache).not.toHaveBeenCalled();
  });

  it('ignora sessão sem flag guest_checkout', async () => {
    const supabase = createGuestSupabaseMock();
    const session = {
      id: 'cs_other',
      payment_status: 'paid',
      metadata: { concurso_slug: 'goianinha-rn' },
    } as unknown as Stripe.Checkout.Session;

    const result = await processGuestConcursoCheckoutCompleted(supabase, session);

    expect(result).toEqual({ handled: false, reason: 'not_guest_checkout' });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
