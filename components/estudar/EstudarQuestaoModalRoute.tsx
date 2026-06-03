'use client';

import type { ReactNode } from 'react';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import EstudarQuestaoSkeleton from '@/components/lesson/EstudarQuestaoSkeleton';
import { useQuestaoNavigation } from '@/components/lesson/questao-navigation-context';
import { isEstudarModalRouteEnabled } from '@/lib/estudar/estudarL0Config';
import { MOBILE_BOTTOM_NAV_FIXED_BOTTOM } from '@/lib/layout/mobileBottomNav';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

type EstudarQuestaoModalRouteProps = {
  children: ReactNode;
};

/**
 * Intercepting route @modal (fase 11.2): questão sobre a vitrine no mobile.
 * Desktop: sem overlay — player permanece no shell ao lado da sidebar.
 * `children` inclui EstudarQuestaoHydrator (render null).
 */
export function EstudarQuestaoModalRoute({ children }: EstudarQuestaoModalRouteProps) {
  const { displayPayload, dismissToVitrine } = useQuestaoNavigation();
  const modalEnabled = isEstudarModalRouteEnabled();

  if (!modalEnabled) {
    return <>{children}</>;
  }

  const close = () => {
    dismissToVitrine({
      fromPlano: displayPayload?.fromPlano,
      fromCaderno: displayPayload?.fromCaderno,
      vitrineQuerySuffix: displayPayload?.vitrineQuerySuffix,
    });
  };

  return (
    <>
      {children}
      <div
        className={cn(
          'fixed inset-x-0 top-0 z-[100] flex flex-col md:hidden',
          MOBILE_BOTTOM_NAV_FIXED_BOTTOM,
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Questão"
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
          aria-label="Fechar questão"
          onClick={close}
        />
        <div
          className={cn(
            'relative z-10 mt-auto flex min-h-0 max-h-full flex-1 flex-col',
            'rounded-t-[2rem] border border-white/10 bg-[#010409] shadow-2xl',
            '[view-transition-name:estudar-questao-root]',
          )}
        >
          <div className="flex shrink-0 items-center justify-end px-3 pt-3">
            <button
              type="button"
              onClick={close}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-white/80"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-safe">
            {displayPayload ? (
              <AvantLessonPlayer key="estudar-lesson-player-modal" {...displayPayload} />
            ) : (
              <EstudarQuestaoSkeleton />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
