'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Syringe } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import { BoardChrome, CategoryStrip, PolarityPanel } from '../primitives';
import { cn } from '@/lib/utils';

export interface PniViaConcept {
  icon: string;
  title: string;
  description: string;
}

function detectRouteHero(corpus: string): string {
  if (/subcut/i.test(corpus)) return 'SUBCUTÂNEA';
  if (/intrad/i.test(corpus)) return 'INTRADÉRMICA';
  if (/intramusc|\bim\b/i.test(corpus)) return 'INTRAMUSCULAR';
  if (/oral|gotas/i.test(corpus)) return 'ORAL';
  return 'VIA PNI';
}

function isAnchorItem(title: string, description: string): boolean {
  return /âncora|comando|prova|banca cobra/i.test(`${title} ${description}`);
}

function isTrapItem(title: string, description: string): boolean {
  const blob = `${title} ${description}`;
  // Preferir rótulo explícito — "nunca" sozinho (ex.: nunca EV) não é pegadinha
  if (/pegadinha|armadilha|erro cl[aá]ssico/i.test(blob)) return true;
  if (/^\s*pegadinha/i.test(title)) return true;
  return /\bim\b|intramusc/i.test(title) && /pegadinha|erro|n[aã]o|≠/i.test(blob);
}

interface PniViaRouteConceptMapProps {
  concepts: PniViaConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Hub via/técnica PNI — outdoor da via + âncora + pegadinha (Glance OS, 0 taps). */
export function PniViaRouteConceptMap({ concepts, theme, footerRule }: PniViaRouteConceptMapProps) {
  const reduceMotion = useReducedMotion();
  const corpus = useMemo(
    () => concepts.map((c) => `${c.title} ${c.description}`).join(' ') + (footerRule ?? ''),
    [concepts, footerRule],
  );
  const routeHero = detectRouteHero(corpus);

  const { anchor, trap, rest } = useMemo(() => {
    const a = concepts.find((c) => isAnchorItem(c.title, c.description));
    const explicitTrap = concepts.find(
      (c) => c !== a && /pegadinha|armadilha/i.test(`${c.title} ${c.description}`),
    );
    const t =
      explicitTrap ??
      concepts.find((c) => c !== a && isTrapItem(c.title, c.description));
    return {
      anchor: a ?? concepts[0],
      trap: t,
      rest: concepts.filter((c) => c !== a && c !== t),
    };
  }, [concepts]);

  if (concepts.length === 0) return null;

  const anchorBody =
    anchor && /âncora|comando/i.test(anchor.title) ? anchor.description : undefined;
  const trapBody = trap?.description;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.4}
      eyebrow="MAPA — VIA / TÉCNICA PNI"
      footerRule={footerRule}
      footerLabel={footerRule ? 'FIXAÇÃO' : undefined}
      maxWidth="3xl"
      className="gap-3"
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span
          className={cn(
            'rounded-2xl bg-lime-100 px-4 py-2 font-display text-2xl font-black tracking-tight text-lime-900',
            'ring-2 ring-lime-500/50 shadow-sm md:text-3xl',
          )}
        >
          {routeHero}
        </span>
        <CategoryStrip label="Decore a via por vacina" tone="command" />
      </div>

      {anchor ? (
        <PolarityPanel tone="command" emphasized>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                theme.iconBg,
                theme.iconText,
              )}
            >
              <Syringe className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-lime-900">
                Âncora da prova
              </p>
              {anchorBody ? (
                <p className="mt-1 font-body text-base font-bold leading-snug text-slate-900 md:text-lg">
                  {anchorBody}
                </p>
              ) : (
                <>
                  <h3 className="mt-0.5 font-body text-lg font-bold text-slate-900 md:text-xl">
                    {anchor.title}
                  </h3>
                  <p className="mt-1.5 font-body text-sm leading-snug text-slate-700 md:text-base">
                    {anchor.description}
                  </p>
                </>
              )}
            </div>
          </div>
        </PolarityPanel>
      ) : null}

      {trap ? (
        <PolarityPanel tone="exception" emphasized>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <CategoryStrip label="Pegadinha clássica" tone="exception" className="mb-1 self-start" />
              <p className="font-body text-base font-bold leading-snug text-slate-900">{trap.title}</p>
              {trapBody ? (
                <p className="mt-1 font-body text-sm leading-snug text-rose-950 md:text-[15px]">
                  {trapBody}
                </p>
              ) : null}
            </div>
          </div>
        </PolarityPanel>
      ) : null}

      {rest.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {rest.map((concept, index) => {
            const Icon = resolveLucideIcon(concept.icon);
            return (
              <motion.div
                key={`${concept.title}-${index}`}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
                className="overflow-hidden rounded-2xl border border-l-[4px] border-l-lime-500 bg-white/95 p-4 shadow-sm"
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-lime-100 text-lime-900">
                  <Icon size={18} aria-hidden />
                </div>
                <p className="font-display text-sm font-bold text-slate-900">{concept.title}</p>
                <p className="mt-1.5 font-body text-sm leading-snug text-slate-700">
                  {concept.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      ) : null}
    </BoardChrome>
  );
}
