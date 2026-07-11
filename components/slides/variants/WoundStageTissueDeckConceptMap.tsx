'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bandage, CheckCircle2, Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { SlideLucideIcon } from '../core/SlideLucideIcon';

export interface WoundDeckConcept {
  icon: string;
  title: string;
  description: string;
}

type DeckSlot = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'tissue' | 'trap' | 'answer' | 'extra';

const STAGE_META: Record<
  'stage1' | 'stage2' | 'stage3' | 'stage4',
  { label: string; roman: string; bar: string; ring: string; panel: string; text: string }
> = {
  stage1: {
    label: 'Estágio I',
    roman: 'I',
    bar: 'from-rose-400 to-rose-200',
    ring: 'ring-rose-300/60',
    panel: 'from-rose-50/95 via-white to-pink-50/90',
    text: 'text-rose-900',
  },
  stage2: {
    label: 'Estágio II',
    roman: 'II',
    bar: 'from-orange-400 to-orange-200',
    ring: 'ring-orange-300/60',
    panel: 'from-orange-50/95 via-white to-amber-50/90',
    text: 'text-orange-900',
  },
  stage3: {
    label: 'Estágio III',
    roman: 'III',
    bar: 'from-amber-500 to-amber-200',
    ring: 'ring-amber-300/60',
    panel: 'from-amber-50/95 via-white to-yellow-50/90',
    text: 'text-amber-900',
  },
  stage4: {
    label: 'Estágio IV',
    roman: 'IV',
    bar: 'from-red-600 to-red-300',
    ring: 'ring-red-400/60',
    panel: 'from-red-50/95 via-white to-rose-50/90',
    text: 'text-red-900',
  },
};

function inferSlot(title: string, description: string): DeckSlot {
  const text = `${title} ${description}`.toLowerCase();
  if (/gabarito|resposta|letra\s*[a-e]\s*—/i.test(text)) return 'answer';
  if (/estágio\s*iv|estagio\s*iv|osso|tendão|tendao|exposto/.test(text)) return 'stage4';
  if (/estágio\s*iii|estagio\s*iii|subcutânea|subcutanea|perda completa/.test(text)) return 'stage3';
  if (/estágio\s*ii|estagio\s*ii|derme|parcial/.test(text)) return 'stage2';
  if (/estágio\s*i[^i]|estagio\s*i[^i]|eritema|não branqueável|nao branqueavel/.test(text)) return 'stage1';
  if (/granulação|granulacao|esfacelo|necrose|tecido|fibrina/.test(text)) return 'tissue';
  if (/pegadinha|falsa|errad|úmid|umid|massage|álcool|alcool/.test(text)) return 'trap';
  return 'extra';
}

interface WoundStageTissueDeckConceptMapProps {
  concepts: WoundDeckConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function WoundStageTissueDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: WoundStageTissueDeckConceptMapProps) {
  const grouped = useMemo(() => {
    const stages: Partial<Record<'stage1' | 'stage2' | 'stage3' | 'stage4', WoundDeckConcept>> = {};
    const tissues: WoundDeckConcept[] = [];
    const traps: WoundDeckConcept[] = [];
    const extras: WoundDeckConcept[] = [];
    let answer: WoundDeckConcept | undefined;

    for (const concept of concepts) {
      const slot = inferSlot(concept.title, concept.description);
      if (slot === 'answer') {
        answer = concept;
        continue;
      }
      if (slot === 'stage1' || slot === 'stage2' || slot === 'stage3' || slot === 'stage4') {
        stages[slot] = concept;
        continue;
      }
      if (slot === 'tissue') {
        tissues.push(concept);
        continue;
      }
      if (slot === 'trap') {
        traps.push(concept);
        continue;
      }
      extras.push(concept);
    }

    return { stages, tissues, traps, extras, answer };
  }, [concepts]);

  const stageKeys = (['stage1', 'stage2', 'stage3', 'stage4'] as const).filter((k) => grouped.stages[k]);
  const fallbackConcepts = useMemo(
    () => [...grouped.traps, ...grouped.extras, ...grouped.tissues],
    [grouped.traps, grouped.extras, grouped.tissues],
  );
  const hasStages = stageKeys.length > 0;
  const defaultStage = stageKeys[0] ?? 'stage1';
  const [activeStage, setActiveStage] = useState<'stage1' | 'stage2' | 'stage3' | 'stage4'>(defaultStage);
  const [activeFallback, setActiveFallback] = useState(0);

  const activeConcept = hasStages
    ? grouped.stages[activeStage]
    : fallbackConcepts[activeFallback];
  const activeMeta = hasStages ? STAGE_META[activeStage] : null;
    const selectStage = useCallback((stage: 'stage1' | 'stage2' | 'stage3' | 'stage4') => {
    setActiveStage(stage);
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-orange-700 shadow-sm">
            <Bandage className="h-3 w-3" aria-hidden />
            Stage Deck
          </span>
          <p className="flex items-center gap-1.5 font-body text-xs font-medium text-slate-600">
            <Hand className="h-3.5 w-3.5 shrink-0 text-orange-600" aria-hidden />
            Toque cada cartão para ver a explicação
          </p>
        </div>

        {hasStages ? (
          <div className="grid grid-cols-4 gap-2">
            {stageKeys.map((key) => {
              const meta = STAGE_META[key];
              const isActive = activeStage === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectStage(key)}
                  aria-label={`${meta.label}: ${grouped.stages[key]?.title ?? ''}`}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 transition-all ${
                    isActive
                      ? `border-2 bg-white shadow-lg ${meta.ring} ring-2`
                      : 'border-slate-200/90 bg-white/80 shadow-sm hover:shadow-md hover:ring-1 hover:ring-orange-200/80 active:scale-[0.98]'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${meta.bar} font-display text-sm font-black text-white shadow-inner`}
                  >
                    {meta.roman}
                  </span>
                  <span className={`font-mono text-[7px] font-bold uppercase ${isActive ? meta.text : 'text-slate-500'}`}>
                    {meta.label.replace('Estágio ', '')}
                  </span>
                </button>
              );
            })}
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
              key={hasStages ? activeStage : activeFallback}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`overflow-hidden rounded-2xl border-2 border-white/80 bg-gradient-to-br shadow-xl ${
                activeMeta ? `${activeMeta.panel} ${activeMeta.ring} ring-1` : 'from-orange-50/95 via-white to-amber-50/90 ring-orange-200/60 ring-1'
              }`}
            >
              <div className="border-b border-black/5 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-inner ${
                      activeMeta ? `bg-gradient-to-br ${activeMeta.bar}` : 'bg-gradient-to-br from-orange-400 to-amber-300'
                    }`}
                  >
                    <SlideLucideIcon name={activeConcept?.icon ?? 'Bandage'} className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    {activeMeta ? (
                      <p className={`font-mono text-[9px] font-extrabold uppercase tracking-widest ${activeMeta.text}`}>
                        {activeMeta.label}
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
