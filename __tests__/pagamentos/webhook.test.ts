/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { processStripeWebhookEvent } from '@/lib/pagamentos/webhook';
import { invalidateUserModulosCache } from '@/lib/cache';
import {
  handleStripeWebhookRequest,
  isRetriableWebhookFailure,
} from '@/lib/stripe/webhookRouteHandler';
import { dispatchStripeWebhookEvent } from '@/lib/stripe/webhookDispatcher';
import { constructWebhookEvent } from '@/lib/stripe/client';
import { getStripeServerConfig } from '@/lib/env';
import { createServerSupabase } from '@/lib/supabase/server';

jest.mock('@/lib/stripe/webhookDispatcher', () => ({
  dispatchStripeWebhookEvent: jest.fn(),
}));

jest.mock('@/lib/stripe/client', () => ({
  constructWebhookEvent: jest.fn(),
}));

jest.mock('@/lib/env', () => ({
  getStripeServerConfig: jest.fn(),
}));

jest.mock('@/lib/supabase/server', () => ({
  createServerSupabase: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/cache', () => ({
  invalidateUserModulosCache: jest.fn().mockResolvedValue(undefined),
}));

const mockInvalidateUserModulosCache = invalidateUserModulosCache as jest.MockedFunction<
  typeof invalidateUserModulosCache
>;
const mockDispatchStripeWebhookEvent = dispatchStripeWebhookEvent as jest.MockedFunction<
  typeof dispatchStripeWebhookEvent
>;
const mockConstructWebhookEvent = constructWebhookEvent as jest.MockedFunction<
  typeof constructWebhookEvent
>;
const mockGetStripeServerConfig = getStripeServerConfig as jest.MockedFunction<
  typeof getStripeServerConfig
>;
const mockCreateServerSupabase = createServerSupabase as jest.MockedFunction<
  typeof createServerSupabase
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
    expect(mockInvalidateUserModulosCache).toHaveBeenCalledWith(purchase.user_id);
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

describe('isRetriableWebhookFailure', () => {
  it.each([
    'purchase_not_found',
    'geral_concurso_missing',
    'missing_customer_email',
    'concurso_not_found',
    'missing_concurso_slug',
  ])('marca %s como retriável', (reason) => {
    expect(isRetriableWebhookFailure(reason)).toBe(true);
  });

  it.each([
    'ignored_event_payment_intent.succeeded',
    'not_guest_checkout',
    'checkout_not_paid',
    'missing_purchase_id',
  ])('marca %s como não retriável', (reason) => {
    expect(isRetriableWebhookFailure(reason)).toBe(false);
  });
});

describe('handleStripeWebhookRequest', () => {
  const supabase = {} as SupabaseClient;
  const stripeEvent = {
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_test_123' } },
  } as unknown as Stripe.Event;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStripeServerConfig.mockReturnValue({
      secretKey: 'sk_test',
      webhookSecret: 'whsec_test',
    });
    mockConstructWebhookEvent.mockReturnValue(stripeEvent);
    mockCreateServerSupabase.mockResolvedValue(supabase);
  });

  function makeWebhookRequest(body = '{}') {
    return new NextRequest('https://avant.test/api/pagamentos/webhook', {
      method: 'POST',
      body,
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'sig_test',
      },
    });
  }

  it('retorna 500 quando falha é retriável (purchase_not_found)', async () => {
    mockDispatchStripeWebhookEvent.mockResolvedValue({
      handled: false,
      reason: 'purchase_not_found',
    });

    const response = await handleStripeWebhookRequest(makeWebhookRequest());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: 'Falha temporária ao processar webhook.',
      reason: 'purchase_not_found',
    });
  });

  it('retorna 500 quando falha guest é retriável (missing_customer_email)', async () => {
    mockDispatchStripeWebhookEvent.mockResolvedValue({
      handled: false,
      reason: 'missing_customer_email',
    });

    const response = await handleStripeWebhookRequest(makeWebhookRequest());

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: 'Falha temporária ao processar webhook.',
      reason: 'missing_customer_email',
    });
  });

  it('retorna 200 quando evento é genuinamente ignorado', async () => {
    mockDispatchStripeWebhookEvent.mockResolvedValue({
      handled: false,
      reason: 'ignored_event_payment_intent.succeeded',
    });

    const response = await handleStripeWebhookRequest(makeWebhookRequest());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      received: true,
      handled: false,
      reason: 'ignored_event_payment_intent.succeeded',
    });
  });

  it('retorna 200 quando checkout guest já pago (handled true)', async () => {
    mockDispatchStripeWebhookEvent.mockResolvedValue({
      handled: true,
      purchaseId: 'purchase-guest-1',
      userId: 'user-guest-1',
    });

    const response = await handleStripeWebhookRequest(makeWebhookRequest());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      received: true,
      handled: true,
    });
  });
});
