import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { invalidateUserModulosCache } from '@/lib/cache';
import { getConcursoBySlug, isActiveMatriculaRow } from '@/lib/concursos/entitlements';
import { logger } from '@/lib/logger';
import type { WebhookProcessResult } from '@/lib/pagamentos/webhook';
import { findOrCreateAuthUserByEmail } from '@/lib/supabase/adminUsers';

function readCustomerEmail(session: Stripe.Checkout.Session): string | null {
  const fromDetails = session.customer_details?.email?.trim();
  if (fromDetails) return fromDetails.toLowerCase();

  const direct = session.customer_email?.trim();
  return direct ? direct.toLowerCase() : null;
}

async function loadPurchaseByGatewayPaymentId(
  admin: SupabaseClient,
  gatewayPaymentId: string,
): Promise<{ id: string; user_id: string; status: string } | null> {
  const { data, error } = await admin
    .from('concurso_purchases')
    .select('id, user_id, status')
    .eq('gateway', 'stripe')
    .eq('gateway_payment_id', gatewayPaymentId)
    .maybeSingle();

  if (error) {
    logger.error('Falha ao carregar compra guest por gateway_payment_id', error, {
      gatewayPaymentId,
    });
    throw error;
  }

  return data;
}

/**
 * Fulfillment de checkout guest em `/concursos/[slug]/comprar` (sem purchase_id prévio).
 */
export async function processGuestConcursoCheckoutCompleted(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<WebhookProcessResult> {
  if (session.metadata?.guest_checkout !== '1') {
    return { handled: false, reason: 'not_guest_checkout' };
  }

  const concursoSlug = session.metadata?.concurso_slug?.trim();
  if (!concursoSlug) {
    return { handled: false, reason: 'missing_concurso_slug' };
  }

  if (session.payment_status !== 'paid') {
    return { handled: false, reason: 'checkout_not_paid' };
  }

  const gatewayPaymentId = session.id;
  if (!gatewayPaymentId) {
    return { handled: false, reason: 'missing_checkout_session_id' };
  }

  const existingPurchase = await loadPurchaseByGatewayPaymentId(admin, gatewayPaymentId);
  if (existingPurchase?.status === 'paid') {
    return {
      handled: true,
      purchaseId: existingPurchase.id,
      userId: existingPurchase.user_id,
    };
  }

  const email = readCustomerEmail(session);
  if (!email) {
    logger.warn('Checkout guest concurso sem e-mail de cliente', { sessionId: gatewayPaymentId });
    return { handled: false, reason: 'missing_customer_email' };
  }

  const displayName = session.customer_details?.name?.trim() || null;
  const { userId } = await findOrCreateAuthUserByEmail(admin, email, displayName);

  const concurso = await getConcursoBySlug(concursoSlug);
  if (!concurso || concurso.status !== 'ativo' || !concurso.price_cents || concurso.price_cents <= 0) {
    logger.warn('Checkout guest: concurso indisponível', { concursoSlug, sessionId: gatewayPaymentId });
    return { handled: false, reason: 'concurso_not_found' };
  }

  const { data: matricula, error: matriculaError } = await admin
    .from('concurso_matriculas')
    .select('status, expires_at')
    .eq('user_id', userId)
    .eq('concurso_id', concurso.id)
    .maybeSingle();

  if (matriculaError) {
    logger.error('Falha ao verificar matrícula no checkout guest', matriculaError, {
      userId,
      concursoSlug,
    });
    throw matriculaError;
  }

  if (matricula && isActiveMatriculaRow(matricula)) {
    return { handled: true, userId };
  }

  let purchaseId = existingPurchase?.id;

  if (!purchaseId) {
    const { data: purchase, error: purchaseError } = await admin
      .from('concurso_purchases')
      .insert({
        user_id: userId,
        concurso_id: concurso.id,
        amount: concurso.price_cents,
        status: 'pending',
        gateway: 'stripe',
        gateway_payment_id: gatewayPaymentId,
        currency: 'brl',
      })
      .select('id')
      .single();

    if (purchaseError || !purchase?.id) {
      const isDuplicate =
        purchaseError?.code === '23505' ||
        purchaseError?.message?.toLowerCase().includes('duplicate');

      if (isDuplicate) {
        const retry = await loadPurchaseByGatewayPaymentId(admin, gatewayPaymentId);
        if (retry?.id) {
          purchaseId = retry.id;
        }
      }

      if (!purchaseId) {
        logger.error('Falha ao registrar compra guest', purchaseError, {
          userId,
          concursoSlug,
          gatewayPaymentId,
        });
        throw purchaseError ?? new Error('insert purchase without id');
      }
    } else {
      purchaseId = purchase.id;
    }
  }

  const { error: fulfillError } = await admin.rpc('fulfill_concurso_purchase', {
    purchase_id: purchaseId,
  });

  if (fulfillError) {
    logger.error('Falha ao fulfill_concurso_purchase (guest)', fulfillError, {
      purchaseId,
      userId,
    });
    throw fulfillError;
  }

  try {
    await invalidateUserModulosCache(userId);
  } catch (cacheError) {
    logger.warn('Falha ao invalidar cache após compra guest', {
      purchaseId,
      userId,
      error: cacheError instanceof Error ? cacheError.message : String(cacheError),
    });
  }

  return { handled: true, purchaseId, userId };
}
