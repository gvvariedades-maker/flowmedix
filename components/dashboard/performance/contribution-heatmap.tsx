'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DiaEstudo, Periodo } from './types';

/** Escala de intensidade brand green — tema editorial */
const INTENSITY_COLORS = [
  '#e2e8f0',
  'rgba(143, 224, 32, 0.28)',
  'rgba(143, 224, 32, 0.48)',
  'rgba(143, 224, 32, 0.68)',
  '#8fe020',
] as const;

function intensityLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 7) return 2;
  if (count <= 12) return 3;
  return 4;
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

  return (
    <div className="w-full overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch]">
      <div className="grid w-full min-w-[280px] grid-cols-7 gap-x-1.5 gap-y-2 sm:min-w-0 sm:gap-x-2 sm:gap-y-4">
        {dados.map((dia, i) => {
          const isToday = dia.data === hojeStr;
          const level = intensityLevel(dia.count);
          const bgColor = INTENSITY_COLORS[level];
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
                style={{ backgroundColor: bgColor }}
                className={cn(
                  'aspect-square w-full min-h-[1.25rem] max-h-10 cursor-default rounded-[2px] transition-opacity duration-150 sm:min-h-[1.5rem] sm:max-h-14',
                  'hover:opacity-75',
                  isToday && 'ring-2 ring-[#8fe020] ring-offset-1 ring-offset-background',
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

export function ContributionHeatmap({ serie, periodo, onPeriodoChange, totalPeriodo, semDados }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <BarChart3 className="h-4 w-4 shrink-0 text-[#3d6b0f]" aria-hidden />
          <span className="text-sm font-semibold text-slate-900">Atividade</span>
          <span className="text-xs text-slate-500">
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
            <p className="py-8 text-center text-sm text-slate-500">Nenhuma questão estudada ainda.</p>
          ) : (
            <HeatmapGrid serie={serie} periodo={7} />
          )}
        </TabsContent>
        <TabsContent value="15" className="mt-4">
          {semDados ? (
            <p className="py-8 text-center text-sm text-slate-500">Nenhuma questão estudada ainda.</p>
          ) : (
            <HeatmapGrid serie={serie} periodo={15} />
          )}
        </TabsContent>
        <TabsContent value="30" className="mt-4">
          {semDados ? (
            <p className="py-8 text-center text-sm text-slate-500">Nenhuma questão estudada ainda.</p>
          ) : (
            <HeatmapGrid serie={serie} periodo={30} />
          )}
        </TabsContent>
      </Tabs>

      {!semDados && (
        <div className="space-y-2 border-t border-slate-200 pt-4">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Legenda</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 shrink-0 rounded-[2px]" style={{ backgroundColor: INTENSITY_COLORS[0] }} />
              <span>Sem atividade</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 shrink-0 rounded-[2px]" style={{ backgroundColor: INTENSITY_COLORS[1] }} />
              <span>1–3</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 shrink-0 rounded-[2px]" style={{ backgroundColor: INTENSITY_COLORS[2] }} />
              <span>4–7</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 shrink-0 rounded-[2px]" style={{ backgroundColor: INTENSITY_COLORS[3] }} />
              <span>8–12</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 shrink-0 rounded-[2px]" style={{ backgroundColor: INTENSITY_COLORS[4] }} />
              <span>13+</span>
            </span>
            <span className="flex items-center gap-2">
              <span
                className="inline-flex h-3.5 w-3.5 shrink-0 rounded-[2px]"
                style={{ outline: '2px solid #8fe020', outlineOffset: '1px', backgroundColor: INTENSITY_COLORS[0] }}
              />
              <span>Hoje</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
