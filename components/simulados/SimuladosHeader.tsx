'use client';

import Link from 'next/link';
import { BarChart3, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';

type SimuladosHeaderProps = {
  className?: string;
};

export function SimuladosHeader({ className }: SimuladosHeaderProps) {
  return (
    <div className={cn('mx-auto max-w-4xl px-4 py-5 sm:px-6 md:px-10', className)}>
      <PageHeader
        title="Simulados"
        titleClassName="truncate text-3xl font-bold text-slate-900"
        description="Monte simulados, retome tentativas e acompanhe seu histórico"
        descriptionClassName="mt-1 text-sm text-slate-500"
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              href="/desempenho/simulados"
              className="btn-editorial-outline inline-flex h-11 w-full items-center justify-center sm:w-auto"
            >
              <BarChart3 className="mr-2 h-4 w-4" aria-hidden />
              Meu desempenho
            </Link>
            <Link href="/simulados/novo" className="btn-editorial-primary inline-flex h-11 w-full items-center justify-center sm:w-auto">
              <Plus className="mr-2 h-4 w-4" strokeWidth={2} aria-hidden />
              Novo simulado
            </Link>
          </div>
        }
      />
    </div>
  );
}
