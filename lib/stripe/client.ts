import Stripe from 'stripe';
import { getStripeServerConfig } from '@/lib/env';

let stripeClient: Stripe | null | undefined;

export function getStripeClient(): Stripe | null {
  if (stripeClient !== undefined) {
    return stripeClient;
  }

  const config = getStripeServerConfig();
  if (!config) {
    stripeClient = null;
    return null;
  }

  stripeClient = new Stripe(config.secretKey);
  return stripeClient;
}

export function constructWebhookEvent(payload: string, signature: string): Stripe.Event {
  const config = getStripeServerConfig();
  if (!config) {
    throw new Error('Stripe não configurado.');
  }

  return Stripe.webhooks.constructEvent(payload, signature, config.webhookSecret);
}
