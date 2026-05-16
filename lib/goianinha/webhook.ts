import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { findOrCreateAuthUserByEmail } from '@/lib/supabase/adminUsers';
import { logger } from '@/lib/logger';
import type { WebhookProcessResult } from '@/lib/pagamentos/webhook';
import { GOIANINHA_PRODUTO_ID } from '@/lib/goianinha/constants';

function readCustomerEmail(session: Stripe.Checkout.Session): string | null {
  const details = session.customer_details;
  const fromDetails = details?.email?.trim();
  if (fromDetails) return fromDetails.toLowerCase();

  const direct = session.customer_email?.trim();
  return direct ? direct.toLowerCase() : null;
}

/**
 * Fulfillment do pacote Goianinha após checkout.session.completed (Stripe).
 */
export async function processGoianinhaCheckoutCompleted(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<WebhookProcessResult> {
  if (session.metadata?.produto !== GOIANINHA_PRODUTO_ID) {
    return { handled: false, reason: 'not_goianinha_checkout' };
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
    logger.warn('Checkout Goianinha sem e-mail de cliente', { sessionId: gatewayPaymentId });
    return { handled: false, reason: 'missing_customer_email' };
  }

  const displayName = session.customer_details?.name?.trim() || null;

  const { userId } = await findOrCreateAuthUserByEmail(admin, email, displayName);

  const { error: insertError } = await admin.from('acessos').insert({
    user_id: userId,
    produto: GOIANINHA_PRODUTO_ID,
    stripe_checkout_session_id: gatewayPaymentId,
  });

  if (insertError) {
    const isDuplicate =
      insertError.code === '23505' ||
      insertError.message?.toLowerCase().includes('duplicate');

    if (isDuplicate) {
      return { handled: true, userId };
    }

    logger.error('Falha ao inserir acesso Goianinha', insertError, {
      userId,
      sessionId: gatewayPaymentId,
    });
    throw insertError;
  }

  return { handled: true, userId };
}
