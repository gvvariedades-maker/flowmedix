import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabase } from '@/lib/supabase/server';
import { getStripeServerConfig } from '@/lib/env';
import { dispatchStripeWebhookEvent } from '@/lib/stripe/webhookDispatcher';
import { constructWebhookEvent } from '@/lib/stripe/client';
import {
  claimStripeWebhookEvent,
  hashStripeWebhookPayload,
  markStripeWebhookEventProcessed,
  releaseStripeWebhookEventClaim,
} from '@/lib/stripe/webhookEventLedger';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

const RETRIABLE_WEBHOOK_REASONS = new Set([
  'purchase_not_found',
  'geral_concurso_missing',
  'missing_customer_email',
  'concurso_not_found',
  'missing_concurso_slug',
]);

/** Motivos em que o Stripe deve reenfileirar o evento (HTTP 500). */
export function isRetriableWebhookFailure(reason: string): boolean {
  return RETRIABLE_WEBHOOK_REASONS.has(reason);
}

export async function handleStripeWebhookRequest(request: NextRequest): Promise<NextResponse> {
  const stripeConfig = getStripeServerConfig();
  if (!stripeConfig) {
    return NextResponse.json({ error: 'Pagamentos indisponíveis no momento.' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Assinatura ausente.' }, { status: 400 });
  }

  const rawBody = await request.text();

  let event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (error) {
    logger.warn('Assinatura Stripe inválida no webhook', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 });
  }

  const payloadHash = hashStripeWebhookPayload(rawBody);
  let supabase: SupabaseClient | null = null;
  let claimed = false;

  try {
    supabase = await createServerSupabase();
    const claim = await claimStripeWebhookEvent(supabase, event, { payloadHash });

    if (claim === 'already_processed') {
      logger.info('Webhook Stripe já processado (event.id)', {
        eventId: event.id,
        type: event.type,
      });
      return NextResponse.json({
        received: true,
        handled: true,
        already_processed: true,
      });
    }

    if (claim === 'in_flight') {
      logger.warn('Webhook Stripe ainda em processamento por outro worker', {
        eventId: event.id,
        type: event.type,
      });
      // 503: Stripe reenfileira; não afirmar sucesso antes do fulfill.
      return NextResponse.json(
        { error: 'Evento em processamento.', reason: 'webhook_in_flight' },
        { status: 503 },
      );
    }

    claimed = true;

    const result = await dispatchStripeWebhookEvent(supabase, event);

    if (!result.handled) {
      if (isRetriableWebhookFailure(result.reason)) {
        await releaseStripeWebhookEventClaim(supabase, event.id);
        claimed = false;
        logger.warn('Falha retriável no webhook Stripe — Stripe reenfileirará', {
          type: event.type,
          eventId: event.id,
          reason: result.reason,
        });
        return NextResponse.json(
          { error: 'Falha temporária ao processar webhook.', reason: result.reason },
          { status: 500 },
        );
      }

      logger.info('Evento Stripe ignorado pelo webhook', {
        type: event.type,
        eventId: event.id,
        reason: result.reason,
      });
    }

    try {
      await markStripeWebhookEventProcessed(supabase, event.id);
      claimed = false;
    } catch (markError) {
      // Fulfill já ocorreu (ou evento ignorado de forma estável). Não liberar claim
      // nem devolver 500 — Stripe reprocessaria; state-based fulfill é idempotente.
      // Row pode ficar em `processing` até ops/reaper; retries recebem 503 in_flight.
      logger.error('Falha ao marcar event processed após dispatch', markError, {
        type: event.type,
        eventId: event.id,
      });
      claimed = false;
    }

    return NextResponse.json({
      received: true,
      handled: result.handled,
      ...(result.handled ? {} : { reason: result.reason }),
    });
  } catch (error) {
    if (claimed && supabase) {
      try {
        await releaseStripeWebhookEventClaim(supabase, event.id);
      } catch (releaseError) {
        logger.error('Erro ao liberar claim após falha no webhook Stripe', releaseError, {
          type: event.type,
          eventId: event.id,
        });
      }
    }
    logger.error('Erro ao processar webhook Stripe', error, {
      type: event.type,
      eventId: event.id,
    });
    return NextResponse.json({ error: 'Erro ao processar webhook.' }, { status: 500 });
  }
}
