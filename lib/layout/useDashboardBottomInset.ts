'use client';

import { usePwaInstallVisible } from '@/components/pwa/PwaInstallProvider';
import {
  getDashboardPageBottomPadding,
  type DashboardPageBottomPaddingVariant,
} from '@/lib/layout/mobileBottomNav';

export type DashboardBottomInsetVariant = DashboardPageBottomPaddingVariant | 'none';

/**
 * Padding inferior opcional no conteúdo (dentro do main rolável).
 * Com flex shell, BottomNav fica fora do scroll; só banner PWA exige reserva.
 */
export function useDashboardBottomInset(variant: DashboardBottomInsetVariant = 'default') {
  const pwaVisible = usePwaInstallVisible();

  const pageBottomPadding =
    variant === 'none' ? undefined : getDashboardPageBottomPadding(variant, pwaVisible);

  return { pageBottomPadding, pwaVisible };
}
