'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, Flame, MoreVertical, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatAvantCodigo } from '@/lib/avantCodigo';
import type { ReviewItem } from './types';
import { getPlanoItemId } from './plano-marcados-storage';
import { usePlanoDiarioMarcadosContext } from './PlanoDiarioMarcadosContext';
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
  const { isMarcado, toggle, hydrated } = usePlanoDiarioMarcadosContext();
  const itemId = getPlanoItemId(item);
  const marcado = hydrated && isMarcado(itemId);
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
          'group relative flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm',
          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.75)]',
          'transition-all duration-300 ease-out',
          'hover:scale-[1.01] hover:shadow-md hover:shadow-slate-300/30',
          marcado && 'border-emerald-200/90 bg-emerald-50/40 ring-1 ring-emerald-200/60',
        )}
      >
        <div className="flex flex-1 items-start gap-4">
          <div className="pt-0.5">
            <Checkbox
              className="mt-0.5"
              checked={marcado}
              onCheckedChange={() => toggle(itemId)}
              aria-label={`Marcar lembrete local — questão ${index + 1} (não substitui o estudo reverso)`}
            />
          </div>

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
                className="text-lg font-semibold text-slate-900 underline-offset-2 transition-colors hover:text-sky-800 hover:underline"
              >
                {assunto}
              </Link>
              <Badge variant="secondary" className="text-[10px] font-medium">
                1 questão
              </Badge>
              {codeLabel != null && (
                <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-800">
                  {codeLabel}
                </span>
              )}
            </div>

            <p className="mt-0.5 text-sm font-medium text-slate-500">
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
                <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-800">
                  <RefreshCcw className="h-2.5 w-2.5" aria-hidden />
                  {item.repetitions}× revisada
                </span>
              )}
              {item.priority >= 50 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
                  <Flame className="h-2.5 w-2.5" aria-hidden />
                  Precisa atenção
                </span>
              )}
            </div>

            <div
              className="mt-4 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-slate-100"
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
                  className="h-9 w-9 text-slate-400 transition-colors duration-200 hover:text-slate-800"
                  aria-label="Mais opções do tópico"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={href} className="cursor-pointer">
                    Abrir questão
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/estudar" className="cursor-pointer">
                    Ir à vitrine
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              href={href}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors duration-200 hover:bg-slate-100 hover:text-sky-600"
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
