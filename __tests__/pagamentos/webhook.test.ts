import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { processStripeWebhookEvent } from '@/lib/pagamentos/webhook';
import { invalidateUserModulosCache } from '@/lib/cache';

jest.mock('@/lib/cache', () => ({
  invalidateUserModulosCache: jest.fn().mockResolvedValue(undefined),
}));

const mockInvalidateUserModulosCache = invalidateUserModulosCache as jest.MockedFunction<
  typeof invalidateUserModulosCache
>;

type PurchaseRow = {
  id: string;
  user_id: string;
  concurso_id: string;
  status: 'pending' | 'paid' | 'refunded';
  gateway_payment_id: string | null;
};

function createSupabaseMock(purchase: PurchaseRow | null) {
  const purchaseUpdate = jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
      in: jest.fn().mockResolvedValue({ error: null }),
    }),
  });
  const matriculaEqOrigem = jest.fn().mockResolvedValue({ error: null });
  const matriculaEqConcurso = jest.fn().mockReturnValue({ eq: matriculaEqOrigem });
  const matriculaEqUser = jest.fn().mockReturnValue({ eq: matriculaEqConcurso });
  const matriculaUpdate = jest.fn().mockReturnValue({
    eq: matriculaEqUser,
  });
  const rpc = jest.fn().mockResolvedValue({ error: null });

  const from = jest.fn((table: string) => {
    if (table === 'concurso_purchases') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: purchase, error: null }),
        update: purchaseUpdate,
      };
    }

    if (table === 'concurso_matriculas') {
      return {
        update: matriculaUpdate,
      };
    }

    throw new Error(`Tabela inesperada: ${table}`);
  });

  return {
    from,
    rpc,
    purchaseUpdate,
    matriculaUpdate,
    matriculaEqUser,
    matriculaEqConcurso,
    matriculaEqOrigem,
  } as unknown as SupabaseClient & {
    rpc: jest.Mock;
    purchaseUpdate: jest.Mock;
    matriculaUpdate: jest.Mock;
    matriculaEqUser: jest.Mock;
    matriculaEqConcurso: jest.Mock;
    matriculaEqOrigem: jest.Mock;
  };
}

describe('processStripeWebhookEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fulfill compra pendente em checkout.session.completed', async () => {
    const purchase: PurchaseRow = {
      id: 'purchase-1',
      user_id: 'user-1',
      concurso_id: 'concurso-1',
      status: 'pending',
      gateway_payment_id: null,
    };
    const supabase = createSupabaseMock(purchase);

    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          payment_status: 'paid',
          metadata: { purchase_id: purchase.id },
          client_reference_id: purchase.id,
        },
      },
    } as unknown as Stripe.Event;

    const result = await processStripeWebhookEvent(supabase, event);

    expect(result).toEqual({
      handled: true,
      purchaseId: purchase.id,
      userId: purchase.user_id,
    });
    expect(supabase.rpc).toHaveBeenCalledWith('fulfill_concurso_purchase', {
      purchase_id: purchase.id,
    });
    expect(mockInvalidateUserModulosCache).toHaveBeenCalledWith(purchase.user_id);
  });

  it('ignora checkout.session.completed já pago', async () => {
    const purchase: PurchaseRow = {
      id: 'purchase-1',
      user_id: 'user-1',
      concurso_id: 'concurso-1',
      status: 'paid',
      gateway_payment_id: 'cs_test_123',
    };
    const supabase = createSupabaseMock(purchase);

    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          payment_status: 'paid',
          metadata: { purchase_id: purchase.id },
        },
      },
    } as unknown as Stripe.Event;

    const result = await processStripeWebhookEvent(supabase, event);

    expect(result).toEqual({
      handled: true,
      purchaseId: purchase.id,
      userId: purchase.user_id,
    });
    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(mockInvalidateUserModulosCache).not.toHaveBeenCalled();
  });

  it('ignora checkout.session.completed não pago', async () => {
    const supabase = createSupabaseMock(null);

    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_unpaid',
          payment_status: 'unpaid',
          metadata: { purchase_id: 'purchase-1' },
        },
      },
    } as unknown as Stripe.Event;

    const result = await processStripeWebhookEvent(supabase, event);

    expect(result).toEqual({ handled: false, reason: 'checkout_not_paid' });
    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(mockInvalidateUserModulosCache).not.toHaveBeenCalled();
  });

  it('marca compra como refunded e expira matrícula em charge.refunded', async () => {
    const purchase: PurchaseRow = {
      id: 'purchase-1',
      user_id: 'user-1',
      concurso_id: 'concurso-1',
      status: 'paid',
      gateway_payment_id: 'cs_test_123',
    };
    const supabase = createSupabaseMock(purchase);

    const event = {
      type: 'charge.refunded',
      data: {
        object: {
          metadata: { purchase_id: purchase.id },
        },
      },
    } as unknown as Stripe.Event;

    const result = await processStripeWebhookEvent(supabase, event);

    expect(result).toEqual({
      handled: true,
      purchaseId: purchase.id,
      userId: purchase.user_id,
    });
    expect(supabase.purchaseUpdate).toHaveBeenCalledWith({ status: 'refunded' });
    expect(supabase.matriculaUpdate).toHaveBeenCalledWith({ status: 'expirado' });
    expect(supabase.matriculaEqUser).toHaveBeenCalledWith('user_id', purchase.user_id);
    expect(supabase.matriculaEqConcurso).toHaveBeenCalledWith('concurso_id', purchase.concurso_id);
    expect(supabase.matriculaEqOrigem).toHaveBeenCalledWith('origem', 'purchase');
  });

  it('charge.refunded expira só matrícula purchase (não stripe_pro no mesmo concurso)', async () => {
    const purchase: PurchaseRow = {
      id: 'purchase-1',
      user_id: 'user-1',
      concurso_id: 'geral-id',
      status: 'paid',
      gateway_payment_id: 'cs_test_123',
    };
    const supabase = createSupabaseMock(purchase);

    const event = {
      type: 'charge.refunded',
      data: {
        object: {
          metadata: { purchase_id: purchase.id },
        },
      },
    } as unknown as Stripe.Event;

    await processStripeWebhookEvent(supabase, event);

    expect(supabase.matriculaEqOrigem).toHaveBeenCalledWith('origem', 'purchase');
  });
});
