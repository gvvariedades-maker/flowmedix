'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, X, AlertTriangle } from 'lucide-react';
import { getCompareBackFaceLabel } from '@/lib/slides/goldenRuleTypography';
import { inferSvIconName, inferSvShortLabel } from '@/lib/slides/vitalsSlideUtils';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';
import { BoardChrome, CategoryStrip, PolarityPanel, boardTone } from '../primitives';

interface DangerZoneVitalsClassifyArenaProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
}

function isTransferItem(label: string, correct: string): boolean {
  return /similares|transfer[eê]ncia|outra banca|\bmcq\b/i.test(`${label} ${correct}`);
}

function parseLetter(label: string): string | undefined {
  const m = label.match(/letra\s+([A-E])/i);
  return m?.[1]?.toUpperCase();
}

/** EXCETO/INCORRETA: distrator = conduta certa (eliminar); gabarito = única falha. */
function isExcetoGabaritoItem(label: string, correct: string): boolean {
  return /\bINCORRETA\b|aspecto incorreto|exce[cç][aã]o da prova|única (alternativa )?falsa/i.test(
    `${label} ${correct}`,
  );
}

function isExcetoKeepDistractor(label: string, detail: string, correct: string): boolean {
  if (isExcetoGabaritoItem(label, correct)) return false;
  return /afirmativa correta|conduta correta|conceito (basal )?correto|verdadeiro para|s[ií]tio cl[aá]ssico/i.test(
    `${detail} ${correct}`,
  );
}

/**
 * Arena SV Glance OS — tickets coloridos ✗×✓ (0 taps).
 * EXCETO: distratores = “conduta certa → eliminar”; gabarito = falha semântica.
 */
