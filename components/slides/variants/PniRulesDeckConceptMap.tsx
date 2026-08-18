'use client';

import { motion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import { inferIntervalChips, inferPniCategory, type PniCategory } from '@/lib/slides/pniSlideUtils';
import { BoardChrome, CriticalNumber, PolarityPanel } from '../primitives';
import { cn } from '@/lib/utils';

export interface PniRuleConcept {
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
    badgeText: 'text-teal-800',
  },
  cuidado: {
    label: 'CUIDADO',
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
    border: 'border-l-lime-400',
    badge: 'bg-slate-100/90',
    badgeText: 'text-slate-700',
  },
};

function isHeroConcept(title: string, description: string): boolean {
  const t = `${title} ${description}`.toLowerCase();
  return /pegadinha|âncora|erro reproduz|grace/.test(t);
}

function primaryChip(title: string, description: string): string | null {
  const chips = inferIntervalChips(`${title} ${description}`);
  return chips[0]?.label ?? null;
}

interface PniRulesDeckConceptMapProps {
  concepts: PniRuleConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Deck PNI Glance OS — herói + números críticos + cards com massa. */
export function PniRulesDeckConceptMap({ concepts, theme, footerRule }: PniRulesDeckConceptMapProps) {
  if (concepts.length === 0) return null;

  const heroIndex = concepts.findIndex((c) => isHeroConcept(c.title, c.description));
  const hero = heroIndex >= 0 ? concepts[heroIndex] : concepts[0];
  const rest = concepts.filter((_, i) => i !== (heroIndex >= 0 ? heroIndex : 0));

  const numberStrip = Array.from(
    new Map(
      concepts
        .flatMap((c) => inferIntervalChips(`${c.title} ${c.description}`))
        .map((chip) => [chip.label, chip] as const),
    ).values(),
  ).slice(0, 4);

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow="MAPA PNI"
      footerRule={footerRule}
      footerLabel={footerRule ? 'FIXAÇÃO' : undefined}
      maxWidth="3xl"
    >
      {numberStrip.length > 0 ? (
        <div className="flex flex-wrap items-stretch justify-center gap-2">
          {numberStrip.map((chip) => {
            const match = chip.label.match(/^(\d+)([A-Z]+)?$/i);
            return (
              <CriticalNumber
                key={chip.label}
                value={match?.[1] ?? chip.label}
                unit={match?.[2]}
                label="PNI"
                emphasis={chip.label === '4D' ? 'alert' : 'ok'}
                className="min-w-[4.5rem] px-3 py-2"
              />
            );
          })}
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
              <h3 className="mt-0.5 font-body text-lg font-bold text-slate-900 md:text-xl">
                {hero.title}
              </h3>
              <p className="mt-1.5 font-body text-sm leading-snug text-slate-700 md:text-base">
                {hero.description}
              </p>
            </div>
            {primaryChip(hero.title, hero.description) ? (
              <span className="shrink-0 rounded-lg bg-amber-500 px-2.5 py-1 font-mono text-xs font-black text-white shadow-sm">
                {primaryChip(hero.title, hero.description)}
              </span>
            ) : null}
          </div>
        </PolarityPanel>
      ) : null}

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {rest.map((concept, index) => {
          const category = inferPniCategory(`${concept.title} ${concept.description}`);
          const meta = CATEGORY_META[category];
          const Icon = resolveLucideIcon(concept.icon);
          const chip = primaryChip(concept.title, concept.description);

          return (
            <motion.div
              key={`${concept.title}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * index }}
              className={cn(
                'rounded-2xl border-2 border-slate-200/80 border-l-[5px] bg-white p-3.5 shadow-md',
                meta.border,
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      theme.iconBg,
                      theme.iconText,
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  {chip ? (
                    <span className="rounded-md bg-sky-600 px-2 py-0.5 font-mono text-[10px] font-black text-white">
                      {chip}
                    </span>
                  ) : null}
                </div>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest',
                    meta.badge,
                    meta.badgeText,
                  )}
                >
                  {meta.label}
                </span>
              </div>
              <h4 className="mt-2 font-body text-sm font-bold text-slate-900 md:text-base">
                {concept.title}
              </h4>
              <p className="mt-1 font-body text-xs leading-snug text-slate-600 md:text-sm">
                {concept.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </BoardChrome>
  );
}
