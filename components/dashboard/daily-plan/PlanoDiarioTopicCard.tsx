'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, Flame, MoreVertical, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatAvantCodigo } from '@/lib/avantCodigo';
import type { ReviewItem } from './types';
import { categoriaTópico, prioridadeBarPct, urgenciaInfo } from './topic-helpers';
import { cn } from '@/lib/utils';

type Props = {
  item: ReviewItem;
  index: number;
};

function assuntoDisplay(item: ReviewItem): string {
  return item.subtopico || item.topico || item.modulo_slug;
}

export function PlanoDiarioTopicCard({ item, index }: Props) {
  const href = `/estudar/${item.modulo_slug}?from=plano`;
  const cat = categoriaTópico(item);
  const urg = urgenciaInfo(item);
  const barW = prioridadeBarPct(item);
  const assunto = assuntoDisplay(item);
  const codeLabel = formatAvantCodigo(item.avant_codigo);
  const repetiu = item.repetitions > 0;
  const Icon = cat.Icon;

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 360, damping: 28 }}
      className="list-none"
    >
      <div
        className={cn(
          'group relative flex flex-col gap-4 rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#0d1117] p-6 shadow-sm',
          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
          'transition-all duration-300 ease-out',
          'hover:scale-[1.01] hover:shadow-md hover:shadow-black/40',
        )}
      >
        <div className="flex flex-1 items-start gap-4">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform duration-200',
              'group-hover:scale-105',
              cat.circleClass,
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={href}
                className="text-lg font-black text-white underline-offset-2 transition-colors hover:text-[#00f2ff] hover:underline"
              >
                {assunto}
              </Link>
              <Badge
                variant="secondary"
                className="border border-[rgba(255,255,255,0.10)] bg-white/5 text-[10px] font-medium text-slate-300"
              >
                1 questão
              </Badge>
              {codeLabel != null && (
                <span className="rounded-md border border-[rgba(0,242,255,0.35)] bg-[rgba(0,242,255,0.08)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#67e8f9]">
                  {codeLabel}
                </span>
              )}
            </div>

            <p className="mt-0.5 text-sm font-medium text-slate-400">
              {item.topico || 'Questão do plano diário'}
              {item.subtopico && item.subtopico !== assunto && item.subtopico !== item.topico
                ? ` · ${item.subtopico}`
                : ''}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                  urg.chipClass,
                )}
              >
                <Clock className="h-2.5 w-2.5" aria-hidden />
                {urg.label}
              </span>
              {repetiu && (
                <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-200">
                  <RefreshCcw className="h-2.5 w-2.5" aria-hidden />
                  {item.repetitions}× revisada
                </span>
              )}
              {item.priority >= 50 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-200">
                  <Flame className="h-2.5 w-2.5" aria-hidden />
                  Precisa atenção
                </span>
              )}
            </div>

            <div
              className="mt-4 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/10"
              title="Prioridade de revisão (algoritmo)"
            >
              <div
                className="h-full origin-left rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 transition-[width] duration-500"
                style={{ width: `${barW}%` }}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 text-slate-500 transition-colors duration-200 hover:bg-white/5 hover:text-slate-200"
                  aria-label="Mais opções do tópico"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 border-[rgba(255,255,255,0.10)] bg-[#0d1117] text-white"
              >
                <DropdownMenuItem asChild className="text-slate-200 focus:bg-white/10 focus:text-white">
                  <Link href={href} className="cursor-pointer">
                    Abrir questão
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              href={href}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-white/5 hover:text-[#00f2ff]"
              aria-label="Ir para a questão"
            >
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.li>
  );
}
