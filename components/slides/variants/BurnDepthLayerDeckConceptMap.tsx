'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Flame, Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';

export interface BurnDepthConcept {
  icon: string;
  title: string;
  description: string;
}

type DepthSlot = 'grau1' | 'grau2s' | 'grau2p' | 'grau3' | 'cicatrizacao' | 'regra9' | 'tetano' | 'answer' | 'extra';

const DEPTH_META: Record<
  'grau1' | 'grau2s' | 'grau2p' | 'grau3',
  {
    label: string;
    depth: string;
    bar: string;
    ring: string;
    panel: string;
    text: string;
    layer: string;
  }
> = {
  grau1: {
    label: '1º grau',
    depth: 'epiderme',
    bar: 'from-rose-300 to-rose-100',
    ring: 'ring-rose-300/60',
    panel: 'from-rose-50/95 via-white to-pink-50/90',
    text: 'text-rose-900',
    layer: 'h-2',
  },
  grau2s: {
    label: '2º sup.',
    depth: 'derme papilar',
    bar: 'from-orange-400 to-orange-200',
    ring: 'ring-orange-300/60',
    panel: 'from-orange-50/95 via-white to-amber-50/90',
    text: 'text-orange-900',
    layer: 'h-4',
  },
  grau2p: {
    label: '2º prof.',
    depth: 'derme reticular',
    bar: 'from-amber-500 to-amber-200',
    ring: 'ring-amber-300/60',
    panel: 'from-amber-50/95 via-white to-yellow-50/90',
    text: 'text-amber-900',
    layer: 'h-6',
  },
  grau3: {
    label: '3º grau',
    depth: 'toda espessura',
    bar: 'from-red-600 to-red-300',
    ring: 'ring-red-400/60',
    panel: 'from-red-50/95 via-white to-rose-50/90',
    text: 'text-red-900',
    layer: 'h-8',
  },
};

function inferSlot(title: string, description: string): DepthSlot {
  const text = `${title} ${description}`.toLowerCase();
  if (/gabarito|resposta|letra\s*[a-e]\s*—/i.test(text)) return 'answer';
  if (/regra dos 9|regra de 9|superfície corporal|superficie corporal|scq|9%|18%|36%/.test(text)) {
    return 'regra9';
  }
  if (/tétano|tetano|vacina|soro antitet|profilaxia/.test(text)) return 'tetano';
  if (/cicatriza|granulação|granulacao|matriz|contração|contracao|epitelização|epitelizacao/.test(text)) {
    return 'cicatrizacao';
  }
  if (/3º|3o|terceiro grau|terceiro|toda espessura|carbonizada|necrose/.test(text)) return 'grau3';
  if (/2º prof|2o prof|profunda|derme reticular|bolha/.test(text)) return 'grau2p';
  if (/2º|2o|superficial|derme papilar|bolhas/.test(text)) return 'grau2s';
  if (/1º|1o|primeiro grau|epiderme|eritema|sem bolha/.test(text)) return 'grau1';
  return 'extra';
}

