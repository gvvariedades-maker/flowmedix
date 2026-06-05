'use client';

import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import EstudarQuestaoSkeleton from '@/components/lesson/EstudarQuestaoSkeleton';
import { useEstudarQuestaoShellState } from '@/components/lesson/useEstudarQuestaoShellState';
import { useEstudarModalActive } from '@/components/estudar/useEstudarModalActive';
import { useEstudarInterceptActive } from '@/components/estudar/useEstudarInterceptActive';
import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';
import { cn } from '@/lib/utils';

type EstudarQuestaoShellProps = {
  children: ReactNode;
  modal?: ReactNode;
};

export default function EstudarQuestaoShell({ children, modal = null }: EstudarQuestaoShellProps) {
  const interceptActive = useEstudarInterceptActive();
  const modalActive = useEstudarModalActive();
  const {
    isQuestaoRoute,
    showPlayer,
    showSkeleton,
    displayPayload,
    isPayloadStale,
    isDismissingToVitrine,
  } = useEstudarQuestaoShellState({ modalActive });

  const hideVitrineChildren = modalActive
    ? isQuestaoRoute && !isDismissingToVitrine
    : isQuestaoRoute && (showPlayer || showSkeleton);

  const vitrineSlotInteractive =
    !hideVitrineChildren && !(interceptActive && !isDismissingToVitrine);

  const showVitrineInterceptLoading =
    interceptActive && !isDismissingToVitrine && !hideVitrineChildren;

  const fillViewport = showPlayer || showSkeleton;

  return (
    <DashboardMobilePage
      variant="default"
      className={cn(
        'relative flex min-h-0 w-full flex-1 flex-col bg-[#010409] font-sans',
        fillViewport
          ? 'h-full px-0 py-0'
          : 'px-3 py-3 sm:px-4 md:px-6 md:py-6 md:pb-6',
      )}
    >
      <div
        className={cn(
          'flex min-h-0 w-full flex-1 flex-col',
          fillViewport ? 'mx-0 h-full max-w-none' : 'mx-auto max-w-6xl',
        )}
      >
        {showPlayer && displayPayload ? (
          <div
            className={cn(
              'flex h-full min-h-0 flex-1 flex-col [view-transition-name:estudar-questao-root]',
              isPayloadStale && 'pointer-events-none opacity-90',
            )}
            aria-busy={isPayloadStale || undefined}
          >
            <AvantLessonPlayer
              key="estudar-lesson-player"
              {...displayPayload}
              payloadStale={isPayloadStale}
            />
          </div>
        ) : showSkeleton ? (
          <EstudarQuestaoSkeleton />
        ) : null}
        <div
          data-vitrine-slot-ready={vitrineSlotInteractive ? 'true' : 'false'}
          className={cn(
            'relative',
            hideVitrineChildren && 'hidden',
            showVitrineInterceptLoading && 'pointer-events-none select-none',
          )}
          aria-hidden={hideVitrineChildren || undefined}
          aria-busy={showVitrineInterceptLoading || undefined}
        >
          <div className={cn(showVitrineInterceptLoading && 'opacity-60')}>{children}</div>
          {showVitrineInterceptLoading ? (
            <div
              role="status"
              aria-label="Carregando questão"
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#010409]/30 backdrop-blur-[1px]"
            >
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" aria-hidden />
            </div>
          ) : null}
        </div>
        {modal}
      </div>
    </DashboardMobilePage>
  );
}
