'use client';

import { useRouter } from 'next/navigation';
import { Library } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

export function CadernosEmptyState({ className }: Props) {
  const router = useRouter();
  return (
    <div className={cn('w-full', className)}>
      <EmptyState
        icon={Library}
        title="Nenhum caderno ainda"
        description="Crie seu primeiro caderno e reúna as questões que quiser revisar com foco e em sequência, no seu ritmo."
        action={{
          label: 'Criar primeiro caderno',
          onClick: () => router.push('/cadernos/novo'),
        }}
      />
    </div>
  );
}
