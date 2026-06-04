'use client';

import { Suspense, type ReactNode } from 'react';
import { EstudarSpeculationRules } from '@/components/estudar/EstudarSpeculationRules';
import { QuestaoNavigationProvider } from '@/components/lesson/QuestaoNavigationProvider';
import EstudarQuestaoShell from '@/components/lesson/EstudarQuestaoShell';
import EstudarQuestaoSkeleton from '@/components/lesson/EstudarQuestaoSkeleton';

export default function EstudarLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <QuestaoNavigationProvider>
      <EstudarSpeculationRules />
      <Suspense fallback={<EstudarQuestaoSkeleton />}>
        <EstudarQuestaoShell modal={modal}>{children}</EstudarQuestaoShell>
      </Suspense>
    </QuestaoNavigationProvider>
  );
}
