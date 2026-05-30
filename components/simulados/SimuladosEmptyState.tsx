'use client';

import { useRouter } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

type SimuladosEmptyStateProps = {
  className?: string;
};

export function SimuladosEmptyState({ className }: SimuladosEmptyStateProps) {
  const router = useRouter();
  return (
    <div className={cn('w-full', className)}>
      <EmptyState
        icon={ClipboardList}
        title="Nenhum simulado ainda"
        description="Monte seu primeiro simulado com questões do catálogo, corrija questão a questão e veja o resultado ao final."
        action={{
          label: 'Criar primeiro simulado',
          onClick: () => router.push('/simulados/novo'),
        }}
      />
    </div>
  );
}
