'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivitySparkline } from './activity-sparkline';
import type { DiaEstudo, Periodo } from './types';

/** Escala de intensidade via tokens --color-success* (funciona em Editorial e Cyber). */
const INTENSITY_COLORS = [
  'var(--color-border-subtle)',
  'color-mix(in srgb, var(--color-success) 28%, transparent)',
  'color-mix(in srgb, var(--color-success) 48%, transparent)',
  'color-mix(in srgb, var(--color-success) 68%, transparent)',
  'var(--color-success)',
] as const;

const WEEKDAY_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'] as const;

const INTENSITY_LEGEND = [
  { level: 0, label: 'Sem atividade' },
  { level: 1, label: '1–3' },
  { level: 2, label: '4–7' },
  { level: 3, label: '8–12' },
  { level: 4, label: '13+' },
] as const;

function intensityLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 7) return 2;
  if (count <= 12) return 3;
  return 4;
}

function weekdayIndex(isoDate: string): number {
  return new Date(isoDate + 'T12:00:00').getDay();
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
  const hojeStr = new Date().toISOString().slice(0, 10);

  /** Colunas 0–6 mantêm o mesmo dia da semana porque a série é consecutiva. */
  const columnWeekdays = useMemo(() => {
    if (dados.length === 0) return [...WEEKDAY_SHORT];
    const start = weekdayIndex(dados[0].data);
    return Array.from({ length: 7 }, (_, i) => WEEKDAY_SHORT[(start + i) % 7]);
  }, [dados]);

  return (
    <div className="w-full overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch]">
      <div
        className="grid w-full min-w-[280px] grid-cols-7 gap-x-1.5 gap-y-2 sm:min-w-0 sm:gap-x-2 sm:gap-y-4"
        role="grid"
        aria-label={`Atividade dos últimos ${periodo} dias`}
      >
        {columnWeekdays.map((label, i) => (
          <div
            key={`wd-${i}-${label}`}
            role="columnheader"
            className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-[11px]"
          >
            {label}
          </div>
        ))}

        {dados.map((dia, i) => {
          const isToday = dia.data === hojeStr;
          const level = intensityLevel(dia.count);
          const bgColor = INTENSITY_COLORS[level];
          const { dia: diaStr, mes: mesStr } = formatDiaMes(dia.data);
          const weekday = WEEKDAY_SHORT[weekdayIndex(dia.data)];
          const questaoLabel =
            dia.count === 1 ? '1 questão estudada' : `${dia.count} questões estudadas`;
          const ariaLabel = `${weekday}, ${diaStr} de ${mesStr}: ${questaoLabel}${
            isToday ? ' (hoje)' : ''
          }`;

          return (
            <motion.div
              key={dia.data}
              role="gridcell"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15, delay: Math.min(i * 0.012, 0.35) }}
              className="flex min-w-0 flex-col items-center gap-0.5 sm:gap-1"
            >
              <div
                title={ariaLabel}
                aria-label={ariaLabel}
                style={{ backgroundColor: bgColor }}
                className={cn(
                  'aspect-square w-full min-h-[1.25rem] max-h-10 cursor-default rounded-[2px] transition-opacity duration-150 sm:min-h-[1.5rem] sm:max-h-14',
                  'hover:opacity-75',
                  isToday &&
                    'ring-2 ring-[var(--color-success)] ring-offset-1 ring-offset-background',
                )}
              />
              <div className="w-full text-center">
                <p className="text-[9px] font-semibold leading-tight text-slate-600 sm:text-[11px]">
                  <span className="tabular-nums">{diaStr}</span>{' '}
                  <span className="text-slate-400">{mesStr}</span>
                </p>
                <p className="mt-0.5 text-[9px] font-bold tabular-nums text-slate-600 sm:text-[11px]">
                  <span className="sm:hidden">{dia.count} q.</span>
                  <span className="hidden sm:inline">
                    {dia.count}{' '}
                    <span className="font-medium text-slate-400">
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

export function ContributionHeatmap({
  serie,
  periodo,
  onPeriodoChange,
  totalPeriodo,
  semDados,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <BarChart3
            className="h-4 w-4 shrink-0 text-[var(--color-success-text)]"
            aria-hidden
          />
          <span className="text-sm font-semibold text-slate-900">Atividade</span>
          <span className="text-xs text-slate-500">
            {totalPeriodo} questões nos últimos {periodo} dias
          </span>
        </div>
        {!semDados ? (
          <ActivitySparkline serie={serie} periodo={periodo} className="ml-auto" />
        ) : null}
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
            <p className="py-8 text-center text-sm text-slate-500">
              Nenhuma questão estudada ainda.
            </p>
          ) : (
            <HeatmapGrid serie={serie} periodo={7} />
          )}
        </TabsContent>
        <TabsContent value="15" className="mt-4">
          {semDados ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Nenhuma questão estudada ainda.
            </p>
          ) : (
            <HeatmapGrid serie={serie} periodo={15} />
          )}
        </TabsContent>
        <TabsContent value="30" className="mt-4">
          {semDados ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Nenhuma questão estudada ainda.
            </p>
          ) : (
            <HeatmapGrid serie={serie} periodo={30} />
          )}
        </TabsContent>
      </Tabs>

      {!semDados && (
        <div className="space-y-2 border-t border-slate-200 pt-4">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Legenda de intensidade
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-medium text-slate-600">
            {INTENSITY_LEGEND.map(({ level, label }) => (
              <span key={label} className="flex items-center gap-2">
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: INTENSITY_COLORS[level] }}
                  aria-hidden
                />
                <span>{label}</span>
              </span>
            ))}
            <span className="flex items-center gap-2">
              <span
                className="inline-flex h-3.5 w-3.5 shrink-0 rounded-[2px] ring-2 ring-[var(--color-success)] ring-offset-1"
                style={{ backgroundColor: INTENSITY_COLORS[0] }}
                aria-hidden
              />
              <span>Hoje</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
