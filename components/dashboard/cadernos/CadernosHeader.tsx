'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        titleClassName="truncate text-3xl font-black text-white"
        description="Organize questões em cadernos e estude com foco"
        descriptionClassName="mt-1 text-sm text-slate-400"
        action={
          <Button
            asChild
            className="h-11 shrink-0 rounded-xl border border-cyan-400/35 bg-[rgba(0,242,255,0.12)] px-5 text-sm font-semibold text-cyan-300 shadow-none transition-colors hover:bg-[rgba(0,242,255,0.18)] hover:text-cyan-200"
          >
            <Link href="/cadernos/novo" className="inline-flex items-center">
              <Plus className="mr-2 h-4 w-4" strokeWidth={2} aria-hidden />
              Novo caderno
            </Link>
          </Button>
        }
      />
    </div>
  );
}
