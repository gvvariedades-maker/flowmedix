'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Snowflake, Thermometer, Truck } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  detectColdChainMode,
  inferColdChainCardCategory,
  isPniVfColdChainCorpus,
  PNI_TEMP_MARKERS,
  pniTempLabel,
  type PniCategory,
} from '@/lib/slides/pniSlideUtils';
import { BoardChrome, CriticalNumber, PolarityPanel, CategoryStrip } from '../primitives';
import { cn } from '@/lib/utils';

export interface ColdChainConcept {
  icon: string;
  title: string;
  description: string;
}

const CATEGORY_META: Record<
  PniCategory,
  { label: string; border: string; badge: string; badgeText: string }
> = {
  calendario: {
    label: 'CALENDÁRIO',
    border: 'border-l-lime-500',
    badge: 'bg-lime-100/90',
    badgeText: 'text-lime-800',
  },
  intervalo: {
    label: 'INTERVALO',
    border: 'border-l-sky-500',
    badge: 'bg-sky-100/90',
    badgeText: 'text-sky-800',
  },
  rede_frio: {
    label: 'REDE DE FRIO',
    border: 'border-l-teal-500',
    badge: 'bg-teal-100/90',
    badgeText: 'text-teal-900',
  },
  cuidado: {
    label: 'SALA',
    border: 'border-l-amber-500',
    badge: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
  },
  gabarito: {
    label: 'ÂNCORA',
    border: 'border-l-rose-500',
    badge: 'bg-rose-100/90',
    badgeText: 'text-rose-800',
  },
  geral: {
    label: 'PNI',
    border: 'border-l-teal-400',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-700',
  },
};

function heroScore(title: string, description: string): number {
  const t = `${title} ${description}`.toLowerCase();
  if (/agitar|≠\s*recuper|pegadinha|âncora/.test(t)) return 100;
  if (/cadeia|temperatura|2\s*.*8|faixa/.test(t)) return 60;
  return 0;
}

interface ColdChainHubConceptMapProps {
  concepts: ColdChainConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Hub cadeia de frio Glance OS — herói + CriticalNumber 2–8 + cards abertos (0 taps). */
export function ColdChainHubConceptMap({ concepts, theme, footerRule }: ColdChainHubConceptMapProps) {
  const reduceMotion = useReducedMotion();
  const corpus = useMemo(
    () => concepts.map((c) => `${c.title} ${c.description}`).join(' ') + (footerRule ?? ''),
    [concepts, footerRule],
  );
  const vfMode = isPniVfColdChainCorpus(corpus);
  const mode = detectColdChainMode(corpus);

  if (concepts.length === 0) return null;

  const scored = concepts.map((c, i) => ({ c, i, score: heroScore(c.title, c.description) }));
  scored.sort((a, b) => b.score - a.score);
  const hero = scored[0]?.score > 0 ? scored[0].c : concepts[0];
  const rest = concepts.filter((c) => c !== hero);

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow={vfMode ? 'MAPA — V/F CADEIA DE FRIO' : 'MAPA — REDE DE FRIO'}
      footerRule={footerRule}
      footerLabel={footerRule ? 'FIXAÇÃO' : undefined}
      maxWidth="3xl"
    >
      {/* Gesto da rede de frio: piso/teto sempre visíveis — inclusive em V/F. */}
      <div className="flex flex-wrap items-stretch justify-center gap-2">
        <CriticalNumber value="2" unit="°C" label="PISO" emphasis="ok" className="min-w-[4.5rem] px-3 py-2" />
        <CriticalNumber value="8" unit="°C" label="TETO" emphasis="alert" className="min-w-[4.5rem] px-3 py-2" />
      </div>
      {mode === 'vf' ? (
        <div className="flex items-center justify-center gap-2">
          <Truck className="h-4 w-4 text-teal-700" aria-hidden />
          <CategoryStrip label="V/F — julgue cada assertiva" tone="command" />
          <Thermometer className="h-4 w-4 text-teal-700" aria-hidden />
        </div>
      ) : null}

      {hero ? (
        <PolarityPanel tone="transfer" emphasized>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                theme.iconBg,
                theme.iconText,
              )}
            >
              {(() => {
                const Icon = resolveLucideIcon(hero.icon);
                return <Icon size={24} />;
              })()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-800">
                ÂNCORA DA PROVA
              </p>
              {/* Evita duplicar eyebrow quando o JSON ainda usa label genérico. */}
              {!/^âncora da prova$/i.test(hero.title.trim()) ? (
                <h3 className="mt-0.5 font-body text-lg font-bold text-slate-900 md:text-xl">
                  {hero.title}
                </h3>
              ) : null}
              <p
                className={cn(
                  'font-body text-sm leading-snug text-slate-700 md:text-base',
                  !/^âncora da prova$/i.test(hero.title.trim()) ? 'mt-1.5' : 'mt-0.5 font-semibold text-slate-900 md:text-[15px]',
                )}
              >
                {hero.description}
              </p>
            </div>
            <span className="shrink-0 rounded-lg bg-teal-600 px-2.5 py-1 font-mono text-xs font-black text-white shadow-sm">
              2–8°C
            </span>
          </div>
        </PolarityPanel>
      ) : null}

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {rest.map((concept, index) => {
          const category = inferColdChainCardCategory(`${concept.title} ${concept.description}`);
          const meta = CATEGORY_META[category];
          const Icon = resolveLucideIcon(concept.icon);

          return (
            <motion.div
              key={`${concept.title}-${index}`}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
              className={cn(
                'overflow-hidden rounded-2xl border border-l-[4px] bg-white/95 p-4 shadow-sm',
                meta.border,
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                  <Icon size={18} aria-hidden />
                </div>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase',
                    meta.badge,
                    meta.badgeText,
                  )}
                >
                  {meta.label}
                </span>
              </div>
              <p className="font-display text-sm font-bold text-slate-900">{concept.title}</p>
              <p className="mt-1.5 font-body text-sm leading-snug text-slate-700">{concept.description}</p>
            </motion.div>
          );
        })}
      </div>

      <p className="flex items-center justify-center gap-1 font-mono text-[9px] font-bold uppercase tracking-widest text-teal-800">
        <Snowflake className="h-3 w-3" aria-hidden />
        Temperatura positiva · decore 2–8 °C · {PNI_TEMP_MARKERS.map(pniTempLabel).join(' · ')}
      </p>
    </BoardChrome>
  );
}
