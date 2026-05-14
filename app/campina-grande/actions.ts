'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getStripeClient } from '@/lib/stripe/client';
import { requireStripePriceIdCampina } from '@/lib/campina/env';
import { getAbsoluteUrl } from '@/lib/siteUrl';
import { CAMPINA_GRANDE_PRODUTO_ID } from '@/lib/campina/constants';

const CampinaCheckoutFormSchema = z.object({
  intent: z.literal('campina-checkout'),
});

export async function iniciarCheckoutCampinaGrande(formData: FormData) {
  const parsed = CampinaCheckoutFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    throw new Error('Dados do formulário inválidos.');
  }

  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error(
      'Pagamentos indisponíveis: configure STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET no servidor.',
    );
  }

  const priceId = requireStripePriceIdCampina();

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      produto: CAMPINA_GRANDE_PRODUTO_ID,
    },
    success_url: getAbsoluteUrl('/sucesso?session_id={CHECKOUT_SESSION_ID}'),
    cancel_url: getAbsoluteUrl('/campina-grande'),
  });

  if (!checkoutSession.url) {
    throw new Error('Checkout Stripe não retornou URL de redirecionamento.');
  }

  redirect(checkoutSession.url);
}
