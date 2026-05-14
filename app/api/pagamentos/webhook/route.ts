import { NextRequest } from 'next/server';
import { handleStripeWebhookRequest } from '@/lib/stripe/webhookRouteHandler';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  return handleStripeWebhookRequest(request);
}
