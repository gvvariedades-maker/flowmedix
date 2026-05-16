/**
 * Métodos de pagamento explícitos no Checkout (BRL).
 * Sem isso, contas Stripe em live podem falhar com:
 * "No valid payment method types for this Checkout Session".
 */
export const STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES = ['card'] as const;
