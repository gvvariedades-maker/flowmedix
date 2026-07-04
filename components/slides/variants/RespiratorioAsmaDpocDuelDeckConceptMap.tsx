'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  inferRespiratorioLane,
  respiratorioLaneLabel,
  RESPIRATORIO_DUEL_LANES,
  type RespiratorioLane,
} from '@/lib/slides/respiratorioCronicoSlideUtils';

export interface RespiratorioDuelConcept {
  icon: string;
  title: string;
  description: string;
}

const LANE_META: Record<
  RespiratorioLane,
  { label: string; border: string; badge: string; badgeText: string; ring: string; bar: string }
> = {
  asma: {
    label: 'Asma',
    border: 'border-l-cyan-500/90',
    badge: 'bg-cyan-100/90',
    badgeText: 'text-cyan-900',
    ring: 'ring-cyan-400/35',
    bar: 'bg-cyan-500',
  },
  dpoc: {
    label: 'DPOC',
    border: 'border-l-amber-500/90',
    badge: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
    ring: 'ring-amber-400/35',
    bar: 'bg-amber-500',
  },
  monitor: {
    label: 'Monitor',
    border: 'border-l-sky-500/90',
    badge: 'bg-sky-100/90',
    badgeText: 'text-sky-900',
    ring: 'ring-sky-400/35',
    bar: 'bg-sky-500',
  },
  crise: {
    label: 'Crise',
    border: 'border-l-rose-500/90',
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-900',
    ring: 'ring-rose-400/35',
    bar: 'bg-rose-500',
  },
  educacao: {
    label: 'Educação',
    border: 'border-l-teal-500/90',
    badge: 'bg-teal-100/90',
    badgeText: 'text-teal-900',
    ring: 'ring-teal-400/35',
    bar: 'bg-teal-500',
  },
  gabarito: {
    label: 'Gabarito',
    border: 'border-l-emerald-500/90',
    badge: 'bg-emerald-100/90',
    badgeText: 'text-emerald-900',
    ring: 'ring-emerald-400/40',
    bar: 'bg-emerald-500',
  },
  geral: {
    label: 'Respiratório',
    border: 'border-l-slate-400/80',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-800',
    ring: 'ring-slate-300/30',
    bar: 'bg-slate-400',
  },
};

interface RespiratorioAsmaDpocDuelDeckConceptMapProps {
  concepts: RespiratorioDuelConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function RespiratorioAsmaDpocDuelDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: RespiratorioAsmaDpocDuelDeckConceptMapProps) {
  const [activeLane, setActiveLane] = useState<RespiratorioLane | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const grouped = useMemo(() => {
    const byLane = new Map<RespiratorioLane, RespiratorioDuelConcept[]>();
    for (const concept of concepts) {
      const lane = inferRespiratorioLane(concept.title, concept.description);
      const list = byLane.get(lane) ?? [];
      list.push(concept);
      byLane.set(lane, list);
    }
    return byLane;
  }, [concepts]);

  const lanesOnRail = RESPIRATORIO_DUEL_LANES.filter((lane) => grouped.has(lane));
  const gabaritoItems = grouped.get('gabarito') ?? [];
  const defaultLane =
    activeLane ??
    lanesOnRail.find((l) => l === 'asma') ??
    lanesOnRail.find((l) => l === 'dpoc') ??
    lanesOnRail[0] ??
    'geral';

  const laneItems = grouped.get(defaultLane) ?? concepts;
  const laneMeta = LANE_META[defaultLane];

  const toggleLane = useCallback((lane: RespiratorioLane) => {
    setActiveLane((current) => (current === lane ? null : lane));
    setExpandedIndex(null);
  }, []);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/70 bg-cyan-50/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-cyan-900 shadow-sm">
            <Wind className="h-3 w-3" aria-hidden />
            Duel Deck · Asma × DPOC
          </span>
          <div className="flex flex-wrap justify-end gap-1.5">
            {(['asma', 'dpoc', 'monitor'] as const).map((lane) => {
              const hasItems = grouped.has(lane);
              const isActive = defaultLane === lane;
              const meta = LANE_META[lane];
              return (
                <button
                  key={lane}
                  type="button"
                  disabled={!hasItems}
                  onClick={() => hasItems && toggleLane(lane)}
                  className={`min-h-11 rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wide transition-all ${
                    isActive
                      ? `${meta.badge} ${meta.badgeText} ring-2 ${meta.ring}`
                      : hasItems
                        ? 'bg-white/80 text-slate-600 hover:bg-white'
                        : 'bg-white/40 text-slate-400 opacity-50'
                  }`}
                >
                  {respiratorioLaneLabel(lane)}
                </button>
              );
            })}
          </div>
        </div>

        {lanesOnRail.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {lanesOnRail.map((lane) => {
              const meta = LANE_META[lane];
              const isActive = defaultLane === lane;
              return (
                <button
                  key={lane}
                  type="button"
                  onClick={() => toggleLane(lane)}
                  className={`min-h-11 rounded-xl border px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-widest transition-all ${
                    isActive
                      ? `${meta.badge} ${meta.badgeText} ring-2 ${meta.ring} shadow-md`
                      : 'border-slate-200/80 bg-white/70 text-slate-600 hover:shadow-sm'
                  }`}
                >
                  {meta.label}
                  <span className="ml-1 opacity-70">({grouped.get(lane)?.length ?? 0})</span>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className={`overflow-hidden rounded-2xl border bg-white/90 shadow-xl ${laneMeta.ring} ring-1`}>
          <div className={`border-l-[5px] ${laneMeta.border} p-4 md:p-5`}>
            <p className={`mb-3 font-mono text-[10px] font-bold uppercase tracking-widest ${laneMeta.badgeText}`}>
              Trilho · {laneMeta.label}
            </p>
            <div className="flex flex-col gap-2.5">
              {laneItems.map((concept, index) => {
                const Icon = resolveLucideIcon(concept.icon || 'Wind');
                const isExpanded = expandedIndex === index;
                return (
                  <div
                    key={`${concept.title}-${index}`}
                    className="overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80"
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpanded(index)}
                      className="flex w-full items-start gap-3 p-3 text-left"
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${laneMeta.bar} text-white shadow-inner`}>
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-sm font-bold text-slate-900">{concept.title}</p>
                        <p className={`mt-0.5 font-body text-sm text-slate-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {concept.description}
                        </p>
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-slate-100 px-3 pb-3"
                        >
                          <p className="pt-2 font-body text-sm leading-relaxed text-slate-700">
                            {concept.description}
                          </p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {gabaritoItems.length > 0 ? (
          <div className="rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50/80 p-4 shadow-lg ring-1 ring-emerald-200/50">
            {gabaritoItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 rounded-lg bg-emerald-500 px-2 py-0.5 font-mono text-[10px] font-black text-white">
                  ✓
                </span>
                <div>
                  <p className="font-body text-sm font-bold text-emerald-950">{item.title}</p>
                  <p className="font-body text-sm text-emerald-900/90">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm font-medium italic leading-relaxed ${theme.borderColor} bg-white/80 ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
