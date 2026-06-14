'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';

export interface MorphingTimelineConcept {
  icon: string;
  title: string;
  description: string;
}

type NodeSlot = 'parametro' | 'antissepsia' | 'barreira' | 'curativo' | 'remocao' | 'gabarito' | 'extra';

const NODE_PALETTES = [
  {
    circle: 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 shadow-amber-500/30',
    stripe: 'bg-amber-500',
    tag: 'bg-amber-500/12 text-amber-700',
    metric: 'bg-amber-50 border-amber-500/15 text-amber-700',
    metricNum: 'text-amber-600',
  },
  {
    circle: 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600 shadow-pink-500/30',
    stripe: 'bg-pink-500',
    tag: 'bg-pink-500/12 text-pink-700',
    metric: 'bg-pink-50 border-pink-500/15 text-pink-700',
    metricNum: 'text-pink-700',
  },
  {
    circle: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 shadow-blue-500/30',
    stripe: 'bg-blue-500',
    tag: 'bg-blue-500/12 text-blue-700',
    metric: 'bg-blue-50 border-blue-500/15 text-blue-700',
    metricNum: 'text-blue-800',
  },
  {
    circle: 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 shadow-emerald-500/30',
    stripe: 'bg-emerald-500',
    tag: 'bg-emerald-500/12 text-emerald-800',
    metric: 'bg-emerald-50 border-emerald-500/15 text-emerald-800',
    metricNum: 'text-emerald-800',
  },
  {
    circle: 'bg-gradient-to-br from-violet-100 to-violet-200 text-violet-600 shadow-violet-500/30',
    stripe: 'bg-violet-500',
    tag: 'bg-violet-500/12 text-violet-700',
    metric: 'bg-violet-50 border-violet-500/15 text-violet-700',
    metricNum: 'text-violet-700',
  },
];

const SLOT_TAGS: Record<NodeSlot, string> = {
  parametro: 'Parâmetro',
  antissepsia: 'Antissepsia',
  barreira: 'Barreira',
  curativo: 'Curativo',
  remocao: 'Remoção',
  gabarito: 'Gabarito',
  extra: 'Conceito',
};

function inferSlot(title: string, description: string): NodeSlot {
  const text = `${title} ${description}`.toLowerCase();
  if (/gabarito|letra\s*[a-e]/.test(text)) return 'gabarito';
  if (/parâmetro|parametro|enunciado|comando/.test(text)) return 'parametro';
  if (/antissepsia|clorexidina|higieniza/.test(text)) return 'antissepsia';
  if (/barreira|asséptica|esteril/.test(text)) return 'barreira';
  if (/curativo|semipermeável/.test(text)) return 'curativo';
  if (/remoção|retirar|interrupção/.test(text)) return 'remocao';
  return 'extra';
}

function inferMetricMiddle(slot: NodeSlot): string {
  switch (slot) {
    case 'parametro':
      return 'Base';
    case 'gabarito':
      return 'Gabarito';
    case 'barreira':
      return 'Protocolo';
    case 'antissepsia':
    case 'curativo':
    case 'remocao':
      return 'Bundle';
    default:
      return 'Etapa';
  }
}

function inferMetricImpact(slot: NodeSlot): string {
  if (slot === 'gabarito') return '✓';
  if (slot === 'parametro') return '↑';
  if (slot === 'barreira' || slot === 'remocao') return '↑↑';
  return '↑';
}

function previewText(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= 72) return trimmed;
  const cut = trimmed.slice(0, 72);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

