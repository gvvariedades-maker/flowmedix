import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { dispatchStripeWebhookEvent } from '@/lib/stripe/webhookDispatcher';
import { processStripeWebhookEvent } from '@/lib/pagamentos/webhook';
import { processProCheckoutCompleted } from '@/lib/pro/webhook';

jest.mock('@/lib/pagamentos/webhook', () => ({
  processStripeWebhookEvent: jest.fn(),
}));

jest.mock('@/lib/pro/webhook', () => ({
  processProCheckoutCompleted: jest.fn(),
  processProSubscriptionCancelled: jest.fn(),
}));

const mockPurchaseHandler = processStripeWebhookEvent as jest.MockedFunction<
  typeof processStripeWebhookEvent
>;
const mockProHandler = processProCheckoutCompleted as jest.MockedFunction<
  typeof processProCheckoutCompleted
>;

describe('dispatchStripeWebhookEvent', () => {
  const supabase = {} as SupabaseClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProHandler.mockResolvedValue({ handled: true, userId: 'user-pro-1' });
    mockPurchaseHandler.mockResolvedValue({
      handled: true,
      purchaseId: 'purchase-auth-1',
      userId: 'user-auth-1',
    });
  });

  it('encaminha checkout AVANT Pro para processProCheckoutCompleted', async () => {
    const session = {
      id: 'cs_pro_123',
      payment_status: 'paid',
      metadata: { produto: 'avant-pro', user_id: 'user-pro-1' },
    } as Stripe.Checkout.Session;

    const event = {
      type: 'checkout.session.completed',
      data: { object: session },
    } as Stripe.Event;

    const result = await dispatchStripeWebhookEvent(supabase, event);

    expect(mockProHandler).toHaveBeenCalledWith(supabase, session);
    expect(mockPurchaseHandler).not.toHaveBeenCalled();
    expect(result).toEqual({ handled: true, userId: 'user-pro-1' });
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

    expect(mockProHandler).not.toHaveBeenCalled();
    expect(mockPurchaseHandler).toHaveBeenCalledWith(supabase, event);
    expect(result).toEqual({
      handled: true,
      purchaseId: 'purchase-auth-1',
      userId: 'user-auth-1',
    });
  });
});
