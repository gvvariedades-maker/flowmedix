'use client';

import { useEffect, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { usePwaInstallContext } from '@/components/pwa/PwaInstallProvider';
import {
  MOBILE_ACTION_BAR_STACK_SPACER,
  MOBILE_ACTION_BAR_STACK_SPACER_WITH_PWA,
  MOBILE_ACTION_BAR_Z,
  MOBILE_BOTTOM_NAV_FIXED_BOTTOM,
} from '@/lib/layout/mobileBottomNav';

const MOBILE_ACTION_BAR_SHELL = cn(
  'fixed inset-x-0 border-t border-white/10 bg-[#010409]/95 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-[#010409]/90',
  MOBILE_BOTTOM_NAV_FIXED_BOTTOM,
  MOBILE_ACTION_BAR_Z,
);

export type SimuladoMobileActionBarProps = {
  actionRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  children: ReactNode;
  /** Reserva no fluxo do documento (classe Tailwind de altura). */
  mobileSpacerClassName?: string;
};

/**
 * Mobile: portal fixo acima do BottomNav. Desktop: filho inline no fluxo.
 */
export function SimuladoMobileActionBar({
  actionRef,
  className,
  children,
  mobileSpacerClassName,
}: SimuladoMobileActionBarProps) {
  const [mounted, setMounted] = useState(false);
  const { visible: pwaVisible } = usePwaInstallContext();
  const resolvedSpacerClassName =
    mobileSpacerClassName ??
    (pwaVisible ? MOBILE_ACTION_BAR_STACK_SPACER_WITH_PWA : MOBILE_ACTION_BAR_STACK_SPACER);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <div className={cn('shrink-0 md:hidden', resolvedSpacerClassName)} aria-hidden />
      {mounted
        ? createPortal(
            <div ref={actionRef} className={cn(MOBILE_ACTION_BAR_SHELL, 'md:hidden')}>
              <div className={cn('mx-auto w-full max-w-3xl', className)}>{children}</div>
            </div>,
            document.body,
          )
        : null}
      <div className="hidden w-full md:block">
        <div className={cn('mx-auto w-full max-w-3xl', className)}>{children}</div>
      </div>
    </>
  );
}

/** 3 botões h-12 empilhados + gaps + py da faixa fixa. */
export const SIMULADO_RESUMO_MOBILE_ACTION_SPACER = 'h-[12.5rem]';