interface MorphingTimelineConceptMapProps {
  concepts: MorphingTimelineConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function MorphingTimelineConceptMap({
  concepts,
  footerRule,
}: MorphingTimelineConceptMapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const nodes = useMemo(
    () =>
      concepts.map((concept, index) => ({
        ...concept,
        slot: inferSlot(concept.title, concept.description),
        palette: NODE_PALETTES[index % NODE_PALETTES.length],
      })),
    [concepts],
  );

  const total = nodes.length;
  const railFillPct = total > 0 ? (revealedCount / total) * 100 : 0;

  const revealUpTo = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= total) return;
      setRevealedCount((prev) => Math.max(prev, targetIndex + 1));
    },
    [total],
  );

  const revealNext = useCallback(() => {
    setRevealedCount((prev) => Math.min(prev + 1, total));
  }, [total]);

  const reset = useCallback(() => {
    setRevealedCount(0);
    setExpandedIndex(null);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleCard = useCallback(
    (index: number) => {
      if (index >= revealedCount) return;
      setExpandedIndex((prev) => {
        const next = prev === index ? null : index;
        if (next !== null) {
          setTimeout(() => {
            const area = scrollRef.current;
            const nodeEl = area?.querySelector(`[data-timeline-node="${index}"]`);
            if (area && nodeEl instanceof HTMLElement) {
              area.scrollTo({ top: nodeEl.offsetTop - 20, behavior: 'smooth' });
            }
          }, 120);
        }
        return next;
      });
    },
    [revealedCount],
  );

  if (nodes.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum conceito definido</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[#f9f7f4]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage: [
            'radial-gradient(circle at 20% 30%, rgba(255,200,100,0.06) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 70%, rgba(200,180,255,0.07) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 10%, rgba(180,230,255,0.05) 0%, transparent 40%)',
            'repeating-linear-gradient(180deg, transparent 0px, transparent 31px, rgba(0,0,0,0.025) 31px, rgba(0,0,0,0.025) 32px)',
          ].join(', '),
        }}
      />

      <div className="relative z-10 flex items-start justify-between px-6 pt-5">
        <div>
          <span className="inline-flex items-center gap-1 rounded-md border border-black/8 bg-black/5 px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
            ✦ Morphing Timeline
          </span>
          <h2 className="mt-1 font-display text-[28px] font-black leading-tight tracking-tight text-slate-900">
            Cada etapa
            <br />
            em{' '}
            <span className="bg-gradient-to-br from-amber-500 to-red-500 bg-clip-text text-transparent">
              sequência
            </span>
          </h2>
        </div>
        <div className="text-right pt-1">
          <p className="font-display text-[32px] font-black leading-none tracking-tight text-slate-900">
            {revealedCount}
            <span className="text-sm font-semibold text-slate-300">/{total}</span>
          </p>
          <p className="mt-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300">
            revelados
          </p>
        </div>
      </div>

      <div
        className="relative z-10 mx-6 mt-3 h-px bg-gradient-to-r from-slate-900 via-black/10 to-transparent"
        aria-hidden
      />

      <div ref={scrollRef} className="relative z-10 min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="absolute bottom-4 left-[50px] top-5 w-0.5 bg-gradient-to-b from-slate-900 to-black/10">
          <div
            className="w-full bg-slate-900 transition-[height] duration-500 ease-out"
            style={{ height: `${railFillPct}%` }}
          />
        </div>

        <div className="flex flex-col">
          {nodes.map((node, index) => {
            const pending = index >= revealedCount;
            const expanded = expandedIndex === index;
            const Icon = resolveLucideIcon(node.icon);
            const tag = SLOT_TAGS[node.slot];

            return (
              <div
                key={`${node.title}-${index}`}
                data-timeline-node={index}
                className={`relative z-[5] flex min-h-[100px] items-start gap-[18px] ${pending ? 'opacity-100' : ''}`}
              >
                <div className="flex w-8 shrink-0 flex-col items-center pt-1">
                  <span className="mb-1.5 w-8 text-center font-mono text-[9px] font-extrabold uppercase tracking-widest text-slate-300">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <motion.button
                    type="button"
                    disabled={pending}
                    onClick={() => revealUpTo(index)}
                    initial={false}
                    animate={pending ? { scale: 1, opacity: 0.3 } : { scale: 1, opacity: 1 }}
                    whileTap={pending ? undefined : { scale: 0.9 }}
                    className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-lg transition-shadow ${node.palette.circle} ${
                      pending ? 'pointer-events-none' : 'cursor-pointer'
                    } ${index < revealedCount ? 'ring-[1.5px] ring-current/30 ring-offset-2' : ''}`}
                    aria-label={`Revelar ${node.title}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </motion.button>
                </div>

                <div className="min-w-0 flex-1 pb-7">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggleCard(index)}
                    className={`relative w-full overflow-hidden rounded-[14px] border border-black/7 bg-white text-left shadow-sm transition-all ${
                      pending
                        ? 'pointer-events-none border-dashed bg-white/50'
                        : 'cursor-pointer active:scale-[0.98]'
                    }`}
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[3px] ${node.palette.stripe}`}
                      aria-hidden
                    />
                    <div className="relative px-4 py-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`font-body text-sm font-extrabold ${pending ? 'text-slate-300' : 'text-slate-900'}`}
                        >
                          {node.title}
                        </p>
                        <ChevronRight
                          className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                            expanded ? 'rotate-90 text-slate-400' : 'text-slate-300'
                          }`}
                          aria-hidden
                        />
                      </div>
                      <p
                        className={`mt-1 font-body text-xs leading-snug transition-opacity ${
                          pending ? 'text-slate-200' : expanded ? 'h-0 overflow-hidden opacity-0' : 'text-slate-400'
                        }`}
                      >
                        {previewText(node.description)}
                      </p>

                      <AnimatePresence initial={false}>
                        {expanded && !pending ? (
                          <motion.div
                            key="body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2.5 border-t border-black/6 pt-3">
                              <p className="mb-3 font-body text-[13px] leading-relaxed text-slate-600">
                                {node.description}
                              </p>
                              <div className="flex gap-2">
                                {[
                                  { num: String(index + 1).padStart(2, '0'), lbl: 'Etapa' },
                                  { num: inferMetricMiddle(node.slot), lbl: 'Nível' },
                                  { num: inferMetricImpact(node.slot), lbl: 'Impacto' },
                                ].map((met) => (
                                  <div
                                    key={met.lbl}
                                    className={`flex-1 rounded-[10px] border px-2 py-2.5 text-center ${node.palette.metric}`}
                                  >
                                    <p className={`font-display text-lg font-black leading-none ${node.palette.metricNum}`}>
                                      {met.num}
                                    </p>
                                    <p className="mt-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                      {met.lbl}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2.5 flex items-center justify-between">
                                <span
                                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide ${node.palette.tag}`}
                                >
                                  {tag}
                                </span>
                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCard(index);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleCard(index);
                                    }
                                  }}
                                  className="cursor-pointer rounded-md border border-black/8 px-1.5 py-0.5 font-body text-[11px] font-bold text-slate-300"
                                >
                                  fechar ✕
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {footerRule?.trim() ? (
        <p className="relative z-10 px-6 pb-2 text-center font-body text-[11px] leading-relaxed text-slate-500">
          {footerRule.trim()}
        </p>
      ) : null}

      <div className="relative z-10 flex items-center gap-2.5 px-6 pb-5 pt-2">
        <button
          type="button"
          onClick={reset}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border-[1.5px] border-black/10 bg-white text-lg shadow-sm transition-transform active:scale-95"
          title="Reiniciar"
          aria-label="Reiniciar timeline"
        >
          ↺
        </button>
        <button
          type="button"
          disabled={revealedCount >= total}
          onClick={revealNext}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 font-body text-sm font-bold text-white transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {revealedCount >= total ? '✓ Todas etapas reveladas' : 'Revelar próxima etapa →'}
        </button>
      </div>
    </div>
  );
}
