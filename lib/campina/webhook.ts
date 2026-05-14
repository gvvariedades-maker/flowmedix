import { randomBytes } from 'node:crypto';
import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { findAuthUserByEmail } from '@/lib/supabase/adminUsers';
import { logger } from '@/lib/logger';
import type { WebhookProcessResult } from '@/lib/pagamentos/webhook';
import { CAMPINA_GRANDE_PRODUTO_ID } from '@/lib/campina/constants';

function readCustomerEmail(session: Stripe.Checkout.Session): string | null {
  const details = session.customer_details;
  const fromDetails = details?.email?.trim();
  if (fromDetails) return fromDetails.toLowerCase();

  const direct = session.customer_email?.trim();
  return direct ? direct.toLowerCase() : null;
}

async function findOrCreateAuthUserByEmail(
  admin: SupabaseClient,
  email: string,
  displayName: string | null,
): Promise<{ userId: string }> {
  const { user: existing } = await findAuthUserByEmail(admin, email);
  if (existing?.id) {
    return { userId: existing.id };
  }

  const password = randomBytes(32).toString('base64url');
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: displayName ? { full_name: displayName } : undefined,
  });

  if (error || !data.user?.id) {
    logger.error('Falha ao criar usuário Auth após compra Campina', error, { email });
    throw error ?? new Error('createUser sem retorno de usuário');
  }

  return { userId: data.user.id };
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

  const { error: insertError } = await admin.from('acessos').insert({
    user_id: userId,
    produto: CAMPINA_GRANDE_PRODUTO_ID,
    stripe_checkout_session_id: gatewayPaymentId,
  });

  if (insertError) {
    const isDuplicate =
      insertError.code === '23505' ||
      insertError.message?.toLowerCase().includes('duplicate');

    if (isDuplicate) {
      return { handled: true, userId };
    }

    logger.error('Falha ao inserir acesso Campina Grande', insertError, {
      userId,
      sessionId: gatewayPaymentId,
    });
    throw insertError;
  }

  return { handled: true, userId };
}
