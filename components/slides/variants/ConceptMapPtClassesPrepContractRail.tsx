'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { BoardChrome } from '../primitives';

export interface PtClassesPrepConcept {
  icon: string;
  title: string;
  description: string;
  correct?: string;
}

interface ConceptMapPtClassesPrepContractRailProps {
  concepts: PtClassesPrepConcept[];
  theme: ThemeColors;
  footerRule?: string;
  chipLabel?: string;
  slideTitle?: string;
}

type PillSkin = {
  bg: string;
  shadow: string;
};

/** Paleta do print — laranja · roxo · ouro · azul. */
const PILLS: PillSkin[] = [
  { bg: 'bg-[#eb6b2c]', shadow: 'shadow-[0_4px_10px_rgba(235,107,44,0.35)]' },
  { bg: 'bg-[#6d68b3]', shadow: 'shadow-[0_4px_10px_rgba(109,104,179,0.35)]' },
  { bg: 'bg-[#f5a623]', shadow: 'shadow-[0_4px_10px_rgba(245,166,35,0.35)]' },
  { bg: 'bg-[#4a90e2]', shadow: 'shadow-[0_4px_10px_rgba(74,144,226,0.35)]' },
];

const RESULT_GREEN = 'text-[#3b945e]';
const RESULT_BLUE = 'text-[#2563eb]';
const RESULT_ROSE = 'text-[#e11d48]';
const PILL_DARK = 'bg-[#28814d]';

function parseResult(description: string): { lead: string; highlight: string } {
  const parts = description
    .split(/\s*[·|]\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return { lead: parts[0]!, highlight: parts.slice(1).join(' ') };
  }
  return { lead: '', highlight: description.trim() };
}

/** ARTIGO = verde · PREPOSIÇÃO/LOCUÇÃO = azul · contraste/erro = rose. */
function highlightClass(highlight: string): string {
  const h = highlight.toLowerCase();
  if (/preposi|locu[cç]/.test(h)) return RESULT_BLUE;
  if (/conjun|erro|n[aã]o\b|pegadinha/.test(h)) return RESULT_ROSE;
  if (/artigo|complemento/.test(h)) return RESULT_GREEN;
  return RESULT_GREEN;
}

