import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { processGuestConcursoCheckoutCompleted } from '@/lib/concursos/guestCheckoutWebhook';
import { processStripeWebhookEvent, type WebhookProcessResult } from '@/lib/pagamentos/webhook';
import { processProCheckoutCompleted, processProSubscriptionCancelled } from '@/lib/pro/webhook';
import { AVANT_PRO_PRODUTO_ID } from '@/lib/pro/constants';

/**
 * Encaminha eventos Stripe: assinatura AVANT enf Pro ou fluxo legado genérico de concursos.
 */
export async function dispatchStripeWebhookEvent(
  supabase: SupabaseClient,
  event: Stripe.Event,
): Promise<WebhookProcessResult> {
  if (event.type === 'customer.subscription.deleted') {
    return processProSubscriptionCancelled(supabase, event.data.object as Stripe.Subscription);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.produto === AVANT_PRO_PRODUTO_ID) {
      return processProCheckoutCompleted(supabase, session);
    }
    if (session.metadata?.guest_checkout === '1') {
      return processGuestConcursoCheckoutCompleted(supabase, session);
    }
  }

  return processStripeWebhookEvent(supabase, event);
}
