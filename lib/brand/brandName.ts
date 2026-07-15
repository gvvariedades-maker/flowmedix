/**
 * Nome público da plataforma — fonte única para copy, SEO e metadata.
 * O lockup visual mantém wordmark «AVANT» + subtítulo «enf» (ver AvantLogo).
 */

/** Nome completo da plataforma */
export const BRAND_NAME = 'AVANT enf';

/** Assinatura paga (Stripe) */
export const BRAND_PRO_NAME = 'AVANT enf Pro';

/** Wordmark no logo (sem subtítulo) */
export const BRAND_WORDMARK = 'AVANT';

/** Subtítulo no lockup (minúsculo — mesmo lockup "AVANT enf" do emblema) */
export const BRAND_LOGO_SUBTITLE = 'enf';

/** PWA / apple-mobile-web-app-title (curto) */
export const BRAND_SHORT_NAME = 'AVANT enf';

/** Sufixo em `<title>` de páginas internas */
export const BRAND_TITLE_SUFFIX = ' | AVANT enf';

export function brandPageTitle(page: string): string {
  return `${page}${BRAND_TITLE_SUFFIX}`;
}

export function brandCopyright(year = new Date().getFullYear()): string {
  return `© ${year} ${BRAND_NAME} · Todos os direitos reservados`;
}
