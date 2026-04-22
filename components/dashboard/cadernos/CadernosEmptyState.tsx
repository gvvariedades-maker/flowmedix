'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Library, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

/**
 * Estado vazio — convite à criação do primeiro caderno. A área da lista futura
 * pode ser trocada por um grid sem alterar o header.
 */
export function CadernosEmptyState({ className }: Props) {
  return (
    <div className={cn('w-full', className)}>
      <div
        className="relative overflow-hidden rounded-3xl border-2 border-dashed border-slate-200/90 bg-slate-100/40 p-6 sm:p-10 md:p-12"
        aria-hidden
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(148_163_184/0.22)_1px,transparent_0)] [background-size:20px_20px] opacity-90"
        />
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-indigo-100/30 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative mx-auto max-w-md"
        >
          <Card className="border-slate-200/90 bg-white shadow-sm shadow-slate-200/50">
            <CardContent className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:px-10 sm:py-12">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100/80 shadow-inner"
                aria-hidden
              >
                <Library className="h-12 w-12 text-blue-600" strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-slate-700">Nenhum caderno ainda</h2>
                <p className="mx-auto max-w-md text-balance text-slate-500">
                  Crie seu primeiro caderno e reúna as questões que quiser revisar com foco e em sequência, no
                  seu ritmo.
                </p>
              </div>
              <Button
                asChild
                className="h-12 rounded-lg bg-blue-700 px-8 text-sm font-semibold uppercase tracking-wide text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-lg"
              >
                <Link
                  href="/cadernos/novo"
                  className="inline-flex items-center justify-center"
                >
                  <Plus className="mr-2 h-4 w-4" strokeWidth={2} aria-hidden />
                  Criar primeiro caderno
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
