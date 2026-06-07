import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { invalidateUserModulosCache } from '@/lib/cache';
import { logger } from '@/lib/logger';

type PurchaseRow = {
  id: string;
  user_id: string;
  concurso_id: string;
  status: 'pending' | 'paid' | 'refunded';
  gateway_payment_id: string | null;
};

export type WebhookProcessResult =
  | { handled: true; purchaseId?: string; userId?: string }
  | { handled: false; reason: string };

function readPurchaseId(session: Stripe.Checkout.Session): string | null {
  const metadataId = session.metadata?.purchase_id?.trim();
  if (metadataId) return metadataId;

  const referenceId = session.client_reference_id?.trim();
  return referenceId || null;
}

async function loadPurchase(
  supabase: SupabaseClient,
  purchaseId: string,
): Promise<PurchaseRow | null> {
  const { data, error } = await supabase
    .from('concurso_purchases')
    .select('id, user_id, concurso_id, status, gateway_payment_id')
    .eq('id', purchaseId)
    .maybeSingle();

  if (error) {
    logger.error('Falha ao carregar compra para webhook', error, { purchaseId });
    throw error;
  }

  return (data as PurchaseRow | null) ?? null;
}

async function loadPurchaseByGatewayPaymentId(
  supabase: SupabaseClient,
  gatewayPaymentId: string,
): Promise<PurchaseRow | null> {
  const { data, error } = await supabase
    .from('concurso_purchases')
    .select('id, user_id, concurso_id, status, gateway_payment_id')
    .eq('gateway', 'stripe')
    .eq('gateway_payment_id', gatewayPaymentId)
    .maybeSingle();

  if (error) {
    logger.error('Falha ao carregar compra por gateway_payment_id', error, {
      gatewayPaymentId,
    });
    throw error;
  }

  return (data as PurchaseRow | null) ?? null;
}

async function fulfillPurchase(
  supabase: SupabaseClient,
  purchase: PurchaseRow,
  gatewayPaymentId: string,
): Promise<WebhookProcessResult> {
  if (purchase.status === 'paid') {
    return { handled: true, purchaseId: purchase.id, userId: purchase.user_id };
  }

  if (purchase.status !== 'pending') {
    return {
      handled: false,
      reason: `purchase_status_${purchase.status}`,
    };
  }

  if (
    purchase.gateway_payment_id &&
    purchase.gateway_payment_id !== gatewayPaymentId
  ) {
    return { handled: false, reason: 'gateway_payment_id_mismatch' };
  }

  const duplicate = await loadPurchaseByGatewayPaymentId(supabase, gatewayPaymentId);
  if (duplicate && duplicate.id !== purchase.id) {
    return { handled: false, reason: 'duplicate_gateway_payment_id' };
  }

  if (!purchase.gateway_payment_id) {
    const { error: updateError } = await supabase
      .from('concurso_purchases')
      .update({ gateway_payment_id: gatewayPaymentId })
      .eq('id', purchase.id)
      .eq('status', 'pending');

    if (updateError) {
      logger.error('Falha ao vincular gateway_payment_id à compra', updateError, {
        purchaseId: purchase.id,
        gatewayPaymentId,
      });
      throw updateError;
    }
  }

  const { error: fulfillError } = await supabase.rpc('fulfill_concurso_purchase', {
    purchase_id: purchase.id,
  });

  if (fulfillError) {
    logger.error('Falha ao fulfill_concurso_purchase', fulfillError, {
      purchaseId: purchase.id,
    });
    throw fulfillError;
  }

  try {
    await invalidateUserModulosCache(purchase.user_id);
  } catch (cacheError) {
    logger.warn('Falha ao invalidar cache após compra', {
      purchaseId: purchase.id,
      userId: purchase.user_id,
      error: cacheError instanceof Error ? cacheError.message : String(cacheError),
    });
  }

  return { handled: true, purchaseId: purchase.id, userId: purchase.user_id };
}

export async function processStripeWebhookEvent(
  supabase: SupabaseClient,
  event: Stripe.Event,
): Promise<WebhookProcessResult> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== 'paid') {
        return { handled: false, reason: 'checkout_not_paid' };
      }

      const purchaseId = readPurchaseId(session);
      if (!purchaseId) {
        return { handled: false, reason: 'missing_purchase_id' };
      }

      const purchase = await loadPurchase(supabase, purchaseId);
      if (!purchase) {
        return { handled: false, reason: 'purchase_not_found' };
      }

      const gatewayPaymentId = session.id;
      if (!gatewayPaymentId) {
        return { handled: false, reason: 'missing_gateway_payment_id' };
      }

      return fulfillPurchase(supabase, purchase, gatewayPaymentId);
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const purchaseId = charge.metadata?.purchase_id?.trim();
      if (!purchaseId) {
        return { handled: false, reason: 'missing_purchase_id' };
      }

      const purchase = await loadPurchase(supabase, purchaseId);
      if (!purchase) {
        return { handled: false, reason: 'purchase_not_found' };
      }

      if (purchase.status === 'refunded') {
        return { handled: true, purchaseId: purchase.id, userId: purchase.user_id };
      }

      const { error } = await supabase
        .from('concurso_purchases')
        .update({ status: 'refunded' })
        .eq('id', purchase.id)
        .in('status', ['pending', 'paid']);

      if (error) {
        logger.error('Falha ao marcar compra como refunded', error, { purchaseId });
        throw error;
      }

      const { error: matriculaError } = await supabase
        .from('concurso_matriculas')
        .update({ status: 'expirado' })
        .eq('user_id', purchase.user_id)
        .eq('concurso_id', purchase.concurso_id)
        .eq('origem', 'purchase');

      if (matriculaError) {
        logger.error('Falha ao expirar matrícula após reembolso', matriculaError, {
          purchaseId,
          userId: purchase.user_id,
          concursoId: purchase.concurso_id,
        });
        throw matriculaError;
      }

      try {
        await invalidateUserModulosCache(purchase.user_id);
      } catch (cacheError) {
        logger.warn('Falha ao invalidar cache após reembolso', {
          purchaseId,
          userId: purchase.user_id,
          error: cacheError instanceof Error ? cacheError.message : String(cacheError),
        });
      }

      return { handled: true, purchaseId: purchase.id, userId: purchase.user_id };
    }

    default:
      return { handled: false, reason: `ignored_event_${event.type}` };
  }
}
