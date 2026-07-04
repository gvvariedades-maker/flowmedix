'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  inferAbsorptionRouteKind,
  type AbsorptionRouteKind,
} from '@/lib/slides/absorptionRouteKind';
import {
  buildAbsorptionExamTip,
  resolveScGabaritoBadge,
  type QuestionOptionLike,
} from '@/lib/slides/absorptionSpeedRailExamTips';

export interface RouteConcept {
  icon: string;
  title: string;
  description: string;
}

type RouteSlot = 'iv' | 'im' | 'sc' | 'vo';
type ConceptKind = AbsorptionRouteKind;

const ROUTES: {
  id: RouteSlot;
  label: string;
  full: string;
  speed: number;
  tag: string;
  bar: string;
  barSoft: string;
  panelGradient: string;
  active: string;
  text: string;
  accentBorder: string;
}[] = [
  {
    id: 'iv',
    label: 'IV',
    full: 'Intravenosa',
    speed: 100,
    tag: 'Imediata',
    bar: 'bg-rose-500',
    barSoft: 'bg-rose-100/70',
    panelGradient: 'from-rose-50/90 via-white to-white',
    active: 'border-rose-400 bg-rose-50 ring-2 ring-rose-300/40',
    text: 'text-rose-950',
    accentBorder: 'border-l-rose-500',
  },
  {
    id: 'im',
    label: 'IM',
    full: 'Intramuscular',
    speed: 72,
    tag: 'Rápida',
    bar: 'bg-amber-500',
    barSoft: 'bg-amber-100/70',
    panelGradient: 'from-amber-50/90 via-white to-white',
    active: 'border-amber-400 bg-amber-50 ring-2 ring-amber-300/40',
    text: 'text-amber-950',
    accentBorder: 'border-l-amber-500',
  },
  {
    id: 'sc',
    label: 'SC',
    full: 'Subcutânea',
    speed: 42,
    tag: 'Lenta e contínua',
    bar: 'bg-emerald-500',
    barSoft: 'bg-emerald-100/80',
    panelGradient: 'from-emerald-50/95 via-white to-white',
    active: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/50',
    text: 'text-emerald-950',
    accentBorder: 'border-l-emerald-500',
  },
  {
    id: 'vo',
    label: 'VO',
    full: 'Oral',
    speed: 28,
    tag: 'Variável',
    bar: 'bg-sky-500',
    barSoft: 'bg-sky-100/70',
    panelGradient: 'from-sky-50/90 via-white to-white',
    active: 'border-sky-400 bg-sky-50 ring-2 ring-sky-300/40',
    text: 'text-sky-950',
    accentBorder: 'border-l-sky-500',
  },
];

interface AbsorptionSpeedRailConceptMapProps {
  concepts: RouteConcept[];
  theme: ThemeColors;
  questionOptions?: QuestionOptionLike[];
}

