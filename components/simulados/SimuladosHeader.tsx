'use client';

import Link from 'next/link';
import { BarChart3, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        titleClassName="truncate text-3xl font-black text-white"
        description="Monte simulados, retome tentativas e acompanhe seu histórico"
        descriptionClassName="mt-1 text-sm text-slate-400"
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              asChild
              variant="outline"
              className="h-11 w-full rounded-xl border-white/15 bg-white/[0.03] text-sm font-semibold text-slate-200 hover:bg-white/[0.06] sm:w-auto"
            >
              <Link href="/desempenho/simulados" className="inline-flex items-center justify-center">
                <BarChart3 className="mr-2 h-4 w-4" aria-hidden />
                Meu desempenho
              </Link>
            </Button>
            <Button
              asChild
              className="h-11 w-full rounded-xl border border-cyan-400/35 bg-[rgba(0,242,255,0.12)] px-5 text-sm font-semibold text-cyan-300 shadow-none transition-colors hover:bg-[rgba(0,242,255,0.18)] hover:text-cyan-200 sm:w-auto"
            >
              <Link href="/simulados/novo" className="inline-flex items-center justify-center">
                <Plus className="mr-2 h-4 w-4" strokeWidth={2} aria-hidden />
                Novo simulado
              </Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
