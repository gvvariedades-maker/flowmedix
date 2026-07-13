import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { dispatchStripeWebhookEvent } from '@/lib/stripe/webhookDispatcher';
import { processGuestConcursoCheckoutCompleted } from '@/lib/concursos/guestCheckoutWebhook';
import { processStripeWebhookEvent } from '@/lib/pagamentos/webhook';
import { processProCheckoutCompleted } from '@/lib/pro/webhook';

jest.mock('@/lib/pagamentos/webhook', () => ({
  processStripeWebhookEvent: jest.fn(),
}));

jest.mock('@/lib/pro/webhook', () => ({
  processProCheckoutCompleted: jest.fn(),
  processProSubscriptionCancelled: jest.fn(),
}));

jest.mock('@/lib/concursos/guestCheckoutWebhook', () => ({
  processGuestConcursoCheckoutCompleted: jest.fn(),
}));

const mockPurchaseHandler = processStripeWebhookEvent as jest.MockedFunction<
  typeof processStripeWebhookEvent
>;
const mockProHandler = processProCheckoutCompleted as jest.MockedFunction<
  typeof processProCheckoutCompleted
>;
const mockGuestHandler = processGuestConcursoCheckoutCompleted as jest.MockedFunction<
  typeof processGuestConcursoCheckoutCompleted
>;

describe('dispatchStripeWebhookEvent', () => {
  const supabase = {} as SupabaseClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProHandler.mockResolvedValue({ handled: true, userId: 'user-pro-1' });
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

  it('encaminha checkout AVANT Enf Pro para processProCheckoutCompleted', async () => {
    const session = {
      id: 'cs_pro_123',
      payment_status: 'paid',
      metadata: { produto: 'avant-pro', user_id: 'user-pro-1' },
    } as unknown as Stripe.Checkout.Session;

    const event = {
      type: 'checkout.session.completed',
      data: { object: session },
    } as unknown as Stripe.Event;

    const result = await dispatchStripeWebhookEvent(supabase, event);

    expect(mockProHandler).toHaveBeenCalledWith(supabase, session);
    expect(mockPurchaseHandler).not.toHaveBeenCalled();
    expect(result).toEqual({ handled: true, userId: 'user-pro-1' });
  });

  it('encaminha checkout guest para processGuestConcursoCheckoutCompleted', async () => {
    const session = {
      id: 'cs_guest_123',
      payment_status: 'paid',
      metadata: { guest_checkout: '1', concurso_slug: 'goianinha-rn' },
      customer_details: { email: 'guest@example.com' },
    } as unknown as Stripe.Checkout.Session;

    const event = {
      type: 'checkout.session.completed',
      data: { object: session },
    } as unknown as Stripe.Event;

    const result = await dispatchStripeWebhookEvent(supabase, event);

    expect(mockGuestHandler).toHaveBeenCalledWith(supabase, session);
    expect(mockProHandler).not.toHaveBeenCalled();
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
    } as unknown as Stripe.Event;

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