function renderMarked(text: string, className: string): ReactNode {
  const bits = text.split(/(«[^»]+»)/g);
  if (bits.length === 1) return text;
  return bits.map((part, i) =>
    part.startsWith('«') && part.endsWith('»') ? (
      <span key={i} className={`underline decoration-2 underline-offset-2 ${className}`}>
        {part.slice(1, -1)}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function IconContractArrow({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M5 12h12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Slide 1 — PREPOSIÇÃO (gesto contrato: pílula → seta → resultado + faixa regra).
 * 0 cliques — tudo visível.
 * Inspiração: print conjugações homônimas (PULAR→EU PULO) traduzido para DE+O→DO / A→ARTIGO|PREP.
 * Protocolo:
 *   items[].label = pílula · detail = `lead · DESTAQUE` (ou só destaque)
 *   items[].correct = nota opcional sob o resultado
 *   chip_label = linha 1 da faixa · slide_title = linha 2 (verde)
 *   footer_rule = pílula escura da faixa (+ FIXAÇÃO)
 * SVGs: diagrams/prep-contract-arrow.svg
 */
export function ConceptMapPtClassesPrepContractRail({
  concepts,
  theme,
  footerRule,
  chipLabel,
  slideTitle,
}: ConceptMapPtClassesPrepContractRailProps) {
  const reduceMotion = useReducedMotion();

  const rows = useMemo(
    () =>
      concepts.map((c, i) => {
        const { lead, highlight } = parseResult(c.description);
        const hi = highlight.toUpperCase();
        return {
          pill: c.title.trim().toUpperCase(),
          lead: lead.toUpperCase(),
          highlight: hi,
          hiClass: highlightClass(hi),
          note: c.correct?.trim() ?? '',
          skin: PILLS[i % PILLS.length]!,
        };
      }),
    [concepts],
  );

  if (rows.length === 0) return null;

  /** footer `A · B · C` → faixa; senão chip/title/footer. */
  const footerParts = (footerRule ?? '')
    .split(/\s*[·|]\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  const bannerLine1 = (
    footerParts.length >= 3 ? footerParts[0]! : chipLabel?.trim() || 'ESTAS FORMAS TÊM'
  ).toUpperCase();
  const bannerLine2 = (
    footerParts.length >= 3 ? footerParts[1]! : slideTitle?.trim() || 'FUNÇÕES DIFERENTES'
  ).toUpperCase();
  const bannerPill = (
    footerParts.length >= 3
      ? footerParts.slice(2).join(' · ')
      : footerRule?.trim() || 'ARTIGO OU PREPOSIÇÃO — O QUE FAZ NA ORAÇÃO?'
  ).toUpperCase();

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.14}
      footerRule={footerRule}
      footerLabel={footerRule ? 'FIXAÇÃO' : undefined}
      maxWidth="2xl"
      className="gap-3.5"
    >
      {/* Fileiras pílula → seta → resultado */}
      <div className="flex flex-col gap-2.5">
        {rows.map((row, index) => (
          <motion.div
            key={`prep-row-${index}`}
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.2) }}
            className="grid grid-cols-[minmax(6.5rem,9rem)_1.75rem_minmax(0,1fr)] items-center gap-2 md:grid-cols-[minmax(7.5rem,10.5rem)_2rem_minmax(0,1fr)] md:gap-2.5"
          >
            <div
              className={`flex min-h-[3.25rem] items-center justify-center rounded-2xl px-2.5 py-2 ${row.skin.bg} ${row.skin.shadow}`}
            >
              <p className="text-center font-display text-[11px] font-black uppercase leading-tight tracking-wide text-white md:text-xs">
                {row.pill}
              </p>
            </div>

            <IconContractArrow className="mx-auto h-5 w-5 text-[#eb6b2c] md:h-6 md:w-6" />

            <div className="flex min-h-[3.25rem] flex-col justify-center rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-[0_4px_12px_rgba(15,23,42,0.08)] md:px-4">
              <p className="font-display text-sm font-black uppercase leading-tight tracking-wide md:text-base">
                {row.lead ? (
                  <>
                    <span className="text-slate-900">{renderMarked(row.lead, 'text-slate-900')}</span>
                    <span className="mx-1.5 text-slate-400">·</span>
                  </>
                ) : null}
                <span className={row.hiClass}>{renderMarked(row.highlight, row.hiClass)}</span>
              </p>
              {row.note ? (
                <p className="mt-0.5 font-body text-[11px] font-medium leading-snug text-slate-500 md:text-xs">
                  {row.note}
                </p>
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Faixa de regra — 3 camadas (print: lead · destaque · pílula) */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.18 }}
        className="rounded-2xl px-4 py-4 text-center shadow-[0_4px_14px_rgba(40,129,77,0.14)] md:px-6 md:py-5"
        style={{ background: 'linear-gradient(180deg, #f3faf5 0%, #d9f0e2 55%, #c6e8d4 100%)' }}
      >
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.08em] text-slate-800 md:text-xs">
          {bannerLine1}
        </p>
        <p
          className={`mt-1.5 font-display text-xl font-black uppercase leading-none tracking-wide md:text-2xl ${RESULT_GREEN}`}
        >
          {bannerLine2}
        </p>
        <div
          className={`mx-auto mt-3.5 inline-flex max-w-full rounded-full px-4 py-2 ${PILL_DARK} shadow-md`}
        >
          <p className="text-center font-display text-[10px] font-black uppercase leading-snug tracking-wide text-white md:text-[11px]">
            {bannerPill}
          </p>
        </div>
      </motion.div>
    </BoardChrome>
  );
}
