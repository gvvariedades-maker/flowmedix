'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';

export interface OrbitConcept {
  icon: string;
  title: string;
  description: string;
}

type BuildBlock = 'acoes' | 'esferas' | 'gestao' | 'fundacoes';

const BLOCK_META: Record<
  BuildBlock,
  {
    slot: string;
    short: string;
    position: string;
    iconBg: string;
    iconText: string;
    node: string;
    nodeActive: string;
    line: string;
    title: string;
    borderAccent: string;
  }
> = {
  acoes: {
    slot: 'Bloco 1',
    short: 'A+S',
    position: 'top-[4%] left-1/2 -translate-x-1/2',
    iconBg: 'bg-emerald-500',
    iconText: 'text-white',
    node: 'border-emerald-300 bg-emerald-50/90 text-emerald-900',
    nodeActive: 'border-emerald-500 bg-emerald-100 ring-4 ring-emerald-300/40',
    line: 'bg-emerald-400',
    title: 'text-emerald-950',
    borderAccent: 'border-l-emerald-500',
  },
  esferas: {
    slot: 'Bloco 2',
    short: '3E',
    position: 'top-1/2 right-[2%] -translate-y-1/2',
    iconBg: 'bg-sky-500',
    iconText: 'text-white',
    node: 'border-sky-300 bg-sky-50/90 text-sky-900',
    nodeActive: 'border-sky-500 bg-sky-100 ring-4 ring-sky-300/40',
    line: 'bg-sky-400',
    title: 'text-sky-950',
    borderAccent: 'border-l-sky-500',
  },
  gestao: {
    slot: 'Bloco 3',
    short: 'D+I',
    position: 'bottom-[4%] left-1/2 -translate-x-1/2',
    iconBg: 'bg-teal-500',
    iconText: 'text-white',
    node: 'border-teal-300 bg-teal-50/90 text-teal-900',
    nodeActive: 'border-teal-500 bg-teal-100 ring-4 ring-teal-300/40',
    line: 'bg-teal-400',
    title: 'text-teal-950',
    borderAccent: 'border-l-teal-500',
  },
  fundacoes: {
    slot: 'Bloco 4',
    short: 'FND',
    position: 'top-1/2 left-[2%] -translate-y-1/2',
    iconBg: 'bg-lime-500',
    iconText: 'text-white',
    node: 'border-lime-300 bg-lime-50/90 text-lime-900',
    nodeActive: 'border-lime-500 bg-lime-100 ring-4 ring-lime-300/40',
    line: 'bg-lime-400',
    title: 'text-lime-950',
    borderAccent: 'border-l-lime-500',
  },
};

const BUILD_BLOCKS: BuildBlock[] = ['acoes', 'esferas', 'gestao', 'fundacoes'];

function inferBlock(title: string, description: string): BuildBlock | 'norma' | 'contexto' | 'prova' {
  const text = `${title} ${description}`.toLowerCase();
  if (/ações \+ serviços|ações e serviços/.test(text)) return 'acoes';
  if (/três esferas|federais, estaduais/.test(text)) return 'esferas';
  if (/direta e indireta|administração direta/.test(text)) return 'gestao';
  if (/fundações/.test(text)) return 'fundacoes';
  if (/universalidade|integralidade|art\.?\s*196/.test(text)) return 'contexto';
  if (/cesgranrio|padrão|banca/.test(text)) return 'prova';
  return 'norma';
}

interface SusArt4OrbitConceptMapProps {
  concepts: OrbitConcept[];
  theme: ThemeColors;
}

