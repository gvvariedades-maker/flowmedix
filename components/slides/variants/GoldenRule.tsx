'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, Lightbulb, Zap, Table2 } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { GoldenRuleHeroCard } from '../core/GoldenRuleHeroCard';
import { getGoldenRuleTitleSizeClass } from '@/lib/slides/goldenRuleTypography';

export type GoldenRuleRowEmphasis = 'default' | 'highlight' | 'alert' | 'success';
export type GoldenRuleRowBadge = 'hot' | 'warn' | 'ok' | 'info';

export interface GoldenRuleRow {
  label: string;
  value: string;
  emphasis?: GoldenRuleRowEmphasis;
  badge?: GoldenRuleRowBadge;
}

interface GoldenRuleProps {
  content?: string;
  rows?: GoldenRuleRow[];
  theme: ThemeColors;
  layoutVariant?: string;
  footerRule?: string;
}

const BADGE_STYLES: Record<
  GoldenRuleRowBadge,
  { className: string; label: string }
> = {
  hot: {
    className:
      'bg-red-100 text-red-800 ring-1 ring-red-200',
    label: 'Alta',
  },
  warn: {
    className:
      'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
    label: 'Pegada',
  },
  ok: {
    className:
      'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
    label: 'Fixar',
  },
  info: {
    className:
      'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
    label: 'Contexto',
  },
};

function rowEmphasisClasses(emphasis: GoldenRuleRowEmphasis | undefined): string {
  switch (emphasis) {
    case 'highlight':
      return 'bg-amber-50 border-l-[3px] border-l-amber-400 pl-[13px] md:pl-[13px]';
    case 'alert':
      return 'bg-red-50 border-l-[3px] border-l-red-400 pl-[13px] md:pl-[13px]';
    case 'success':
      return 'bg-emerald-50 border-l-[3px] border-l-emerald-500 pl-[13px] md:pl-[13px]';
    default:
      return '';
  }
}

function ReferenceTableBadge({ badge }: { badge: GoldenRuleRowBadge }) {
  const config = BADGE_STYLES[badge];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide md:px-2.5 md:py-1 md:text-[10px] ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function MnemonicHighlight({ content }: { content: string }) {
  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 28) return null;

  return (
    <div className="mb-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5 text-center shadow-md md:mb-6">
      <p className="font-display text-3xl font-black tracking-wide text-blue-800 md:text-4xl">
        {trimmed}
      </p>
      <p className="mt-2 font-body text-sm text-blue-700/80">Mnemônico para fixar na prova</p>
    </div>
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
  const hasBadges = rows.some((row) => row.badge);
  const showMnemonic = Boolean(title && title.length <= 28 && rows.length === 0);

  return (
    <motion.div className="relative flex min-h-full w-full min-w-0 items-start justify-center p-4 md:p-8">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />
      <motion.div
        className={`relative z-10 w-full min-w-0 max-w-4xl rounded-2xl border-2 bg-white/95 shadow-md backdrop-blur-sm md:rounded-3xl ${theme.borderColor} p-5 md:p-7`}
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="mb-4 flex items-center gap-3 md:mb-6">
          <motion.div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg}`}
          >
            <Table2 className={`h-5 w-5 ${theme.iconText}`} />
          </motion.div>
          {title && !showMnemonic ? (
            <h2 className="font-display min-w-0 flex-1 text-base font-extrabold uppercase leading-tight tracking-tight break-words [overflow-wrap:anywhere] md:text-xl lg:text-2xl">
              <span className={theme.iconText}>
                {title}
              </span>
            </h2>
          ) : !showMnemonic ? (
            <span className={`font-mono text-[11px] uppercase tracking-widest ${theme.textSecondary}`}>
              Referência rápida
            </span>
          ) : null}
        </div>

        {showMnemonic && title ? <MnemonicHighlight content={title} /> : null}

        <motion.div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <motion.div
            className={`font-mono hidden gap-0 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-[10px] uppercase tracking-widest md:grid ${
              hasBadges
                ? 'grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)_72px]'
                : 'grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]'
            } ${theme.textSecondary}`}
            aria-hidden
          >
            <span>Rótulo</span>
            <span>Valor</span>
            {hasBadges ? <span className="text-center">Foco</span> : null}
          </motion.div>
          <motion.ul className="divide-y divide-slate-200">
            {rows.map((row, index) => {
              const emphasis = row.emphasis ?? 'default';
              const rowClass = rowEmphasisClasses(emphasis);

              return (
                <motion.li
                  key={`${row.label}-${index}`}
                  className={`grid grid-cols-1 gap-1.5 px-4 py-3 transition-colors hover:bg-slate-50 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)_72px] md:items-center md:gap-4 md:py-3.5 ${
                    hasBadges ? '' : 'md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]'
                  } ${rowClass}`}
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.28, delay: reduceMotion ? 0 : index * 0.05 }}
                >
                  <span
                    className={`font-mono text-[11px] uppercase tracking-wide break-words [overflow-wrap:anywhere] md:text-sm ${
                      emphasis === 'highlight'
                        ? 'text-amber-700'
                        : emphasis === 'alert'
                          ? 'text-red-700'
                          : emphasis === 'success'
                            ? 'text-emerald-700'
                            : theme.textSecondary
                    }`}
                  >
                    {row.label}
                  </span>
                  <span
                    className={`font-body text-sm leading-snug break-words [overflow-wrap:anywhere] md:text-base ${
                      theme.textPrimary
                    }`}
                  >
                    {row.value}
                  </span>
                  {row.badge ? (
                    <div className="flex md:justify-center">
                      <ReferenceTableBadge badge={row.badge} />
                    </div>
                  ) : hasBadges ? (
                    <span className="hidden md:block" aria-hidden />
                  ) : null}
                </motion.li>
              );
            })}
          </motion.ul>
        </motion.div>

        {footerRule ? (
          <p
            className={`font-body mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm italic leading-relaxed md:mt-6 md:text-base ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// GOLDEN RULE: Tipografia gigante OU tabela reference_table (rows)
