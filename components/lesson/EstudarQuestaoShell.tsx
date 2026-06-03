'use client';

import type { ReactNode } from 'react';
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
  const { showPlayer, showSkeleton, displayPayload, isPayloadStale } =
    useEstudarQuestaoShellState({ modalActive });

  return (
    <DashboardMobilePage
      variant="default"
      className="flex min-h-0 w-full flex-1 flex-col bg-[#010409] px-3 py-3 font-sans sm:px-4 md:px-6 md:py-6 md:pb-6"
    >
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
        {showPlayer && displayPayload ? (
          <div
            className={cn(
              'flex min-h-0 flex-1 flex-col [view-transition-name:estudar-questao-root]',
              isPayloadStale && 'pointer-events-none opacity-90',
            )}
            aria-busy={isPayloadStale || undefined}
          >
            <AvantLessonPlayer key="estudar-lesson-player" {...displayPayload} />
          </div>
        ) : showSkeleton ? (
          <EstudarQuestaoSkeleton />
        ) : null}
        <div
          className={cn(interceptActive && 'pointer-events-none select-none')}
          aria-hidden={interceptActive || undefined}
        >
          {children}
        </div>
        {modal}
      </div>
    </DashboardMobilePage>
  );
}