export const SusArt4OrbitConceptMap = ({ concepts, theme }: SusArt4OrbitConceptMapProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [activated, setActivated] = useState<Set<BuildBlock>>(() => new Set());
  const [focused, setFocused] = useState<BuildBlock | null>(null);

  const { hub, blockMap, support } = useMemo(() => {
    const normaItems: OrbitConcept[] = [];
    const supportItems: OrbitConcept[] = [];
    const blocks: Partial<Record<BuildBlock, OrbitConcept>> = {};

    for (const concept of concepts) {
      const kind = inferBlock(concept.title, concept.description);
      if (BUILD_BLOCKS.includes(kind as BuildBlock)) {
        if (!blocks[kind as BuildBlock]) blocks[kind as BuildBlock] = concept;
      } else if (kind === 'norma') {
        normaItems.push(concept);
      } else {
        supportItems.push(concept);
      }
    }

    const hubTitle = normaItems.map((c) => c.title).join(' · ') || 'Lei 8.080/1990';
    const hubDetail =
      normaItems.map((c) => c.description).join(' ') ||
      'Monte os quatro blocos do Art. 4º tocando cada cartão ao redor.';

    return {
      hub: { title: hubTitle, detail: hubDetail },
      blockMap: blocks,
      support: supportItems,
    };
  }, [concepts]);

  const toggleBlock = useCallback((block: BuildBlock) => {
    setFocused((current) => (current === block ? null : block));
    setActivated((prev) => {
      const next = new Set(prev);
      next.add(block);
      return next;
    });
  }, []);

  const blockCount = BUILD_BLOCKS.filter((b) => blockMap[b]).length;
  const activatedCount = activated.size;
  const allActive = blockCount > 0 && activatedCount >= blockCount;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 flex flex-col gap-3 md:gap-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200/70 bg-white/90 px-4 py-3 shadow-sm">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800">
              Explore a órbita do Art. 4º
            </p>
            <p className="font-body text-sm font-semibold text-slate-700">
              Toque cada bloco colorido para montar a composição legal do SUS
            </p>
          </div>
          <div className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-center">
            <span className="font-mono text-lg font-black tabular-nums text-emerald-700">
              {activatedCount}
            </span>
            <span className="font-body text-xs text-emerald-800"> / {blockCount || 4}</span>
          </div>
        </div>

        <div className="relative isolate mx-auto aspect-square w-full max-w-md">
          {BUILD_BLOCKS.map((block) => {
            if (!blockMap[block] || !activated.has(block)) return null;
            const styles = BLOCK_META[block];
            return (
              <motion.div
                key={`line-${block}`}
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute left-1/2 top-1/2 z-10 h-0.5 w-[38%] origin-left -translate-y-1/2 ${styles.line} ${
                  block === 'acoes'
                    ? '-translate-x-1/2 -rotate-90'
                    : block === 'esferas'
                      ? ''
                      : block === 'gestao'
                        ? '-translate-x-1/2 rotate-90'
                        : '-translate-x-full'
                }`}
                aria-hidden
              />
            );
          })}

          {BUILD_BLOCKS.map((block) => {
            const concept = blockMap[block];
            if (!concept) return null;
            const styles = BLOCK_META[block];
            const isActive = activated.has(block);
            const Icon = resolveLucideIcon(concept.icon);

            return (
              <div key={block} className={`absolute z-20 ${styles.position} w-[42%] max-w-[11rem]`}>
                <motion.button
                  type="button"
                  onClick={() => toggleBlock(block)}
                  aria-expanded={focused === block}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                  className={`w-full rounded-2xl border-2 p-3 text-left shadow-md transition-shadow ${
                    isActive ? styles.nodeActive : styles.node
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${styles.iconBg} ${styles.iconText}`}
                    >
                      {isActive ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon size={16} />}
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[8px] font-bold uppercase tracking-widest opacity-70">
                        {styles.slot} · {styles.short}
                      </p>
                      <p className={`line-clamp-2 font-body text-xs font-bold leading-snug ${styles.title}`}>
                        {concept.title}
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>
            );
          })}

          <motion.div
            animate={
              allActive && !prefersReducedMotion
                ? { scale: [1, 1.03, 1] }
                : {}
            }
            transition={{ duration: 0.6 }}
            className={`pointer-events-none absolute left-1/2 top-1/2 z-30 flex h-[38%] w-[38%] min-w-[7.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 px-3 text-center shadow-xl ring-4 ring-white ${
              allActive
                ? 'border-emerald-400 bg-gradient-to-br from-emerald-100 to-teal-50 ring-emerald-100'
                : 'border-emerald-300/80 bg-white'
            }`}
          >
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-800">
              {allActive ? 'completo' : 'núcleo'}
            </span>
            <p className="mt-1 font-body text-xs font-bold leading-tight text-emerald-950 md:text-sm">
              {allActive ? 'Art. 4º montado' : 'SUS · Art. 4º'}
            </p>
            {allActive ? (
              <Check className="mt-1 h-5 w-5 text-emerald-600" strokeWidth={3} aria-hidden />
            ) : (
              <Plus className="mt-1 h-4 w-4 text-emerald-600/70" aria-hidden />
            )}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {focused && blockMap[focused] ? (
            <motion.div
              key={focused}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
              className={`rounded-2xl border border-slate-200/80 border-l-4 bg-white/95 p-4 shadow-md ${BLOCK_META[focused].borderAccent}`}
            >
              <p className={`font-body text-base font-bold ${BLOCK_META[focused].title}`}>
                {blockMap[focused]!.title}
              </p>
              <p className="mt-2 font-body text-sm leading-relaxed text-slate-700">
                {blockMap[focused]!.description}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="hub-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-emerald-200/70 bg-white/90 p-4 shadow-sm"
            >
              <p className="font-body text-sm font-bold text-emerald-950">{hub.title}</p>
              <p className="mt-1.5 font-body text-sm leading-relaxed text-slate-700">{hub.detail}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {support.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Contexto de prova
            </p>
            <div className="flex flex-wrap gap-2">
              {support.map((item, index) => {
                const Icon = resolveLucideIcon(item.icon);
                return (
                  <span
                    key={index}
                    className="inline-flex max-w-full items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/90 px-3 py-1.5 shadow-sm"
                    title={item.description}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden />
                    <span className="truncate font-body text-xs font-semibold text-amber-950">
                      {item.title}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}

        {allActive ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-emerald-300/80 bg-emerald-50/90 px-4 py-3 text-center"
          >
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-900">
              Composição legal dominada — A+S · 3E · D+I · FND
            </span>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};
