'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Lightbulb, Zap } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { GoldenRuleHeroCard } from '../core/GoldenRuleHeroCard';
import { getGoldenRuleTitleSizeClass } from '@/lib/slides/goldenRuleTypography';
import { getGoldenRuleBespoke } from '../registry/goldenRule';
import {
  BoardChrome,
  CategoryStrip,
  LabelBodyRow,
  PolarityPanel,
  type BoardTone,
} from '../primitives';
import { softLensEmphasisToTone } from './GoldenRuleSoftLensBoard';

export type GoldenRuleRowEmphasis = 'default' | 'highlight' | 'alert' | 'success';
export type GoldenRuleRowBadge = 'hot' | 'warn' | 'ok' | 'info';

export interface GoldenRuleRow {
  label: string;
  value: string;
  emphasis?: GoldenRuleRowEmphasis;
  badge?: GoldenRuleRowBadge;
  sv_kind?: 'pa' | 'temp' | 'fc' | 'fr' | 'spo2' | 'meta';
  /** Dica de prova no painel soft-lens (prioridade sobre inferência do molde). */
  exam_hint?: string;
  /** Linha de fixação no painel soft-lens. */
  fixation?: string;
}

interface GoldenRuleProps {
  content?: string;
  rows?: GoldenRuleRow[];
  theme: ThemeColors;
  layoutVariant?: string;
  footerRule?: string;
}

const BADGE_TONE: Record<GoldenRuleRowBadge, BoardTone> = {
  hot: 'exception',
  warn: 'warn',
  ok: 'keep',
  info: 'command',
};

const BADGE_LABEL: Record<GoldenRuleRowBadge, string> = {
  hot: 'Alta',
  warn: 'Pegada',
  ok: 'Fixar',
  info: 'Contexto',
};

function MnemonicHighlight({ content }: { content: string }) {
  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 28) return null;

  return (
    <PolarityPanel tone="command" emphasized>
      <p className="text-center font-body text-2xl font-black tracking-wide text-sky-900 md:text-3xl">
        {trimmed}
      </p>
      <p className="mt-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-sky-700">
        Mnemônico para fixar na prova
      </p>
    </PolarityPanel>
  );
}

function ReferenceTableLayout({
  content,
  rows,
  theme,
  footerRule,
}: {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}) {
  const title = content?.trim();
  const reduceMotion = useReducedMotion();
  const showMnemonic = Boolean(title && title.length <= 28 && rows.length === 0);

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.45}
      eyebrow="Decore clínico"
      title={title && !showMnemonic ? title : undefined}
      footerRule={footerRule}
      footerLabel={footerRule ? 'FIXAÇÃO' : undefined}
      maxWidth="3xl"
    >
      {showMnemonic && title ? <MnemonicHighlight content={title} /> : null}

      {!title && !showMnemonic ? (
        <p className="text-center font-mono text-[11px] uppercase tracking-widest text-slate-500">
          Referência rápida
        </p>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {rows.map((row, index) => {
          const tone = softLensEmphasisToTone(row.emphasis);
          return (
            <motion.div
              key={`${row.label}-${index}`}
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, delay: reduceMotion ? 0 : index * 0.05 }}
            >
              <LabelBodyRow
                layout="rail"
                chip={row.label}
                body={
                  <span className="flex flex-wrap items-center gap-2">
                    <span>{row.value}</span>
                    {row.badge ? (
                      <CategoryStrip label={BADGE_LABEL[row.badge]} tone={BADGE_TONE[row.badge]} />
                    ) : null}
                  </span>
                }
                tone={tone}
                hint={row.exam_hint || row.fixation}
              />
            </motion.div>
          );
        })}
      </div>
    </BoardChrome>
  );
}

function TypographicBoard({
  theme,
  footerRule,
  children,
}: {
  theme: ThemeColors;
  footerRule?: string;
  children: ReactNode;
}) {
  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.45}
      eyebrow="Decore clínico"
      footerRule={footerRule}
      footerLabel={footerRule ? 'FIXAÇÃO' : undefined}
      maxWidth="3xl"
    >
      {children}
    </BoardChrome>
  );
}

// ============================================================================
// GOLDEN RULE: Tipografia gigante OU tabela reference_table (rows)
// layout_variant: center | compact | minimal | banner | reference_table
// Com rows → reference_table automático no player (salvo override tipográfico explícito)
// Chassis G2: BoardChrome + LabelBodyRow / PolarityPanel
// ============================================================================
export const GoldenRule = ({
  content = '',
  rows,
  theme,
  layoutVariant = 'center',
  footerRule,
}: GoldenRuleProps) => {
  const variant = layoutVariant || 'center';

  const bespoke = getGoldenRuleBespoke(variant);
  if (bespoke && (!bespoke.requiresRows || (rows && rows.length > 0))) {
    const Comp = bespoke.Component;
    return <Comp content={content} rows={rows} theme={theme} footerRule={footerRule} />;
  }

  if (variant === 'reference_table' && rows && rows.length > 0) {
    return (
      <ReferenceTableLayout content={content} rows={rows} theme={theme} footerRule={footerRule} />
    );
  }

  // CENTER (padrão) — tipografia hero + footer G2
  if (variant === 'center') {
    return (
      <TypographicBoard theme={theme} footerRule={footerRule}>
        <GoldenRuleHeroCard content={content} theme={theme} />
      </TypographicBoard>
    );
  }

  // COMPACT — ícone + texto
  if (variant === 'compact') {
    return (
      <TypographicBoard theme={theme} footerRule={footerRule}>
        <PolarityPanel tone="command">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white">
            <Lightbulb size={20} aria-hidden />
          </div>
          <p className="font-body text-base font-bold leading-relaxed break-words [overflow-wrap:anywhere] hyphens-auto text-slate-900 md:text-lg">
            {content}
          </p>
        </PolarityPanel>
      </TypographicBoard>
    );
  }

  // MINIMAL — citação com massa
  if (variant === 'minimal') {
    return (
      <TypographicBoard theme={theme} footerRule={footerRule}>
        <PolarityPanel tone="neutral">
          <p className="font-body text-base italic leading-relaxed break-words [overflow-wrap:anywhere] hyphens-auto text-slate-900 md:text-xl">
            {content}
          </p>
        </PolarityPanel>
      </TypographicBoard>
    );
  }

  // BANNER — âncora tipográfica
  if (variant === 'banner') {
    const titleSize = getGoldenRuleTitleSizeClass(content);
    return (
      <TypographicBoard theme={theme} footerRule={footerRule}>
        <PolarityPanel tone="warn" emphasized>
          <div className="mb-4 flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-600 text-white md:h-16 md:w-16">
              <Zap className="h-7 w-7 md:h-8 md:w-8" aria-hidden />
            </span>
          </div>
          <h2
            className={`font-body w-full text-center font-extrabold uppercase leading-snug tracking-tight break-words [overflow-wrap:anywhere] hyphens-auto text-amber-950 ${titleSize}`}
          >
            {content}
          </h2>
        </PolarityPanel>
      </TypographicBoard>
    );
  }

  // Fallback: center
  return (
    <TypographicBoard theme={theme} footerRule={footerRule}>
      <GoldenRuleHeroCard content={content} theme={theme} rounded="2xl" />
    </TypographicBoard>
  );
};
