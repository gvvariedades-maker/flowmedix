'use client';

import type { ReactNode } from 'react';
import { EstudarSpeculationRules } from '@/components/estudar/EstudarSpeculationRules';
import { QuestaoNavigationProvider } from '@/components/lesson/QuestaoNavigationProvider';
import EstudarQuestaoShell from '@/components/lesson/EstudarQuestaoShell';

export default function EstudarLayout({ children }: { children: ReactNode }) {
  return (
    <QuestaoNavigationProvider>
      <EstudarSpeculationRules />
      <EstudarQuestaoShell>{children}</EstudarQuestaoShell>
    </QuestaoNavigationProvider>
  );
}
