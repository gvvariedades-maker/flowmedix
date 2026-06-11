'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

export function CadernosHeader({ className }: Props) {
  return (
    <div className={cn('mx-auto max-w-4xl px-4 py-5 sm:px-6 md:px-10', className)}>
      <PageHeader
        title="Cadernos de Estudo"
        titleClassName="truncate text-3xl font-bold text-slate-900"
        description="Organize questões em cadernos e estude com foco"
        descriptionClassName="mt-1 text-sm text-slate-500"
        action={
          <Link href="/cadernos/novo" className="btn-editorial-primary h-11 shrink-0 px-5">
            <Plus className="mr-2 h-4 w-4" strokeWidth={2} aria-hidden />
            Novo caderno
          </Link>
        }
      />
    </div>
  );
}
