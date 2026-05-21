/** Destino pós-login para retomar checkout AVANT Pro (Stripe). */
export const PRO_CHECKOUT_PATH = '/assinar-pro';

export function proCheckoutLoginHref(): string {
  return `/login?next=${encodeURIComponent(PRO_CHECKOUT_PATH)}`;
}