export const AbsorptionSpeedRailConceptMap = ({
  concepts,
  theme,
  questionOptions,
}: AbsorptionSpeedRailConceptMapProps) => {
  const [selected, setSelected] = useState<RouteSlot>('sc');

  const { byRoute, shared, scExtras } = useMemo(() => {
    const routes: Record<RouteSlot, RouteConcept[]> = { iv: [], im: [], sc: [], vo: [] };
    const sharedItems: { kind: 'compare' | 'velocity'; concept: RouteConcept }[] = [];
    const extras: { kind: 'technique' | 'exam'; concept: RouteConcept }[] = [];

    for (const concept of concepts) {
      const kind = inferAbsorptionRouteKind(concept.title, concept.description);
      if (kind === 'compare' || kind === 'velocity') {
        sharedItems.push({ kind, concept });
      } else if (kind === 'technique' || kind === 'exam') {
        extras.push({ kind, concept });
      } else {
        routes[kind].push(concept);
      }
    }

    return { byRoute: routes, shared: sharedItems, scExtras: extras };
  }, [concepts]);

  const selectRoute = useCallback((route: RouteSlot) => {
    setSelected(route);
  }, []);

  const activeRoute = ROUTES.find((r) => r.id === selected)!;
  const scGabaritoBadge = useMemo(() => resolveScGabaritoBadge(questionOptions), [questionOptions]);
  const activeExamTip = useMemo(
    () => buildAbsorptionExamTip(selected, questionOptions),
    [selected, questionOptions],
  );
  const activeConcepts = byRoute[selected];
  const compareConcept = shared.find((s) => s.kind === 'compare')?.concept;
  const velocityConcept = shared.find((s) => s.kind === 'velocity')?.concept;
  const techniqueConcept = scExtras.find((s) => s.kind === 'technique')?.concept;
  const examConcept = scExtras.find((s) => s.kind === 'exam')?.concept;

  const detailSections = useMemo(() => {
    const sections: { title: string; body: string; icon: string; highlight?: boolean }[] = [];

    for (const concept of activeConcepts) {
      sections.push({
        title: concept.title,
        body: concept.description,
        icon: concept.icon,
      });
    }

    if (selected === 'sc') {
      if (velocityConcept) {
        sections.push({
          title: velocityConcept.title,
          body: velocityConcept.description,
          icon: velocityConcept.icon,
          highlight: true,
        });
      }

      if (compareConcept) {
        sections.push({
          title: compareConcept.title,
          body: compareConcept.description,
          icon: compareConcept.icon,
        });
      }

      if (techniqueConcept) {
        sections.push({
          title: techniqueConcept.title,
          body: techniqueConcept.description,
          icon: techniqueConcept.icon,
        });
      }
      if (examConcept) {
        sections.push({
          title: examConcept.title,
          body: examConcept.description,
          icon: examConcept.icon,
          highlight: true,
        });
      }
    }

    return sections;
  }, [
    activeConcepts,
    compareConcept,
    velocityConcept,
    techniqueConcept,
    examConcept,
    selected,
  ]);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col gap-3 md:gap-4">
        <div className="rounded-2xl border border-emerald-200/70 bg-white/90 px-4 py-3 shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800">
            Escada de absorção
          </p>
          <p className="font-body text-sm font-semibold text-slate-700">
            Toque cada via e compare a velocidade — a SC é lenta e contínua
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,11rem)_1fr] md:gap-4">
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Mais rápida ↑
            </p>
            {ROUTES.map((route) => {
              const isActive = selected === route.id;
              const isFocus = route.id === 'sc';
              return (
                <motion.button
                  key={route.id}
                  type="button"
                  onClick={() => selectRoute(route.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-xl border-2 p-2.5 text-left transition-shadow ${
                    isActive
                      ? `ring-2 ${route.active}`
                      : isFocus
                        ? 'border-emerald-300/80 bg-emerald-50/40'
                        : 'border-slate-200/80 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className={`font-mono text-sm font-black ${route.text}`}>{route.label}</p>
                      <p className="font-body text-[10px] font-medium text-slate-600">{route.full}</p>
                    </div>
                    {isFocus ? (
                      <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase text-white">
                        foco
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                    <motion.div
                      className={`h-full rounded-full ${route.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${route.speed}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[8px] font-bold uppercase tracking-wide text-slate-500">
                    {route.tag}
                  </p>
                </motion.button>
              );
            })}
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Mais lenta ↓
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              className={`flex min-h-[14rem] flex-col overflow-hidden rounded-2xl border-2 bg-gradient-to-br shadow-xl ring-1 ring-black/5 ${activeRoute.panelGradient} ${activeRoute.active}`}
            >
              <div className={`border-b border-slate-200/60 px-4 py-4 md:px-5 ${activeRoute.barSoft}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-md ${activeRoute.bar} text-white`}
                    >
                      <Zap className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <p className={`font-body text-xl font-bold leading-tight ${activeRoute.text}`}>
                        {activeRoute.full} ({activeRoute.label})
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Absorção {activeRoute.tag.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  {selected === 'sc' && scGabaritoBadge ? (
                    <span className="shrink-0 rounded-full bg-emerald-500 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
                      {scGabaritoBadge}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between font-mono text-[8px] font-bold uppercase tracking-wider text-slate-500">
                    <span>velocidade</span>
                    <span>{activeRoute.speed}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/80 shadow-inner">
                    <motion.div
                      className={`h-full rounded-full ${activeRoute.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${activeRoute.speed}%` }}
                      transition={{ duration: 0.45 }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3 md:px-5 md:py-4">
                {detailSections.length > 0 ? (
                  detailSections.map((section, index) => {
                    const Icon = resolveLucideIcon(section.icon);
                    return (
                      <div
                        key={index}
                        className={`rounded-xl border border-slate-200/70 border-l-[4px] bg-white/80 p-3 shadow-sm ${activeRoute.accentBorder} ${
                          section.highlight ? 'ring-1 ring-emerald-200/80' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activeRoute.barSoft} ${activeRoute.text}`}
                          >
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <p className="font-body text-sm font-bold text-slate-900">{section.title}</p>
                            <p className="mt-1.5 font-body text-sm leading-relaxed text-slate-700">
                              {section.body}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="font-body text-sm leading-relaxed text-slate-600">
                    Toque outra via na escada para comparar perfis de absorção.
                  </p>
                )}

                <div
                  className={`mt-1 rounded-xl border px-3.5 py-3 shadow-sm ${
                    selected === 'sc'
                      ? 'border-emerald-300/80 bg-emerald-50/90'
                      : 'border-amber-200/80 bg-amber-50/80'
                  }`}
                >
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">
                    Dica de prova
                  </p>
                  <p
                    className={`mt-1 font-body text-sm font-semibold leading-relaxed ${
                      selected === 'sc' ? 'text-emerald-950' : 'text-amber-950'
                    }`}
                  >
                    {activeExamTip}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
