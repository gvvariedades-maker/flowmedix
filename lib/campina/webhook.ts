import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { findOrCreateAuthUserByEmail } from '@/lib/supabase/adminUsers';
import { logger } from '@/lib/logger';
import type { WebhookProcessResult } from '@/lib/pagamentos/webhook';
import { CAMPINA_GRANDE_PRODUTO_ID } from '@/lib/campina/constants';
import { fulfillCampinaGrandeAccess } from '@/lib/campina/fulfillment';

function readCustomerEmail(session: Stripe.Checkout.Session): string | null {
  const details = session.customer_details;
  const fromDetails = details?.email?.trim();
  if (fromDetails) return fromDetails.toLowerCase();

  const direct = session.customer_email?.trim();
  return direct ? direct.toLowerCase() : null;
}

/**
 * Fulfillment do pacote Campina Grande após checkout.session.completed (Stripe).
 */
export async function processCampinaGrandeCheckoutCompleted(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<WebhookProcessResult> {
  if (session.metadata?.produto !== CAMPINA_GRANDE_PRODUTO_ID) {
    return { handled: false, reason: 'not_campina_checkout' };
  }

  if (session.payment_status !== 'paid') {
    return { handled: false, reason: 'checkout_not_paid' };
  }

  const gatewayPaymentId = session.id;
  if (!gatewayPaymentId) {
    return { handled: false, reason: 'missing_checkout_session_id' };
  }

  const email = readCustomerEmail(session);
  if (!email) {
    logger.warn('Checkout Campina sem e-mail de cliente', { sessionId: gatewayPaymentId });
    return { handled: false, reason: 'missing_customer_email' };
  }

  const displayName = session.customer_details?.name?.trim() || null;

  const { userId } = await findOrCreateAuthUserByEmail(admin, email, displayName);

  await fulfillCampinaGrandeAccess(admin, userId, gatewayPaymentId);

  return { handled: true, userId };
}
