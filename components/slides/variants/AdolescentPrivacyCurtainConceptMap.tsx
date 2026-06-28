'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Hand, UserRound } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  adolescentCurtainLabel,
  inferAdolescentCurtain,
  type AdolescentCurtain,
} from '@/lib/slides/adolescentSlideUtils';

export interface PrivacyCurtainConcept {
  icon: string;
  title: string;
  description: string;
}

const CURTAIN_META: Record<
  AdolescentCurtain,
  {
    position: string;
    gradient: string;
    edge: string;
    tab: string;
    tabText: string;
    ring: string;
  }
> = {
  escuta: {
    position: 'left-0 top-0 h-full w-[42%]',
    gradient: 'from-sky-400/90 via-sky-300/80 to-sky-200/40',
    edge: 'border-r-4 border-sky-500/70',
    tab: 'bg-sky-500',
    tabText: 'text-white',
    ring: 'ring-sky-400/40',
  },
  sigilo: {
    position: 'right-0 top-0 h-full w-[42%]',
    gradient: 'from-indigo-400/90 via-indigo-300/80 to-indigo-200/40',
    edge: 'border-l-4 border-indigo-500/70',
    tab: 'bg-indigo-500',
    tabText: 'text-white',
    ring: 'ring-indigo-400/40',
  },
  acompanhamento: {
    position: 'bottom-0 left-0 right-0 h-[38%]',
    gradient: 'from-cyan-400/90 via-cyan-300/80 to-cyan-200/40',
    edge: 'border-t-4 border-cyan-500/70',
    tab: 'bg-cyan-600',
    tabText: 'text-white',
    ring: 'ring-cyan-400/40',
  },
  prevencao: {
    position: 'left-[12%] top-[8%] h-[36%] w-[76%]',
    gradient: 'from-teal-400/85 via-teal-300/70 to-teal-200/30',
    edge: 'border-4 border-teal-500/60',
    tab: 'bg-teal-500',
    tabText: 'text-white',
    ring: 'ring-teal-400/40',
  },
  gabarito: {
    position: 'left-[18%] top-[18%] h-[28%] w-[64%]',
    gradient: 'from-emerald-400/90 via-emerald-300/80 to-emerald-200/40',
    edge: 'border-4 border-emerald-500/70',
    tab: 'bg-emerald-500',
    tabText: 'text-white',
    ring: 'ring-emerald-400/40',
  },
  geral: {
    position: 'left-[10%] top-[10%] h-[40%] w-[80%]',
    gradient: 'from-slate-300/80 via-slate-200/60 to-slate-100/30',
    edge: 'border-4 border-slate-400/50',
    tab: 'bg-slate-500',
    tabText: 'text-white',
    ring: 'ring-slate-300/40',
  },
};

const CURTAIN_PRIORITY: AdolescentCurtain[] = ['escuta', 'sigilo', 'acompanhamento', 'prevencao'];

