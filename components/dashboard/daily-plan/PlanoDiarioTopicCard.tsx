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
          'card-elevated group relative flex flex-col gap-4 p-6',
          'transition-all duration-300 ease-out hover:border-slate-300 hover:shadow-md',
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
                className="text-lg font-black text-slate-900 underline-offset-2 transition-colors hover:text-[#3d6b0f] hover:underline"
              >
                {assunto}
              </Link>
              <Badge variant="secondary" className="border border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-600">
                1 questão
              </Badge>
              {codeLabel != null && (
                <span className="rounded-md border border-[rgba(143,224,32,0.35)] bg-[rgba(143,224,32,0.08)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#3d6b0f]">
                  {codeLabel}
                </span>
              )}
            </div>

            <p className="mt-0.5 text-sm font-medium text-slate-600">
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
                <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                  <RefreshCcw className="h-2.5 w-2.5" aria-hidden />
                  {item.repetitions}× revisada
                </span>
              )}
              {item.priority >= 50 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                  <Flame className="h-2.5 w-2.5" aria-hidden />
                  Precisa atenção
                </span>
              )}
            </div>

            <div
              className="mt-4 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-slate-200"
              title="Prioridade de revisão (algoritmo)"
            >
              <div
                className="h-full origin-left rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 transition-[width] duration-500"
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
                  className="h-11 w-11 text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-800"
                  aria-label="Mais opções do tópico"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 border-slate-200 bg-white">
                <DropdownMenuItem asChild className="cursor-pointer text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                  <Link href={href}>Abrir questão</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              href={href}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-[#3d6b0f]"
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
