'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Snowflake, Thermometer, Truck } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  detectColdChainMode,
  inferPniCategory,
  isPniVfColdChainCorpus,
  PNI_TEMP_MARKERS,
  pniTempLabel,
  type PniCategory,
} from '@/lib/slides/pniSlideUtils';

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
    border: 'border-l-lime-400/90',
    badge: 'bg-lime-100/90',
    badgeText: 'text-lime-800',
  },
  intervalo: {
    label: 'INTERVALO',
    border: 'border-l-sky-400/90',
    badge: 'bg-sky-100/90',
    badgeText: 'text-sky-800',
  },
  rede_frio: {
    label: 'REDE DE FRIO',
    border: 'border-l-teal-400/90',
    badge: 'bg-teal-100/90',
    badgeText: 'text-teal-900',
  },
  cuidado: {
    label: 'CUIDADO',
    border: 'border-l-amber-400/90',
    badge: 'bg-amber-100/90',
    badgeText: 'text-amber-900',
  },
  gabarito: {
    label: 'GABARITO',
    border: 'border-l-emerald-500/90',
    badge: 'bg-emerald-100/90',
    badgeText: 'text-emerald-800',
  },
  geral: {
    label: 'PNI',
    border: 'border-l-teal-300/80',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-700',
  },
};

function inferVfChip(text: string): 'V' | 'F' | null {
  const lower = text.toLowerCase();
  if (/verdadeira|verdadeiro/.test(lower)) return 'V';
  if (/falsa|falso/.test(lower)) return 'F';
  return null;
}

function VfChip({ verdict }: { verdict: 'V' | 'F' }) {
  return (
    <span
      className={`shrink-0 rounded-lg px-2 py-1 font-display text-xs font-black ${
        verdict === 'V' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
      }`}
    >
      {verdict}
    </span>
  );
}

function TempPreviewRail({ corpus }: { corpus: string }) {
  const mode = detectColdChainMode(corpus);
  if (mode === 'vf') return null;

  return (
    <div
      className="flex items-center justify-between gap-0.5 rounded-xl border border-teal-200/80 bg-teal-50/70 px-2 py-2"
      aria-label="Faixa térmica PNI"
    >
      {PNI_TEMP_MARKERS.map((marker) => {
        const inBand = marker === 2 || marker === 8;
        const isCore = marker >= 2 && marker <= 8;
        return (
          <div
            key={marker}
            className={`flex min-w-0 flex-1 flex-col items-center rounded-lg px-0.5 py-1 ${
              isCore
                ? 'bg-teal-500/90 text-white ring-2 ring-teal-300/50'
                : 'bg-white/50 text-slate-400 opacity-70'
            }`}
          >
            <span className="font-mono text-[9px] font-black tabular-nums">
              {pniTempLabel(marker)}
              {inBand ? '°C' : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface ColdChainHubConceptMapProps {
  concepts: ColdChainConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function ColdChainHubConceptMap({ concepts, theme, footerRule }: ColdChainHubConceptMapProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const corpus = useMemo(
    () => concepts.map((c) => `${c.title} ${c.description}`).join(' '),
    [concepts],
  );
  const vfMode = isPniVfColdChainCorpus(corpus);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((current) => (current === index ? null : index));
  }, []);

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-35`} />

      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-center gap-3 rounded-xl border border-teal-200/80 bg-white/80 px-3 py-2 shadow-sm">
          <Truck className="h-4 w-4 text-teal-700" aria-hidden />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-teal-900">
            Cadeia de frio PNI
          </span>
          <Thermometer className="h-4 w-4 text-teal-700" aria-hidden />
        </div>

        <TempPreviewRail corpus={corpus} />

        {vfMode ? (
          <p className="text-center font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Modo V/F — julgue cada assertiva antes de combinar
          </p>
        ) : (
          <p className="flex items-center justify-center gap-1 font-mono text-[9px] font-bold uppercase tracking-widest text-teal-800">
            <Snowflake className="h-3 w-3" aria-hidden />
            Temperatura positiva · decore 2–8 °C
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {concepts.map((concept, index) => {
            const category = inferPniCategory(`${concept.title} ${concept.description}`);
            const meta = CATEGORY_META[category];
            const Icon = resolveLucideIcon(concept.icon);
            const expanded = expandedIndex === index;
            const vfChip = vfMode ? inferVfChip(concept.description) : null;

            return (
              <motion.button
                key={index}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => toggleExpanded(index)}
                aria-expanded={expanded}
                className={`overflow-hidden rounded-2xl border border-l-[4px] bg-white/95 p-4 text-left shadow-sm transition-shadow hover:shadow-md ${meta.border}`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                      <Icon size={18} aria-hidden />
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${meta.badge} ${meta.badgeText}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  {vfChip ? <VfChip verdict={vfChip} /> : null}
                </div>
                <p className="font-display text-sm font-bold text-slate-900">{concept.title}</p>
                <p
                  className={`mt-1.5 font-body text-sm leading-relaxed text-slate-700 ${
                    expanded ? '' : 'line-clamp-3'
                  }`}
                >
                  {concept.description}
                </p>
                {!expanded && concept.description.length > 64 ? (
                  <span className="mt-1.5 inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase text-slate-400">
                    <ChevronDown className="h-2.5 w-2.5" aria-hidden />
                    expandir
                  </span>
                ) : null}
              </motion.button>
            );
          })}
        </div>

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm italic leading-relaxed ${theme.borderColor} ${theme.iconBg} ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
