'use client';

import type { ReactNode, RefObject } from 'react';
import { cn } from '@/lib/utils';

export type SimuladoMobileActionBarProps = {
  actionRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  children: ReactNode;
  /** @deprecated Shell flex: faixa inline no fim do conteúdo, sem spacer. */
  mobileSpacerClassName?: string;
};

const MOBILE_ACTION_BAR_SHELL = cn(
  'border-t border-white/10 bg-[#010409]/95 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-[#010409]/90',
);

/**
 * Faixa de ação no fluxo do documento (fim do formulário / runner).
 * Mobile e desktop: inline — o main do DashboardShell rola acima do BottomNav.
 */
export function SimuladoMobileActionBar({
  actionRef,
  className,
  children,
}: SimuladoMobileActionBarProps) {
  return (
    <div ref={actionRef} className={cn('w-full', MOBILE_ACTION_BAR_SHELL, className)}>
      {children}
    </div>
  );
}

/** @deprecated Resumo com 3 botões inline — spacer não é mais necessário. */
export const SIMULADO_RESUMO_MOBILE_ACTION_SPACER = 'h-0';
