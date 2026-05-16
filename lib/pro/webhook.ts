import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { GERAL_CONCURSO_SLUG } from '@/lib/concursos/entitlements';
import { findAuthUserByEmail } from '@/lib/supabase/adminUsers';
import { getStripeClient } from '@/lib/stripe/client';
import { logger } from '@/lib/logger';
import type { WebhookProcessResult } from '@/lib/pagamentos/webhook';
import { AVANT_PRO_PRODUTO_ID } from '@/lib/pro/constants';

function readCustomerEmail(session: Stripe.Checkout.Session): string | null {
  const fromDetails = session.customer_details?.email?.trim();
  if (fromDetails) return fromDetails.toLowerCase();

  const direct = session.customer_email?.trim();
  return direct ? direct.toLowerCase() : null;
}

async function getGeralConcursoId(admin: SupabaseClient): Promise<string | null> {
  const { data, error } = await admin
    .from('concursos')
    .select('id')
    .eq('slug', GERAL_CONCURSO_SLUG)
    .maybeSingle();

  if (error) {
    logger.error('Falha ao buscar concurso geral para Pro', error);
    throw error;
  }

  return data?.id ?? null;
}

/**
 * Fulfillment AVANT Pro após checkout.session.completed (assinatura).
 */
export async function processProCheckoutCompleted(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<WebhookProcessResult> {
  if (session.metadata?.produto !== AVANT_PRO_PRODUTO_ID) {
    return { handled: false, reason: 'not_pro_checkout' };
  }

  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
    return { handled: false, reason: 'checkout_not_paid' };
  }

  const userIdFromMeta = session.metadata?.user_id?.trim();
  let userId: string | null = userIdFromMeta || null;

  if (!userId) {
    const email = readCustomerEmail(session);
    if (!email) {
      logger.warn('Checkout Pro sem user_id nem e-mail', { sessionId: session.id });
      return { handled: false, reason: 'missing_user_and_email' };
    }

    const { user, error } = await findAuthUserByEmail(admin, email);
    if (error) {
      logger.error('Falha ao buscar usuário por e-mail (Pro checkout)', error, { email });
      throw error;
    }
    if (!user?.id) {
      logger.warn('Checkout Pro: usuário não encontrado por e-mail', { email, sessionId: session.id });
      return { handled: false, reason: 'user_not_found' };
    }
    userId = user.id;
  }

  const concursoId = await getGeralConcursoId(admin);
  if (!concursoId) {
    logger.error('Concurso geral não encontrado para fulfillment Pro');
    return { handled: false, reason: 'geral_concurso_missing' };
  }

  const { error: upsertError } = await admin.from('concurso_matriculas').upsert(
    {
      user_id: userId,
      concurso_id: concursoId,
      origem: 'stripe_pro',
      status: 'ativo',
      expires_at: null,
    },
    { onConflict: 'user_id,concurso_id' },
  );

  if (upsertError) {
    logger.error('Falha ao upsert matrícula Pro', upsertError, { userId, concursoId });
    throw upsertError;
  }

  logger.info('Matrícula AVANT Pro ativada via webhook', { userId, sessionId: session.id });
  return { handled: true, userId };
}

/**
 * Expira matrícula Pro quando a assinatura Stripe é cancelada.
 */
export async function processProSubscriptionCancelled(
  admin: SupabaseClient,
  subscription: Stripe.Subscription,
): Promise<WebhookProcessResult> {
  const customerRef = subscription.customer;
  const customerId =
    typeof customerRef === 'string' ? customerRef : customerRef?.id?.trim() ?? null;

  if (!customerId) {
    return { handled: false, reason: 'missing_customer_id' };
  }

  const stripe = getStripeClient();
  if (!stripe) {
    logger.error('Stripe não configurado para cancelamento Pro');
    return { handled: false, reason: 'stripe_not_configured' };
  }

  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    return { handled: false, reason: 'customer_deleted' };
  }

  const email = customer.email?.trim().toLowerCase();
  if (!email) {
    logger.warn('Cancelamento Pro: cliente Stripe sem e-mail', { customerId, subscriptionId: subscription.id });
    return { handled: false, reason: 'missing_customer_email' };
  }

  const { user, error: findError } = await findAuthUserByEmail(admin, email);
  if (findError) {
    logger.error('Falha ao buscar usuário por e-mail (Pro cancelamento)', findError, { email });
    throw findError;
  }

  if (!user?.id) {
    logger.warn('Cancelamento Pro: usuário não encontrado', { email, subscriptionId: subscription.id });
    return { handled: true };
  }

  const concursoId = await getGeralConcursoId(admin);
  if (!concursoId) {
    return { handled: false, reason: 'geral_concurso_missing' };
  }

  const { data: updated, error: updateError } = await admin
    .from('concurso_matriculas')
    .update({ status: 'expirado' })
    .eq('user_id', user.id)
    .eq('concurso_id', concursoId)
    .eq('origem', 'stripe_pro')
    .select('id');

  if (updateError) {
    logger.error('Falha ao expirar matrícula Pro', updateError, { userId: user.id });
    throw updateError;
  }

  if (!updated?.length) {
    logger.warn('Cancelamento Pro: nenhuma matrícula stripe_pro atualizada', {
      userId: user.id,
      subscriptionId: subscription.id,
    });
  }

  return { handled: true, userId: user.id };
}
