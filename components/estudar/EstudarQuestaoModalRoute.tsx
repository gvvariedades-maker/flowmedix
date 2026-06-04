'use client';

import type { ReactNode } from 'react';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import { useQuestaoNavigation } from '@/components/lesson/questao-navigation-context';
import { isEstudarModalRouteEnabled } from '@/lib/estudar/estudarL0Config';
import { useBodyScrollLock } from '@/lib/layout/useBodyScrollLock';
import { cn } from '@/lib/utils';

type EstudarQuestaoModalRouteProps = {
  children: ReactNode;
};

/**
 * Intercepting route @modal (fase 11.2): questão sobre a vitrine no mobile.
 * Desktop: sem overlay — player permanece no shell ao lado da sidebar.
 * `children` inclui EstudarQuestaoHydrator (render null).
 */
export function EstudarQuestaoModalRoute({ children }: EstudarQuestaoModalRouteProps) {
  const { displayPayload, dismissToVitrine, isDismissingToVitrine } = useQuestaoNavigation();
  const modalEnabled = isEstudarModalRouteEnabled();
  const showModalOverlay = Boolean(displayPayload) && !isDismissingToVitrine;

  useBodyScrollLock(modalEnabled && showModalOverlay);

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
      {showModalOverlay ? (
      <div
        className="fixed inset-0 z-[100] flex flex-col md:hidden"
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
            'relative z-10 mt-auto flex min-h-0 max-h-full flex-1 flex-col pt-safe',
            'rounded-t-[2rem] border border-white/10 bg-[#010409] shadow-2xl',
            '[view-transition-name:estudar-questao-root]',
          )}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pt-3">
            <AvantLessonPlayer key="estudar-lesson-player-modal" {...displayPayload!} />
          </div>
        </div>
      </div>
      ) : null}
    </>
  );
}
