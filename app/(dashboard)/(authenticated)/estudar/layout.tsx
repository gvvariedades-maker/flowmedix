'use client';

import type { ReactNode } from 'react';
import { EstudarSpeculationRules } from '@/components/estudar/EstudarSpeculationRules';
import { QuestaoNavigationProvider } from '@/components/lesson/QuestaoNavigationProvider';
import EstudarQuestaoShell from '@/components/lesson/EstudarQuestaoShell';

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
      <EstudarQuestaoShell modal={modal}>{children}</EstudarQuestaoShell>
    </QuestaoNavigationProvider>
  );
}