export function DangerZoneVitalsClassifyArena({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneVitalsClassifyArenaProps) {
  const reduceMotion = useReducedMotion();
  const trapTone = boardTone('barrier');
  const keepTone = boardTone('keep');

  const rows = useMemo(
    () =>
      items.map((item, index) => {
        const label = item.label || item.title || `Pegadinha ${index + 1}`;
        const trapText = item.detail || item.description || '';
        const correctText = typeof item.correct === 'string' ? item.correct.trim() : '';
        const iconSource = `${label} ${trapText} ${correctText}`;
        const excetoGabarito = isExcetoGabaritoItem(label, correctText);
        const excetoDistractor = isExcetoKeepDistractor(label, trapText, correctText);
        return {
          label,
          trapText,
          correctText,
          letter: parseLetter(label),
          svLabel: inferSvShortLabel(iconSource),
          iconName: inferSvIconName(iconSource),
          transfer: isTransferItem(label, correctText),
          correctLabel: getCompareBackFaceLabel(label, correctText),
          excetoGabarito,
          excetoDistractor,
          index,
        };
      }),
    [items],
  );

  if (items.length === 0) return null;

  const hasExcetoMode = rows.some((r) => r.excetoDistractor || r.excetoGabarito);
  const arenaBlob = `${content} ${items.map((i) => `${i.label ?? ''} ${i.detail ?? ''} ${i.correct ?? ''}`).join(' ')}`;
  const isGlasgowArena = /glasgow|escore|abertura ocular|coma de glasgow|\bECG\b/i.test(arenaBlob);
  const chips = isGlasgowArena
    ? (['Ocular', 'Verbal', 'Motor', 'Total'] as const)
    : (['PA', 'FC', 'FR', 'Temp'] as const);

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.55}
      eyebrow={
        hasExcetoMode
          ? 'Arena EXCETO / INCORRETA'
          : isGlasgowArena
            ? 'Arena Glasgow'
            : 'Arena de pegadinhas'
      }
      title={content || '✗ Banca × ✓ Conduta'}
      titleClassName="text-sm md:text-base"
      footerRule={footerRule}
      footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="lg"
    >
      <div className="flex flex-wrap justify-center gap-1.5" aria-hidden>
        {chips.map((chip, i) => (
          <CategoryStrip
            key={chip}
            label={chip}
            tone={i % 2 === 0 ? 'barrier' : 'warn'}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((row, index) => {
          if (row.transfer) {
            return (
              <motion.div
                key={index}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
              >
                <PolarityPanel tone="transfer" emphasized>
                  <div className="mb-2 flex items-center gap-2">
                    <CategoryStrip label="Prova" tone="transfer" />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-amber-800">
                      Transferência
                    </span>
                  </div>
                  <p className="font-display text-sm font-extrabold uppercase tracking-wide text-amber-950 md:text-base">
                    {row.label}
                  </p>
                  <p className="mt-2 font-body text-sm font-semibold leading-relaxed text-amber-950/90">
                    {row.correctText || row.trapText}
                  </p>
                </PolarityPanel>
              </motion.div>
            );
          }

          if (row.excetoDistractor) {
            return (
              <motion.div
                key={index}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
                className="overflow-hidden rounded-2xl border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-md shadow-emerald-500/10"
              >
                <div className="flex items-center gap-2 border-b border-emerald-200/80 bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white shadow-sm">
                    <SlideLucideIcon name={row.iconName} className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-100">
                      {row.svLabel}
                      {row.letter ? ` · Letra ${row.letter}` : ''}
                    </p>
                    <p className="truncate font-display text-xs font-black uppercase tracking-wide text-white md:text-sm">
                      {row.label}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/95 px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-widest text-emerald-900 shadow-sm">
                    Distrator
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                  <div className={`border-b border-emerald-200/60 p-3.5 md:border-b-0 md:border-r ${keepTone.bg}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${keepTone.badge} text-white shadow`}>
                        <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                      </span>
                      <p className={`font-mono text-[9px] font-bold uppercase tracking-widest ${keepTone.columnLabel}`}>
                        Conduta certa — eliminar
                      </p>
                    </div>
                    <p className={`font-body text-sm font-bold leading-relaxed ${keepTone.text}`}>
                      {row.correctText || '—'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3.5">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-500 text-white shadow">
                        <X className="h-4 w-4" strokeWidth={3} aria-hidden />
                      </span>
                      <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">
                        Por que a banca coloca
                      </p>
                    </div>
                    <p className="font-body text-sm font-semibold leading-relaxed text-slate-800">
                      {row.trapText}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          }

          const ticketBadge = row.excetoGabarito ? 'Gabarito' : `Erro #${index + 1}`;
          const leftTitle = row.excetoGabarito ? 'Como a banca engana' : 'Como a banca monta';
          const headerGrad = row.excetoGabarito
            ? 'from-rose-700 to-rose-600'
            : 'from-rose-500 to-rose-600';
          const warnTone = boardTone('warn');

          return (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
              className={`overflow-hidden rounded-2xl border-2 shadow-md ${
                row.excetoGabarito
                  ? 'border-rose-400/90 bg-gradient-to-br from-rose-50 via-white to-amber-50 shadow-rose-500/15'
                  : 'border-rose-300/80 bg-gradient-to-br from-rose-50 via-white to-emerald-50 shadow-rose-500/10'
              }`}
            >
              <div className={`flex items-center gap-2 border-b border-rose-200/80 bg-gradient-to-r ${headerGrad} px-3.5 py-2.5`}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white shadow-sm">
                  {row.excetoGabarito ? (
                    <AlertTriangle className="h-4.5 w-4.5 text-white" aria-hidden />
                  ) : (
                    <SlideLucideIcon name={row.iconName} className="h-4.5 w-4.5 text-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-rose-100">
                    {row.svLabel}
                    {row.letter ? ` · Letra ${row.letter}` : ''}
                  </p>
                  <p className="truncate font-display text-xs font-black uppercase tracking-wide text-white md:text-sm">
                    {row.label}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-300 px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-widest text-amber-950 shadow-sm">
                  {ticketBadge}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                <div className={`border-b border-rose-200/60 p-3.5 md:border-b-0 md:border-r ${trapTone.bg}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${trapTone.badge} text-white shadow`}>
                      <X className="h-4 w-4" strokeWidth={3} aria-hidden />
                    </span>
                    <p className={`font-mono text-[9px] font-bold uppercase tracking-widest ${trapTone.columnLabel}`}>
                      {leftTitle}
                    </p>
                  </div>
                  <p className={`break-words font-body text-sm font-semibold leading-relaxed ${trapTone.text}`}>
                    {row.trapText}
                  </p>
                </div>

                {row.excetoGabarito ? (
                  <div className={`p-3.5 ${warnTone.bg}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${warnTone.badge} text-white shadow`}>
                        <AlertTriangle className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                      </span>
                      <p className={`font-mono text-[9px] font-bold uppercase tracking-widest ${warnTone.columnLabel}`}>
                        Por que é a INCORRETA
                      </p>
                    </div>
                    <p className={`break-words font-body text-sm font-bold leading-relaxed ${warnTone.text}`}>
                      {row.correctText || '—'}
                    </p>
                  </div>
                ) : (
                  <div className={`p-3.5 ${keepTone.bg}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${keepTone.badge} text-white shadow`}>
                        <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                      </span>
                      <p className={`font-mono text-[9px] font-bold uppercase tracking-widest ${keepTone.columnLabel}`}>
                        {row.correctLabel}
                      </p>
                    </div>
                    <p className={`break-words font-body text-sm font-bold leading-relaxed ${keepTone.text}`}>
                      {row.correctText || '—'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </BoardChrome>
  );
}