interface AdolescentPrivacyCurtainConceptMapProps {
  concepts: PrivacyCurtainConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

function curtainSlidesAside(curtain: AdolescentCurtain): boolean {
  return curtain === 'escuta' || curtain === 'sigilo' || curtain === 'acompanhamento';
}

export function AdolescentPrivacyCurtainConceptMap({
  concepts,
  theme,
  footerRule,
}: AdolescentPrivacyCurtainConceptMapProps) {
  const prefersReducedMotion = useReducedMotion();
  const [openCurtains, setOpenCurtains] = useState<Set<AdolescentCurtain>>(() => new Set());
  const [revealOrder, setRevealOrder] = useState<AdolescentCurtain[]>([]);

  const curtainMap = useMemo(() => {
    const map = new Map<AdolescentCurtain, PrivacyCurtainConcept>();
    for (const concept of concepts) {
      const curtain = inferAdolescentCurtain(`${concept.title} ${concept.description}`);
      if (!map.has(curtain) || curtain === 'gabarito') {
        map.set(curtain, concept);
      }
    }
    for (const concept of concepts) {
      const curtain = inferAdolescentCurtain(`${concept.title} ${concept.description}`);
      if (!map.has(curtain)) map.set(curtain, concept);
    }
    return map;
  }, [concepts]);

  const activeCurtains = useMemo(() => {
    const ordered = CURTAIN_PRIORITY.filter((c) => curtainMap.has(c));
    if (curtainMap.has('gabarito')) ordered.push('gabarito');
    const extras = [...curtainMap.keys()].filter(
      (c) => !ordered.includes(c) && c !== 'geral',
    );
    return [...ordered, ...extras];
  }, [curtainMap]);

  const toggleCurtain = useCallback(
    (curtain: AdolescentCurtain) => {
      setOpenCurtains((prev) => {
        const next = new Set(prev);
        if (next.has(curtain)) {
          if (!curtainSlidesAside(curtain)) return prev;
          const curtainIndex = activeCurtains.indexOf(curtain);
          const hasLaterOpen = activeCurtains
            .slice(curtainIndex + 1)
            .some((c) => prev.has(c));
          if (hasLaterOpen) return prev;
          next.delete(curtain);
          setRevealOrder((order) => order.filter((c) => c !== curtain));
          return next;
        }

        const nextExpected = activeCurtains.find((c) => !prev.has(c));
        if (curtain !== nextExpected) return prev;

        next.add(curtain);
        setRevealOrder((order) => [...order, curtain]);
        return next;
      });
    },
    [activeCurtains],
  );

  const focused = revealOrder[revealOrder.length - 1] ?? null;
  const focusedConcept = focused ? curtainMap.get(focused) : concepts[0];
  const revealedCount = openCurtains.size;
  const totalCurtains = activeCurtains.length;
  const nextToOpen = activeCurtains.find((c) => !openCurtains.has(c)) ?? null;

  if (concepts.length === 0) return null;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-4">
        <div
          role="status"
          className="flex flex-col items-center gap-2 rounded-xl border border-sky-200/80 bg-sky-50/90 px-4 py-3 text-center"
        >
          <p className="flex items-center justify-center gap-2 font-body text-sm font-semibold text-sky-900">
            <Hand className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
            Toque nas faixas coloridas da consulta
          </p>
          <p className="font-body text-xs leading-relaxed text-sky-800/85">
            Puxe cada cortina na ordem (Escuta → Sigilo → Prevenção…) — o pilar aparece no card abaixo.
          </p>
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-sky-600">
            {revealedCount}/{totalCurtains} pilares revelados
          </p>
        </div>

        <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-[1.75rem] border border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-cyan-50/80 shadow-xl shadow-sky-200/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-sky-200/60 bg-white/80 px-6 py-5 shadow-inner">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${theme.iconBg}`}>
                <UserRound className={`h-7 w-7 ${theme.iconText}`} aria-hidden />
              </div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-sky-800">
                Espaço do adolescente
              </p>
            </div>
          </div>

          {activeCurtains.map((curtain, index) => {
            const meta = CURTAIN_META[curtain];
            const isOpen = openCurtains.has(curtain);
            const concept = curtainMap.get(curtain);
            if (!concept) return null;

            const pullOffset =
              curtain === 'escuta'
                ? isOpen
                  ? '-translate-x-[88%]'
                  : 'translate-x-0'
                : curtain === 'sigilo'
                  ? isOpen
                    ? 'translate-x-[88%]'
                    : 'translate-x-0'
                  : curtain === 'acompanhamento'
                    ? isOpen
                      ? 'translate-y-[88%]'
                      : 'translate-y-0'
                    : isOpen
                      ? 'scale-95'
                      : 'scale-100';

            const isNextHint = !isOpen && curtain === nextToOpen;
            const isClickable = isOpen ? curtainSlidesAside(curtain) : curtain === nextToOpen;
            const shouldFadeWhenOpen = isOpen && !curtainSlidesAside(curtain);
            const stackZIndex = isOpen
              ? 12 + index
              : curtain === nextToOpen
                ? 30 + activeCurtains.length
                : 10 + index;

            return (
              <motion.button
                key={curtain}
                type="button"
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: shouldFadeWhenOpen ? 0 : 1 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.08 * index }}
                onClick={() => toggleCurtain(curtain)}
                aria-expanded={isOpen}
                aria-disabled={!isClickable}
                aria-label={
                  isOpen
                    ? `Fechar cortina ${adolescentCurtainLabel(curtain)}`
                    : `Puxar cortina ${adolescentCurtainLabel(curtain)} — ${concept.title}`
                }
                style={{ zIndex: stackZIndex }}
                className={`absolute ${meta.position} ${meta.edge} min-h-[44px] min-w-[44px] overflow-hidden bg-gradient-to-br ${meta.gradient} shadow-lg transition-transform duration-500 ease-out ${pullOffset} ${
                  isClickable ? 'cursor-pointer' : 'pointer-events-none cursor-default'
                } ${
                  isNextHint && !prefersReducedMotion
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-sky-100 animate-pulse'
                    : ''
                } ${!isOpen && isClickable ? 'hover:brightness-105' : ''}`}
              >
                <div className="flex h-full flex-col justify-between p-3">
                  <span
                    className={`self-start rounded-full px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-widest ${meta.tab} ${meta.tabText}`}
                  >
                    {adolescentCurtainLabel(curtain)}
                  </span>
                  {!isOpen ? (
                    <p className="font-body text-xs font-bold leading-snug text-slate-900/95 line-clamp-2">
                      {concept.title}
                    </p>
                  ) : null}
                  <span
                    className={`flex min-h-[36px] items-center justify-center gap-1.5 self-stretch rounded-lg px-2 py-1.5 font-mono text-[9px] font-black uppercase tracking-wide ${
                      isOpen
                        ? 'bg-white/25 text-white'
                        : 'bg-white/90 text-slate-800 shadow-sm'
                    }`}
                  >
                    {!isOpen ? <Hand className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
                    {isOpen ? 'Toque para fechar' : 'Toque para puxar'}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {revealedCount === 0 ? (
          <p className="text-center font-body text-xs font-medium text-slate-500">
            O detalhe de cada pilar aparece aqui depois que você tocar numa cortina.
          </p>
        ) : null}

        <AnimatePresence mode="wait">
          {focusedConcept && revealedCount > 0 ? (
            <motion.div
              key={focused ?? 'detail'}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
              className={`rounded-2xl border border-l-[5px] bg-white/95 p-4 shadow-md ${
                focused ? CURTAIN_META[focused].edge.replace('border-', 'border-l-') : 'border-l-sky-400'
              }`}
            >
              <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Pilar revelado — leia e toque outra cortina
              </p>
              <div className="mb-2 flex items-center gap-2">
                {(() => {
                  const Icon = resolveLucideIcon(focusedConcept.icon);
                  return <Icon className="h-5 w-5 text-sky-700" aria-hidden />;
                })()}
                <h4 className="font-body text-base font-bold text-slate-900">{focusedConcept.title}</h4>
              </div>
              <p className="font-body text-sm leading-relaxed text-slate-600">{focusedConcept.description}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {footerRule ? (
          <p className="rounded-xl border border-sky-200/70 bg-sky-50/80 px-4 py-3 text-center font-body text-sm italic text-sky-900/80">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
