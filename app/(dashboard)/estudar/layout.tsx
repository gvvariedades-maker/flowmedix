'use client';

import type { ReactNode } from 'react';
import { QuestaoNavigationProvider } from '@/components/lesson/QuestaoNavigationProvider';
import EstudarQuestaoShell from '@/components/lesson/EstudarQuestaoShell';

export default function EstudarLayout({ children }: { children: ReactNode }) {
  return (
    <QuestaoNavigationProvider>
      <EstudarQuestaoShell>{children}</EstudarQuestaoShell>
    </QuestaoNavigationProvider>
  );
}
