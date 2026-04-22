'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DiaEstudo, Periodo } from './types';

/** Intensidade com cores distintas na legenda (cinza → azul → âmbar → violeta). */
function nivelCor(count: number, max: number): string {
  if (count === 0) return 'bg-neutral-200 dark:bg-neutral-700';
  const t = count / max;
  if (t < 0.34) return 'bg-sky-400 dark:bg-sky-600';
  if (t < 0.67) return 'bg-amber-400 dark:bg-amber-600';
  return 'bg-violet-600 dark:bg-violet-500';
}

function formatDiaMes(isoDate: string): { dia: string; mes: string } {
  const d = new Date(isoDate + 'T12:00:00');
  const dia = d.toLocaleDateString('pt-BR', { day: '2-digit' });
  const mes = d
    .toLocaleDateString('pt-BR', { month: 'short' })
    .replace('.', '')
    .slice(0, 3);
  return { dia, mes };
}

function HeatmapGrid({ serie, periodo }: { serie: DiaEstudo[]; periodo: Periodo }) {
  const dados = useMemo(() => serie.slice(-periodo), [serie, periodo]);
  const max = Math.max(...dados.map((d) => d.count), 1);
  const hojeStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="w-full overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch]">
      <div className="grid w-full min-w-[280px] grid-cols-7 gap-x-1.5 gap-y-2 sm:min-w-0 sm:gap-x-2 sm:gap-y-4">
        {dados.map((dia, i) => {
          const isToday = dia.data === hojeStr;
          const { dia: diaStr, mes: mesStr } = formatDiaMes(dia.data);
          const tooltip = `${diaStr} ${mesStr}: ${dia.count} ${dia.count === 1 ? 'questão estudada' : 'questões estudadas'}`;
          return (
            <motion.div
              key={dia.data}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15, delay: Math.min(i * 0.012, 0.35) }}
              className="flex min-w-0 flex-col items-center gap-0.5 sm:gap-1"
            >
              <div
                title={tooltip}
                className={cn(
                  'aspect-square w-full min-h-[1.25rem] max-h-10 rounded-md transition-colors duration-150 sm:min-h-[1.5rem] sm:max-h-14',
                  nivelCor(dia.count, max),
                  isToday && 'ring-2 ring-slate-900 ring-offset-2 ring-offset-background dark:ring-white',
                )}
              />
              <div className="w-full text-center">
                <p className="text-[9px] font-semibold leading-tight text-foreground sm:text-[11px]">
                  <span className="tabular-nums">{diaStr}</span>{' '}
                  <span className="text-muted-foreground">{mesStr}</span>
                </p>
                <p className="mt-0.5 text-[9px] font-bold tabular-nums text-foreground sm:text-[11px]">
                  <span className="sm:hidden">{dia.count} q.</span>
                  <span className="hidden sm:inline">
                    {dia.count}{' '}
                    <span className="font-medium text-muted-foreground">
                      {dia.count === 1 ? 'questão' : 'questões'}
                    </span>
                  </span>
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

type Props = {
  serie: DiaEstudo[];
  periodo: Periodo;
  onPeriodoChange: (p: Periodo) => void;
  totalPeriodo: number;
  semDados: boolean;
};

export function ContributionHeatmap({ serie, periodo, onPeriodoChange, totalPeriodo, semDados }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <BarChart3 className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden />
          <span className="text-sm font-semibold text-foreground">Atividade</span>
          <span className="text-xs text-muted-foreground">
            {totalPeriodo} questões nos últimos {periodo} dias
          </span>
        </div>
      </div>

      <Tabs
        value={String(periodo)}
        onValueChange={(v) => onPeriodoChange(Number(v) as Periodo)}
        className="w-full"
      >
        <TabsList className="w-full justify-start sm:w-auto">
          <TabsTrigger value="7">7 dias</TabsTrigger>
          <TabsTrigger value="15">15 dias</TabsTrigger>
          <TabsTrigger value="30">30 dias</TabsTrigger>
        </TabsList>
        <TabsContent value="7" className="mt-4">
          {semDados ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma questão estudada ainda.</p>
          ) : (
            <HeatmapGrid serie={serie} periodo={7} />
          )}
        </TabsContent>
        <TabsContent value="15" className="mt-4">
          {semDados ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma questão estudada ainda.</p>
          ) : (
            <HeatmapGrid serie={serie} periodo={15} />
          )}
        </TabsContent>
        <TabsContent value="30" className="mt-4">
          {semDados ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma questão estudada ainda.</p>
          ) : (
            <HeatmapGrid serie={serie} periodo={30} />
          )}
        </TabsContent>
      </Tabs>

      {!semDados && (
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Legenda</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-medium text-foreground">
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 shrink-0 rounded bg-neutral-200 dark:bg-neutral-700" />
              <span>Sem atividade</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 shrink-0 rounded bg-sky-400 dark:bg-sky-600" />
              <span>Baixa</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 shrink-0 rounded bg-amber-400 dark:bg-amber-600" />
              <span>Média</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 shrink-0 rounded bg-violet-600 dark:bg-violet-500" />
              <span>Alta</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-flex h-3.5 w-3.5 shrink-0 rounded border-2 border-slate-900 dark:border-white" />
              <span>Hoje</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
