import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { processStripeWebhookEvent, type WebhookProcessResult } from '@/lib/pagamentos/webhook';
import { processCampinaGrandeCheckoutCompleted } from '@/lib/campina/webhook';
import { CAMPINA_GRANDE_PRODUTO_ID } from '@/lib/campina/constants';
import { processGoianinhaCheckoutCompleted } from '@/lib/goianinha/webhook';
import { GOIANINHA_PRODUTO_ID } from '@/lib/goianinha/constants';
import { processGuestConcursoCheckoutCompleted } from '@/lib/concursos/guestCheckoutWebhook';
import { processProCheckoutCompleted, processProSubscriptionCancelled } from '@/lib/pro/webhook';
import { AVANT_PRO_PRODUTO_ID } from '@/lib/pro/constants';

/**
 * Encaminha eventos Stripe: checkout Campina Grande, Goianinha ou fluxo de concursos existente.
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
    if (session.metadata?.produto === CAMPINA_GRANDE_PRODUTO_ID) {
      return processCampinaGrandeCheckoutCompleted(supabase, session);
    }
    if (session.metadata?.produto === GOIANINHA_PRODUTO_ID) {
      return processGoianinhaCheckoutCompleted(supabase, session);
    }
    if (session.metadata?.guest_checkout === '1') {
      return processGuestConcursoCheckoutCompleted(supabase, session);
    }
  }

  return processStripeWebhookEvent(supabase, event);
}
