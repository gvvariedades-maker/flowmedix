'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookMarked, BrainCircuit, Clock, Filter, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
  editalBanca?: string | null;
};

const bullets = [
  { icon: Clock, text: '2 minutos para começar' },
  { icon: Filter, text: 'Filtro por banca do edital' },
  { icon: BrainCircuit, text: '100% NeuroSlide' },
] as const;

export function CadernosEmptyState({ className, editalBanca }: Props) {
  const bancaLabel = editalBanca?.trim();
  const description = bancaLabel
    ? `Monte um caderno com questões da banca ${bancaLabel} e revise com estudo reverso no seu ritmo.`
    : 'Reúna as questões que quiser revisar com foco, filtro por banca e estudo reverso no seu ritmo.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn('w-full', className)}
    >
      <div className="card-elevated-lg p-8 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-[rgba(34, 197, 94,0.25)] bg-[rgba(34, 197, 94,0.10)]">
            <BookMarked className="h-10 w-10 text-[#166534]" strokeWidth={1.5} aria-hidden />
          </div>

          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[rgba(34, 197, 94,0.35)] bg-[rgba(34, 197, 94,0.12)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#166534]">
            <Sparkles className="h-3 w-3" aria-hidden />
            Primeiro caderno
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Nenhum caderno ainda</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">{description}</p>

          <ul className="mt-6 flex w-full max-w-lg flex-col gap-2.5 text-left sm:gap-3">
            {bullets.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(34, 197, 94,0.10)] text-[#166534]">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <span className="text-sm font-semibold text-slate-700">{text}</span>
              </li>
            ))}
          </ul>

          <Link href="/cadernos/novo?wizard=1" className="btn-editorial-primary mt-8 min-h-[48px] px-8">
            Criar caderno guiado
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
