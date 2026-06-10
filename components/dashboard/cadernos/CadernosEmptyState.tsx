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
      <div className="relative overflow-hidden rounded-[2rem] border border-cyan-500/15 bg-gradient-to-br from-cyan-500/[0.08] via-[#0d1117] to-[#010409] p-8 shadow-xl shadow-black/30 sm:p-10">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-cyan-400/5 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col items-center text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-cyan-500/25 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 shadow-lg shadow-cyan-950/30">
            <BookMarked className="h-10 w-10 text-cyan-300" strokeWidth={1.5} aria-hidden />
          </div>

          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-200">
            <Sparkles className="h-3 w-3" aria-hidden />
            Primeiro caderno
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Nenhum caderno ainda</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">{description}</p>

          <ul className="mt-6 flex w-full max-w-lg flex-col gap-2.5 text-left sm:gap-3">
            {bullets.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <span className="text-sm font-semibold text-slate-200">{text}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/cadernos/novo?wizard=1"
            className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-cyan-500 px-8 text-sm font-black uppercase tracking-widest text-slate-950 shadow-lg shadow-cyan-950/40 transition-colors hover:bg-cyan-400"
          >
            Criar caderno guiado
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
