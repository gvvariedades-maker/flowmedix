import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { getStripeServerConfig } from '@/lib/env';
import { dispatchStripeWebhookEvent } from '@/lib/stripe/webhookDispatcher';
import { constructWebhookEvent } from '@/lib/stripe/client';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

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

  try {
    const supabase = await createServerSupabase();
    const result = await dispatchStripeWebhookEvent(supabase, event);

    if (!result.handled) {
      logger.info('Evento Stripe ignorado pelo webhook', {
        type: event.type,
        reason: result.reason,
      });
    }

    return NextResponse.json({
      received: true,
      handled: result.handled,
      ...(result.handled ? {} : { reason: result.reason }),
    });
  } catch (error) {
    logger.error('Erro ao processar webhook Stripe', error, { type: event.type });
    return NextResponse.json({ error: 'Erro ao processar webhook.' }, { status: 500 });
  }
}
