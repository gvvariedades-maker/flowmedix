'use client';

import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useDashboardBottomInset, type DashboardBottomInsetVariant } from '@/lib/layout/useDashboardBottomInset';

export type DashboardMobilePageVariant = 'default' | 'actionBar' | 'none';

export type DashboardMobilePageProps = {
  children: ReactNode;
  className?: string;
  variant?: DashboardMobilePageVariant;
  /** Ajusta padding quando `PwaInstallProvider` exibe o banner (mobile). */
  pwaAware?: boolean;
  as?: ElementType;
};

/**
 * Wrapper de página no dashboard mobile.
 * BottomNav fica fora do scroll (DashboardShell); padding extra só para banner PWA.
 */
export function DashboardMobilePage({
  children,
  className,
  variant = 'default',
  pwaAware = true,
  as: Component = 'div',
}: DashboardMobilePageProps) {
  const insetVariant: DashboardBottomInsetVariant = variant === 'none' ? 'none' : variant;
  const { pageBottomPadding } = useDashboardBottomInset(pwaAware ? insetVariant : 'none');

  return <Component className={cn(pageBottomPadding, className)}>{children}</Component>;
}
