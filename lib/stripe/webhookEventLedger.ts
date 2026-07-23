import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { logger } from '@/lib/logger';

/** claimed = este worker; already_processed = done; in_flight = outro worker ainda processa. */
export type StripeWebhookClaimResult = 'claimed' | 'already_processed' | 'in_flight';

export function hashStripeWebhookPayload(rawBody: string): string {
  return createHash('sha256').update(rawBody, 'utf8').digest('hex');
}

function isUniqueViolation(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === '23505' ||
    (error.message?.toLowerCase().includes('duplicate') ?? false)
  );
}

/**
 * Claim atômico por `event.id` com status `processing`.
 * - `already_processed` → no-op 200
 * - `in_flight` → 503 para Stripe retry (não afirmar sucesso antes do fulfill)
 * Em falha retriável do handler, chamar `releaseStripeWebhookEventClaim`.
 * Após dispatch ok/ignorado, chamar `markStripeWebhookEventProcessed`.
 */
export async function claimStripeWebhookEvent(
  supabase: SupabaseClient,
  event: Pick<Stripe.Event, 'id' | 'type'>,
  options?: { payloadHash?: string | null },
): Promise<StripeWebhookClaimResult> {
  const { error } = await supabase.from('stripe_webhook_events').insert({
    event_id: event.id,
    type: event.type,
    status: 'processing',
    payload_hash: options?.payloadHash ?? null,
    processed_at: null,
  });

  if (isUniqueViolation(error)) {
    const { data, error: selectError } = await supabase
      .from('stripe_webhook_events')
      .select('status')
      .eq('event_id', event.id)
      .maybeSingle();

    if (selectError) {
      logger.error('Falha ao ler status stripe_webhook_events após conflito', selectError, {
        eventId: event.id,
      });
      throw selectError;
    }

    if (data?.status === 'processed') {
      return 'already_processed';
    }

    // processing, row ausente (race com release), ou status inesperado → retry Stripe
    return 'in_flight';
  }

  if (error) {
    logger.error('Falha ao claim stripe_webhook_events', error, {
      eventId: event.id,
      type: event.type,
    });
    throw error;
  }

  return 'claimed';
}

export async function markStripeWebhookEventProcessed(
  supabase: SupabaseClient,
  eventId: string,
): Promise<void> {
  const { error } = await supabase
    .from('stripe_webhook_events')
    .update({
      status: 'processed',
      processed_at: new Date().toISOString(),
    })
    .eq('event_id', eventId);

  if (error) {
    logger.error('Falha ao marcar stripe_webhook_events processed', error, { eventId });
    throw error;
  }
}

/** Remove claim para permitir retry do Stripe após falha retriável / 500. */
export async function releaseStripeWebhookEventClaim(
  supabase: SupabaseClient,
  eventId: string,
): Promise<void> {
  const { error } = await supabase
    .from('stripe_webhook_events')
    .delete()
    .eq('event_id', eventId);

  if (error) {
    logger.error('Falha ao liberar claim stripe_webhook_events', error, { eventId });
    throw error;
  }
}
