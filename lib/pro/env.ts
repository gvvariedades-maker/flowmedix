import { z } from 'zod';

const StripePriceIdSchema = z
  .string()
  .min(1)
  .regex(/^price_/, 'STRIPE_PRICE_ID_PRO deve ser um Price ID Stripe (price_…)');

/**
 * Price ID da assinatura AVANT enf Pro (Dashboard Stripe → Produtos → Preço recorrente).
 * @throws Error com mensagem explícita se ausente ou inválido
 */
export function requireStripePriceIdPro(): string {
  const raw = process.env.STRIPE_PRICE_ID_PRO;
  if (raw === undefined || raw === null || raw.trim() === '') {
    throw new Error(
      'Variável de ambiente obrigatória ausente ou vazia: STRIPE_PRICE_ID_PRO. ' +
        'Configure o Price ID da assinatura no Stripe.',
    );
  }

  const parsed = StripePriceIdSchema.safeParse(raw.trim());
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join('; ');
    throw new Error(`STRIPE_PRICE_ID_PRO inválido: ${msg}`);
  }

  return parsed.data;
}
