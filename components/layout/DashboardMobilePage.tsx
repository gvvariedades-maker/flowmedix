'use client';

import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useDashboardBottomInset, type DashboardBottomInsetVariant } from '@/lib/layout/useDashboardBottomInset';
import {
  MOBILE_PAGE_ACTION_BAR_STACK_PADDING,
  MOBILE_PAGE_BOTTOM_PADDING,
} from '@/lib/layout/mobileBottomNav';

export type DashboardMobilePageVariant = 'default' | 'actionBar' | 'none';

const VARIANT_PADDING: Record<Exclude<DashboardMobilePageVariant, 'none'>, string> = {
  default: MOBILE_PAGE_BOTTOM_PADDING,
  actionBar: MOBILE_PAGE_ACTION_BAR_STACK_PADDING,
};

export type DashboardMobilePageProps = {
  children: ReactNode;
  className?: string;
  variant?: DashboardMobilePageVariant;
  /** Ajusta padding quando `PwaInstallProvider` exibe o banner (mobile). */
  pwaAware?: boolean;
  as?: ElementType;
};

/**
 * Padding inferior mobile alinhado ao BottomNav (e faixa de ação, se `actionBar`).
 * Barras fixas não são alteradas — só o scroll area da página.
 */
export function DashboardMobilePage({
  children,
  className,
  variant = 'default',
  pwaAware = true,
  as: Component = 'div',
}: DashboardMobilePageProps) {
  const insetVariant: DashboardBottomInsetVariant = variant === 'none' ? 'none' : variant;
  const { pageBottomPadding: pwaPadding } = useDashboardBottomInset(
    pwaAware ? insetVariant : 'none',
  );

  const padding = pwaAware
    ? pwaPadding
    : variant === 'none'
      ? undefined
      : VARIANT_PADDING[variant];

  return <Component className={cn(padding, className)}>{children}</Component>;
}
