'use client';

import { usePwaInstallContext } from '@/components/pwa/PwaInstallProvider';
import {
  getDashboardPageBottomPadding,
  type DashboardPageBottomPaddingVariant,
} from '@/lib/layout/mobileBottomNav';

export type DashboardBottomInsetVariant = DashboardPageBottomPaddingVariant | 'none';

/**
 * Padding inferior do conteúdo quando o banner PWA está visível (z-[60]).
 * Usar em páginas longas P0/P1; não altera markup do `PwaInstallPanel`.
 */
export function useDashboardBottomInset(variant: DashboardBottomInsetVariant = 'default') {
  const { visible: pwaVisible } = usePwaInstallContext();

  const pageBottomPadding =
    variant === 'none' ? undefined : getDashboardPageBottomPadding(variant, pwaVisible);

  return { pageBottomPadding, pwaVisible };
}
