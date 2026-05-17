import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { dispatchStripeWebhookEvent } from '@/lib/stripe/webhookDispatcher';
import { processGuestConcursoCheckoutCompleted } from '@/lib/concursos/guestCheckoutWebhook';
import { processStripeWebhookEvent } from '@/lib/pagamentos/webhook';

jest.mock('@/lib/concursos/guestCheckoutWebhook', () => ({
  processGuestConcursoCheckoutCompleted: jest.fn(),
}));

jest.mock('@/lib/pagamentos/webhook', () => ({
  processStripeWebhookEvent: jest.fn(),
}));

jest.mock('@/lib/campina/webhook', () => ({
  processCampinaGrandeCheckoutCompleted: jest.fn(),
}));

jest.mock('@/lib/goianinha/webhook', () => ({
  processGoianinhaCheckoutCompleted: jest.fn(),
}));

jest.mock('@/lib/pro/webhook', () => ({
  processProCheckoutCompleted: jest.fn(),
  processProSubscriptionCancelled: jest.fn(),
}));

const mockGuestHandler = processGuestConcursoCheckoutCompleted as jest.MockedFunction<
  typeof processGuestConcursoCheckoutCompleted
>;
const mockPurchaseHandler = processStripeWebhookEvent as jest.MockedFunction<
  typeof processStripeWebhookEvent
>;

describe('dispatchStripeWebhookEvent', () => {
  const supabase = {} as SupabaseClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGuestHandler.mockResolvedValue({
      handled: true,
      purchaseId: 'purchase-guest-1',
      userId: 'user-guest-1',
    });
    mockPurchaseHandler.mockResolvedValue({
      handled: true,
      purchaseId: 'purchase-auth-1',
      userId: 'user-auth-1',
    });
  });

  it('encaminha checkout guest para processGuestConcursoCheckoutCompleted', async () => {
    const session = {
      id: 'cs_guest_123',
      payment_status: 'paid',
      metadata: { guest_checkout: '1', concurso_slug: 'goianinha-rn' },
    } as Stripe.Checkout.Session;

    const event = {
      type: 'checkout.session.completed',
      data: { object: session },
    } as Stripe.Event;

    const result = await dispatchStripeWebhookEvent(supabase, event);

    expect(mockGuestHandler).toHaveBeenCalledWith(supabase, session);
    expect(mockPurchaseHandler).not.toHaveBeenCalled();
    expect(result).toEqual({
      handled: true,
      purchaseId: 'purchase-guest-1',
      userId: 'user-guest-1',
    });
  });

  it('mantém fluxo com purchase_id no handler padrão', async () => {
    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_auth_123',
          payment_status: 'paid',
          metadata: { purchase_id: 'purchase-auth-1' },
        },
      },
    } as Stripe.Event;

    const result = await dispatchStripeWebhookEvent(supabase, event);

    expect(mockGuestHandler).not.toHaveBeenCalled();
    expect(mockPurchaseHandler).toHaveBeenCalledWith(supabase, event);
    expect(result).toEqual({
      handled: true,
      purchaseId: 'purchase-auth-1',
      userId: 'user-auth-1',
    });
  });
});
