'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { BoardChrome } from '../primitives';
import {
  AdverbTypeIcon,
  IconAdverbRadiateMarks,
  resolveAdverbTypeKey,
  type AdverbTypeKey,
} from '../icons/pt-adverb';

export interface PtClassesAdverbConcept {
  icon: string;
  title: string;
  description: string;
  correct?: string;
}

interface ConceptMapPtClassesAdverbTypesGridProps {
  concepts: PtClassesAdverbConcept[];
  theme: ThemeColors;
  footerRule?: string;
  chipLabel?: string;
  slideTitle?: string;
}

type SectionSkin = {
  typeKey: AdverbTypeKey;
  /** Cor sólida da faixa (inline — evita falha de JIT/override). */
  railColor: string;
  railText: string;
  body: string;
  ring: string;
  bodyIconWrap: string;
  bodyIconFg: string;
  railIconFg: string;
  accent: string;
  chip: string;
};

/** Skins — railColor em hex para destaque garantido (esp. MODO). */
const SKINS: Record<AdverbTypeKey, SectionSkin> = {
  modo: {
    typeKey: 'modo',
    railColor: '#1d4ed8', // blue-700 — destaque forte (não branco)
    railText: 'text-white',
    body: 'bg-sky-50',
    ring: 'ring-blue-200',
    bodyIconWrap: 'bg-white ring-2 ring-blue-700',
    bodyIconFg: 'text-blue-700',
    railIconFg: 'text-white',
    accent: 'text-blue-800',
    chip: 'bg-white/20 text-white',
  },
  tempo: {
    typeKey: 'tempo',
    railColor: '#fbbf24', // amber-400
    railText: 'text-amber-950',
    body: 'bg-amber-50',
    ring: 'ring-amber-200',
    bodyIconWrap: 'bg-white ring-2 ring-orange-500',
    bodyIconFg: 'text-orange-600',
    railIconFg: 'text-amber-950',
    accent: 'text-orange-700',
    chip: 'bg-amber-950/15 text-amber-950',
  },
  lugar: {
    typeKey: 'lugar',
    railColor: '#047857', // emerald-700
    railText: 'text-white',
    body: 'bg-emerald-50',
    ring: 'ring-emerald-200',
    bodyIconWrap: 'bg-white ring-2 ring-emerald-700',
    bodyIconFg: 'text-emerald-700',
    railIconFg: 'text-white',
    accent: 'text-emerald-800',
    chip: 'bg-white/20 text-white',
  },
  intensidade: {
    typeKey: 'intensidade',
    railColor: '#f97316', // orange-500
    railText: 'text-white',
    body: 'bg-orange-50',
    ring: 'ring-orange-200',
    bodyIconWrap: 'bg-white ring-2 ring-orange-600',
    bodyIconFg: 'text-orange-700',
    railIconFg: 'text-white',
    accent: 'text-orange-800',
    chip: 'bg-white/20 text-white',
  },
  afirmacao: {
    typeKey: 'afirmacao',
    railColor: '#0f766e',
    railText: 'text-white',
    body: 'bg-teal-50',
    ring: 'ring-teal-200',
    bodyIconWrap: 'bg-white ring-2 ring-teal-700',
    bodyIconFg: 'text-teal-800',
    railIconFg: 'text-white',
    accent: 'text-teal-900',
    chip: 'bg-white/20 text-white',
  },
  negacao: {
    typeKey: 'negacao',
    railColor: '#e11d48',
    railText: 'text-white',
    body: 'bg-rose-50',
    ring: 'ring-rose-200',
    bodyIconWrap: 'bg-white ring-2 ring-rose-600',
    bodyIconFg: 'text-rose-700',
    railIconFg: 'text-white',
    accent: 'text-rose-800',
    chip: 'bg-white/20 text-white',
  },
  duvida: {
    typeKey: 'duvida',
    railColor: '#6d28d9',
    railText: 'text-white',
    body: 'bg-violet-50',
    ring: 'ring-violet-200',
    bodyIconWrap: 'bg-white ring-2 ring-violet-700',
    bodyIconFg: 'text-violet-800',
    railIconFg: 'text-white',
    accent: 'text-violet-900',
    chip: 'bg-white/20 text-white',
  },
  generic: {
    typeKey: 'generic',
    railColor: '#1e293b',
    railText: 'text-white',
    body: 'bg-slate-50',
    ring: 'ring-slate-200',
    bodyIconWrap: 'bg-white ring-2 ring-slate-800',
    bodyIconFg: 'text-slate-800',
    railIconFg: 'text-white',
    accent: 'text-slate-800',
    chip: 'bg-white/20 text-white',
  },
};

const SECTION_TITLES: Record<AdverbTypeKey, string> = {
  modo: 'MODO',
  tempo: 'TEMPO',
  lugar: 'LUGAR',
  intensidade: 'INTENSIDADE',
  afirmacao: 'AFIRMAÇÃO',
  negacao: 'NEGAÇÃO',
  duvida: 'DÚVIDA',
  generic: 'CLASSE',
};

function splitTips(raw?: string): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/\s*[·|/]\s*/)
    .map((t) => t.replace(/^[−–-]+/, '−').trim())
    .filter(Boolean)
    .slice(0, 2);
}

/** Quebra título longo da faixa (evita clip horizontal/vertical de INTENSIDADE). */
function railTitleLines(title: string): string[] {
  const t = title.trim().toUpperCase();
  if (t.length <= 8) return [t];
  if (t === 'INTENSIDADE') return ['INTENSI', 'DADE'];
  if (t === 'AFIRMAÇÃO' || t === 'AFIRMACAO') return ['AFIRMA', 'ÇÃO'];
  const mid = Math.ceil(t.length / 2);
  return [t.slice(0, mid), t.slice(mid)];
}

