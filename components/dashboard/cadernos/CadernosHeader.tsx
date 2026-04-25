'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

/**
 * Cabeçalho da lista de cadernos — título + CTA. Reutilizável quando houver grid de cadernos.
 */
export function CadernosHeader({ className }: Props) {
  return (
    <header className={cn('bg-transparent', className)}>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-10">
        <div className="flex flex-col items-center text-center sm:block sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Meus cadernos</p>
          <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Cadernos de Estudo
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Organize questões em cadernos e estude com foco
          </p>
        </div>
        <Button
          asChild
          className="h-11 shrink-0 rounded-2xl bg-blue-700 px-5 text-sm font-semibold uppercase tracking-wide text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-blue-800 hover:shadow-lg"
        >
          <Link href="/cadernos/novo" className="inline-flex items-center">
            <Plus className="mr-2 h-4 w-4" strokeWidth={2} aria-hidden />
            Novo caderno
          </Link>
        </Button>
      </div>
    </header>
  );
}
