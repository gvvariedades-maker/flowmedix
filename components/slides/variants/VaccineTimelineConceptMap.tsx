'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import { BoardChrome, CriticalNumber, PolarityPanel, CategoryStrip } from '../primitives';
import { cn } from '@/lib/utils';
import { isPniCatchUpCorpus } from '@/lib/slides/pniSlideUtils';

export interface TimelineConcept {
  icon: string;
  title: string;
  description: string;
}

function inferTimelineMarker(title: string, description: string): { label: string; focus: boolean } {
  const text = `${title} ${description}`.toLowerCase();
  if (/marco da questão|âncora da prova|3\s*º?\s*m[eê]s|3\s*meses|marco 3/.test(text)) {
    return { label: '3M', focus: true };
  }
  if (/ao nascer|nascimento|neonatal/.test(text)) return { label: '0', focus: false };
  if (/2\s*meses?/.test(text)) return { label: '2M', focus: false };
  if (/4\s*meses?/.test(text)) return { label: '4M', focus: false };
  if (/5\s*meses?/.test(text)) return { label: '5M', focus: false };
  if (/6\s*meses?/.test(text)) return { label: '6M', focus: false };
  if (/12\s*meses?/.test(text)) return { label: '12M', focus: false };
  if (/bcg/.test(text)) return { label: '0', focus: false };
  if (/decisão|prova|idade ×/.test(text)) return { label: '×', focus: false };
  return { label: '•', focus: false };
}

function heroScore(title: string, description: string): number {
  const t = `${title} ${description}`.toLowerCase();
  if (/âncora da prova/.test(t)) return 100;
  if (/pegadinha/.test(t)) return 80;
  if (/marco 3|3\s*meses/.test(t) && /meningo|men c/.test(t)) return 60;
  if (/decisão da prova|idade ×/.test(t)) return 40;
  return 0;
}

interface VaccineTimelineConceptMapProps {
  concepts: TimelineConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Timeline PNI Glance OS — herói + CriticalNumber + cards abertos (0 taps). */
export const VaccineTimelineConceptMap = ({
  concepts,
  theme,
  footerRule,
}: VaccineTimelineConceptMapProps) => {
  const reduceMotion = useReducedMotion();

  if (concepts.length === 0) return null;

  const scored = concepts.map((c, i) => ({ c, i, score: heroScore(c.title, c.description) }));
  scored.sort((a, b) => b.score - a.score);
  const hero =
    scored[0] && scored[0].score > 0
      ? scored[0].c
      : concepts.find((c) => inferTimelineMarker(c.title, c.description).focus) ?? concepts[0];
  const rest = concepts.filter((c) => c !== hero);

  const catchUpMode = isPniCatchUpCorpus(
    concepts.map((c) => `${c.title} ${c.description}`).join(' ') + (footerRule ?? ''),
  );

  const monthStrip = catchUpMode ? [] : ['0', '2M', '3M', '4M', '6M'];

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow="MAPA — TRILHO PNI"
      footerRule={footerRule}
      footerLabel={footerRule ? 'FIXAÇÃO' : undefined}
      maxWidth="3xl"
    >
      {monthStrip.length > 0 ? (
        <div className="flex flex-wrap items-stretch justify-center gap-2">
          {monthStrip.map((label) => {
            const num = label.replace(/M$/, '');
            const hot = label === '3M' || label === '3';
            return (
              <CriticalNumber
                key={label}
                value={num}
                unit={label.endsWith('M') ? 'M' : undefined}
                label="PNI"
                emphasis={hot ? 'alert' : 'ok'}
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
            <span className="shrink-0 rounded-lg bg-amber-500 px-2.5 py-1 font-mono text-xs font-black text-white shadow-sm">
              {catchUpMode ? 'CATCH' : inferTimelineMarker(hero.title, hero.description).label}
            </span>
          </div>
        </PolarityPanel>
      ) : null}

      <div className="relative flex flex-col gap-0">
        {rest.map((concept, index) => {
          const Icon = resolveLucideIcon(concept.icon);
          const marker = inferTimelineMarker(concept.title, concept.description);
          const isLast = index === rest.length - 1;

          return (
            <div key={`${concept.title}-${index}`} className="flex gap-3 md:gap-4">
              <div className="flex w-10 shrink-0 flex-col items-center">
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full font-mono text-[10px] font-black tabular-nums',
                    marker.focus
                      ? 'bg-lime-200/90 text-lime-900 ring-2 ring-lime-400/50'
                      : `${theme.iconBg} ${theme.iconText}`,
                  )}
                >
                  {marker.label}
                </span>
                {!isLast ? (
                  <div className="my-1 min-h-[1rem] w-0.5 flex-1 rounded-full bg-lime-300/60" aria-hidden />
                ) : null}
              </div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.04 * index }}
                className={cn(
                  'mb-3 min-w-0 flex-1 overflow-hidden rounded-[1.25rem] border border-l-[3px] p-4 shadow-sm',
                  marker.focus
                    ? 'border-lime-400/80 bg-gradient-to-br from-white via-lime-50/50 to-lime-50/80 ring-2 ring-lime-400/20'
                    : 'border-slate-200/70 border-l-lime-300/70 bg-white/90',
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      theme.iconBg,
                      theme.iconText,
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={cn(
                          'font-display text-xs font-extrabold uppercase tracking-wide',
                          theme.textPrimary,
                        )}
                      >
                        {concept.title}
                      </h4>
                      {marker.focus ? (
                        <CategoryStrip label="foco" tone="lime" />
                      ) : null}
                    </div>
                    <p className={cn('mt-1.5 font-body text-sm leading-snug', theme.textSecondary)}>
                      {concept.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </BoardChrome>
  );
};