interface BurnDepthLayerDeckConceptMapProps {
  concepts: BurnDepthConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function BurnDepthLayerDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: BurnDepthLayerDeckConceptMapProps) {
  const grouped = useMemo(() => {
    const depths: Partial<Record<'grau1' | 'grau2s' | 'grau2p' | 'grau3', BurnDepthConcept>> = {};
    const extras: BurnDepthConcept[] = [];
    let answer: BurnDepthConcept | undefined;
    let regra9: BurnDepthConcept | undefined;
    let tetano: BurnDepthConcept | undefined;
    let cicatrizacao: BurnDepthConcept | undefined;

    for (const concept of concepts) {
      const slot = inferSlot(concept.title, concept.description);
      if (slot === 'answer') {
        answer = concept;
        continue;
      }
      if (slot === 'regra9') {
        regra9 = concept;
        continue;
      }
      if (slot === 'tetano') {
        tetano = concept;
        continue;
      }
      if (slot === 'cicatrizacao') {
        cicatrizacao = concept;
        continue;
      }
      if (slot === 'grau1' || slot === 'grau2s' || slot === 'grau2p' || slot === 'grau3') {
        depths[slot] = concept;
        continue;
      }
      extras.push(concept);
    }

    return { depths, extras, answer, regra9, tetano, cicatrizacao };
  }, [concepts]);

  const depthKeys = (['grau1', 'grau2s', 'grau2p', 'grau3'] as const).filter((k) => grouped.depths[k]);
  const fallbackConcepts = useMemo(
    () =>
      [
        grouped.regra9,
        grouped.tetano,
        grouped.cicatrizacao,
        ...grouped.extras,
      ].filter(Boolean) as BurnDepthConcept[],
    [grouped.regra9, grouped.tetano, grouped.cicatrizacao, grouped.extras],
  );
  const hasDepths = depthKeys.length > 0;
  const defaultDepth = depthKeys[0] ?? 'grau1';
  const [activeDepth, setActiveDepth] = useState<'grau1' | 'grau2s' | 'grau2p' | 'grau3'>(defaultDepth);
  const [activeFallback, setActiveFallback] = useState(0);

  const activeConcept = hasDepths
    ? grouped.depths[activeDepth]
    : fallbackConcepts[activeFallback];
  const activeMeta = hasDepths ? DEPTH_META[activeDepth] : null;
    const selectDepth = useCallback((depth: 'grau1' | 'grau2s' | 'grau2p' | 'grau3') => {
    setActiveDepth(depth);
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-orange-700 shadow-sm">
            <Flame className="h-3 w-3" aria-hidden />
            Depth Layer
          </span>
          <p className="flex items-center gap-1.5 font-body text-xs font-medium text-slate-600">
            <Hand className="h-3.5 w-3.5 shrink-0 text-orange-600" aria-hidden />
            Toque cada camada para ver profundidade e achado clínico
          </p>
        </div>

        {hasDepths ? (
          <div className="flex flex-col gap-2">
            <div className="mx-auto flex w-24 flex-col-reverse overflow-hidden rounded-xl border border-slate-200/90 bg-white/90 shadow-inner">
              {depthKeys.map((key) => {
                const meta = DEPTH_META[key];
                const isActive = activeDepth === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectDepth(key)}
                    aria-label={`${meta.label}: ${grouped.depths[key]?.title ?? ''}`}
                    className={`w-full transition-all ${meta.layer} bg-gradient-to-r ${meta.bar} ${
                      isActive ? 'ring-2 ring-inset ring-orange-400/80' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                );
              })}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {depthKeys.map((key) => {
                const meta = DEPTH_META[key];
                const isActive = activeDepth === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectDepth(key)}
                    aria-label={`${meta.label}: ${grouped.depths[key]?.title ?? ''}`}
                    className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 transition-all ${
                      isActive
                        ? `border-2 bg-white shadow-lg ${meta.ring} ring-2`
                        : 'border-slate-200/90 bg-white/80 shadow-sm hover:shadow-md hover:ring-1 hover:ring-orange-200/80 active:scale-[0.98]'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${meta.bar} font-display text-[10px] font-black text-white shadow-inner`}
                    >
                      {meta.label.replace(' grau', '°').replace(' sup.', 'S').replace(' prof.', 'P')}
                    </span>
                    <span className={`font-mono text-[7px] font-bold uppercase ${isActive ? meta.text : 'text-slate-500'}`}>
                      {meta.depth}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : fallbackConcepts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {fallbackConcepts.map((item, index) => {
              const isActive = activeFallback === index;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveFallback(index)}
                  aria-label={item.title}
                  className={`cursor-pointer rounded-xl border px-2 py-2 text-left transition-all ${
                    isActive
                      ? 'border-2 border-orange-300 bg-white shadow-lg ring-2 ring-orange-200/60'
                      : 'border-slate-200/90 bg-white/80 shadow-sm hover:shadow-md hover:ring-1 hover:ring-orange-200/80 active:scale-[0.98]'
                  }`}
                >
                  <p className="line-clamp-2 font-body text-[10px] font-semibold leading-tight text-slate-800">
                    {item.title}
                  </p>
                </button>
              );
            })}
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {activeConcept ? (
            <motion.div
              key={hasDepths ? activeDepth : activeFallback}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`overflow-hidden rounded-2xl border-2 border-white/80 bg-gradient-to-br shadow-xl ${
                activeMeta
                  ? `${activeMeta.panel} ${activeMeta.ring} ring-1`
                  : 'from-orange-50/95 via-white to-amber-50/90 ring-orange-200/60 ring-1'
              }`}
            >
              <div className="border-b border-black/5 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-inner ${
                      activeMeta ? `bg-gradient-to-br ${activeMeta.bar}` : 'bg-gradient-to-br from-orange-400 to-amber-300'
                    }`}
                  >
                    <SlideLucideIcon name={activeConcept?.icon ?? 'Flame'} className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    {activeMeta ? (
                      <p className={`font-mono text-[9px] font-extrabold uppercase tracking-widest ${activeMeta.text}`}>
                        {activeMeta.label} · {activeMeta.depth}
                      </p>
                    ) : null}
                    <h3 className="font-body text-sm font-semibold leading-snug text-slate-900">{activeConcept.title}</h3>
                  </div>
                </div>
              </div>
              <p className="px-4 py-3 font-body text-sm leading-relaxed text-slate-700">{activeConcept.description}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {grouped.answer ? (
          <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-100/90 via-emerald-50 to-teal-100/70 p-4 shadow-lg shadow-emerald-200/45 ring-1 ring-emerald-200/60">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800">Resposta da prova</p>
              <p className="font-body text-sm font-bold leading-snug text-emerald-950">{grouped.answer.description}</p>
            </div>
          </div>
        ) : null}

        {footerRule ? (
          <p className="rounded-xl border border-orange-200/70 bg-white/90 px-3 py-2.5 text-center font-body text-xs italic text-orange-900/90 shadow-sm">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
