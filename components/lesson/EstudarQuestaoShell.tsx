'use client';

import type { ReactNode } from 'react';
import AvantLessonPlayer from '@/components/lesson/AvantLessonPlayer';
import { useQuestaoNavigation } from '@/components/lesson/questao-navigation-context';
import { DashboardMobilePage } from '@/components/layout/DashboardMobilePage';

export default function EstudarQuestaoShell({ children }: { children: ReactNode }) {
  const { displayPayload } = useQuestaoNavigation();

  return (
    <DashboardMobilePage
      variant="default"
      className="flex min-h-0 w-full flex-1 flex-col bg-[#010409] px-3 py-3 font-sans sm:px-4 md:px-6 md:py-6 md:pb-6"
    >
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
        {displayPayload ? <AvantLessonPlayer {...displayPayload} /> : null}
        {children}
      </div>
    </DashboardMobilePage>
  );
}