// layout_variant: center | compact | minimal | banner | reference_table
// Com rows → reference_table automático no player (salvo override tipográfico explícito)
// rows[].emphasis: default | highlight | alert | success
// rows[].badge: hot | warn | ok | info
// ============================================================================
export const GoldenRule = ({
  content = '',
  rows,
  theme,
  layoutVariant = 'center',
  footerRule,
}: GoldenRuleProps) => {
  const variant = layoutVariant || 'center';

  if (variant === 'reference_table' && rows && rows.length > 0) {
    return (
      <ReferenceTableLayout content={content} rows={rows} theme={theme} footerRule={footerRule} />
    );
  }

  // VARIANTE 1: CENTER (padrão) — Tipografia gigante centralizada
  if (variant === 'center') {
    return (
      <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center overflow-y-auto p-3 md:p-8">
        <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />
        <GoldenRuleHeroCard content={content} theme={theme} footerRule={footerRule} />
      </div>
    );
  }

  // VARIANTE 2: COMPACT — Ícone no topo, texto abaixo
  if (variant === 'compact') {
    return (
      <motion.div className="relative flex min-h-full w-full min-w-0 items-center justify-center p-4 md:p-6 lg:p-10">
        <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />
        <motion.div
          className={`relative z-10 w-full min-w-0 max-w-3xl p-5 md:p-7 rounded-2xl border-2 ${theme.borderColor} bg-white shadow-sm`}
        >
          <motion.div className={`w-10 h-10 rounded-xl ${theme.iconBg} flex items-center justify-center ${theme.iconText} mb-3`}>
            <Lightbulb size={20} />
          </motion.div>
          <p className={`font-display min-w-0 text-base font-bold leading-relaxed break-words [overflow-wrap:anywhere] hyphens-auto md:text-lg lg:text-xl ${theme.textPrimary}`}>
            {content}
          </p>
          {footerRule ? (
            <p className={`font-body mt-4 text-sm italic leading-relaxed md:mt-5 md:text-base ${theme.textSecondary}`}>
              {footerRule}
            </p>
          ) : null}
        </motion.div>
      </motion.div>
    );
  }

  // VARIANTE 3: MINIMAL — Apenas texto com borda sutil
  if (variant === 'minimal') {
    return (
      <motion.div className="relative flex min-h-full w-full min-w-0 items-center justify-center p-6">
        <motion.div className={`absolute inset-0 bg-slate-50`} />
        <motion.div className={`relative z-10 w-full min-w-0 max-w-2xl py-5 px-5 border-l-4 ${theme.borderColor}`}>
          <p className={`font-body text-base italic leading-relaxed break-words [overflow-wrap:anywhere] hyphens-auto md:text-xl ${theme.textPrimary}`}>
            {content}
          </p>
          {footerRule ? (
            <p className={`font-body mt-4 text-sm italic leading-relaxed md:mt-5 md:text-base ${theme.textSecondary}`}>
              {footerRule}
            </p>
          ) : null}
        </motion.div>
      </motion.div>
    );
  }

  // VARIANTE 4: BANNER — Ícone no topo + texto abaixo (coluna, evita corte horizontal)
  if (variant === 'banner') {
    const titleSize = getGoldenRuleTitleSizeClass(content);
    return (
      <motion.div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center overflow-y-auto p-3 md:p-6">
        <motion.div className={`absolute inset-0 bg-gradient-to-r ${theme.bgGradient} opacity-50`} />
        <motion.div
          className={`relative z-10 flex w-full min-w-0 max-w-5xl flex-col items-center gap-4 rounded-2xl border-2 bg-white p-6 shadow-sm md:p-8 ${theme.borderColor}`}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            aria-hidden
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${theme.glow} 0%, transparent 70%)`,
            }}
          />
          <motion.div
            className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl md:h-16 md:w-16 ${theme.iconBg}`}
          >
            <Zap className={`h-7 w-7 md:h-8 md:w-8 ${theme.iconText}`} aria-hidden />
          </motion.div>
          <h2
            className={`font-display relative w-full min-w-0 text-center font-extrabold uppercase leading-snug tracking-tight break-words [overflow-wrap:anywhere] hyphens-auto text-slate-900 ${titleSize}`}
          >
            {content}
          </h2>
          {footerRule ? (
            <p
              className={`font-body relative w-full border-t border-slate-100 pt-4 text-center text-sm font-medium leading-relaxed md:text-base ${theme.textSecondary}`}
            >
              {footerRule}
            </p>
          ) : null}
        </motion.div>
      </motion.div>
    );
  }

  // Fallback: center
  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center overflow-y-auto p-3 md:p-8">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-50`} />
      <GoldenRuleHeroCard content={content} theme={theme} footerRule={footerRule} rounded="2xl" />
    </div>
  );
};