function splitBody(description: string): { rule: string; example: string } {
  const parts = description
    .split(/\s*·\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return { rule: parts[0]!, example: parts.slice(1).join(' · ') };
  }
  return { rule: description, example: '' };
}

function renderRich(text: string, accent: string): ReactNode {
  const parts = text.split(/(«[^»]+»|\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith('«') && part.endsWith('»')) {
      return (
        <strong
          key={i}
          className={`font-black underline decoration-2 underline-offset-[3px] ${accent}`}
        >
          {part.slice(1, -1)}
        </strong>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className={`font-black ${accent}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/**
 * Slide 1 — ADVÉRBIO (gesto faixas INDICATIVO, layout flex estável).
 * Protocolo: label=faixa · correct=chips · detail=`regra · exemplo «peça»`
 */
export function ConceptMapPtClassesAdverbTypesGrid({
  concepts,
  theme,
  footerRule,
  chipLabel,
  slideTitle,
}: ConceptMapPtClassesAdverbTypesGridProps) {
  const reduceMotion = useReducedMotion();

  const sections = useMemo(
    () =>
      concepts.map((c) => {
        // Prioriza o label da faixa (não as chips do correct)
        const typeKey = resolveAdverbTypeKey(c.title || c.icon, c.icon);
        const skin = SKINS[typeKey] ?? SKINS.generic;
        const { rule, example } = splitBody(c.description);
        const title = (c.title.trim() || SECTION_TITLES[typeKey]).toUpperCase();
        return {
          title,
          titleLines: railTitleLines(title),
          tips: splitTips(c.correct),
          rule,
          example,
          typeKey,
          skin,
        };
      }),
    [concepts],
  );

  if (sections.length === 0) return null;

  const heading = (slideTitle && !/n[aã]o\s*erre/i.test(slideTitle)
    ? slideTitle
    : 'ADVÉRBIO'
  ).toUpperCase();
  const pill = (chipLabel?.trim() || 'INDICA CIRCUNSTÂNCIA').toUpperCase();

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.12}
      footerRule={footerRule}
      footerLabel={footerRule ? 'FIXAÇÃO' : undefined}
      maxWidth="2xl"
      className="gap-3"
    >
      {/* Header */}
      <header className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <IconAdverbRadiateMarks className="h-4 w-4 shrink-0 scale-x-[-1] text-sky-800" />
          <h2 className="relative font-display text-xl font-black uppercase tracking-wide text-sky-900 md:text-2xl">
            <span
              className="absolute inset-x-0 bottom-0.5 h-2 rounded-sm bg-amber-300/70"
              aria-hidden
            />
            <span className="relative px-1">{heading}</span>
          </h2>
          <IconAdverbRadiateMarks className="h-4 w-4 shrink-0 text-sky-800" />
        </div>
        <span className="inline-flex rounded-full bg-rose-600 px-3.5 py-1 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-sm">
          {pill}
        </span>
      </header>

      {/* Fileiras — flex row (nunca empilha faixa/corpo) */}
      <div className="flex flex-col gap-2">
        {sections.map((sec, index) => (
          <motion.article
            key={`adv-rail-${sec.title}-${index}`}
            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.16) }}
            className={`flex min-h-[4.75rem] overflow-hidden rounded-2xl bg-white shadow-[0_3px_12px_rgba(15,23,42,0.07)] ring-1 ${sec.skin.ring}`}
          >
            {/* FAIXA — cor inline (destaque garantido, esp. card MODO) */}
            <aside
              className={`flex w-[7.25rem] min-w-[7.25rem] shrink-0 flex-col md:w-32 ${sec.skin.railText}`}
              style={{ backgroundColor: sec.skin.railColor }}
            >
              <div className="shrink-0 border-b border-black/10 px-1.5 py-2 text-center">
                <p
                  className={`font-display font-black uppercase leading-[1.15] tracking-tight ${
                    sec.titleLines.length > 1 || sec.title.length > 8
                      ? 'text-[10px] md:text-[11px]'
                      : 'text-[11px] tracking-wide md:text-xs'
                  }`}
                >
                  {sec.titleLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center gap-1 px-1 py-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/25 ring-2 ring-white/40">
                  <AdverbTypeIcon
                    typeKey={sec.typeKey}
                    className={`h-4 w-4 ${sec.skin.railIconFg}`}
                  />
                </span>
                {sec.tips.map((tip) => (
                  <span
                    key={tip}
                    className={`max-w-full truncate rounded px-1 py-0.5 font-mono text-[9px] font-black uppercase leading-none tracking-wide ${sec.skin.chip}`}
                  >
                    {tip}
                  </span>
                ))}
              </div>
            </aside>

            {/* CORPO — cresce; alinhamento à esquerda (não centralizado) */}
            <div
              className={`flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 md:gap-3.5 md:px-4 ${sec.skin.body}`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm ${sec.skin.bodyIconWrap}`}
              >
                <AdverbTypeIcon
                  typeKey={sec.typeKey}
                  className={`h-[18px] w-[18px] ${sec.skin.bodyIconFg}`}
                />
              </span>
              <div className="min-w-0 flex-1 text-left">
                <p
                  className={`font-display text-[11px] font-black uppercase leading-snug tracking-wide md:text-xs ${sec.skin.accent}`}
                >
                  {renderRich(sec.rule, sec.skin.accent)}
                </p>
                {sec.example ? (
                  <p className="mt-1 font-body text-[12px] font-semibold leading-snug text-slate-800 md:text-[13px]">
                    {renderRich(sec.example, sec.skin.accent)}
                  </p>
                ) : null}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </BoardChrome>
  );
}
