'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, Lightbulb, Zap, Table2 } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';

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
      'bg-red-500/20 text-red-200 ring-1 ring-red-500/35 shadow-[0_0_10px_rgba(239,68,68,0.15)]',
    label: 'Alta',
  },
  warn: {
    className:
      'bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/35 shadow-[0_0_10px_rgba(245,158,11,0.12)]',
    label: 'Pegada',
  },
  ok: {
    className:
      'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30 shadow-[0_0_10px_rgba(34,197,94,0.12)]',
    label: 'Fixar',
  },
  info: {
    className:
      'bg-blue-500/15 text-blue-200 ring-1 ring-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.12)]',
    label: 'Contexto',
  },
};

function rowEmphasisClasses(emphasis: GoldenRuleRowEmphasis | undefined): string {
  switch (emphasis) {
    case 'highlight':
      return 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-[3px] border-l-amber-400/80 pl-[13px] md:pl-[13px]';
    case 'alert':
      return 'bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border-l-[3px] border-l-red-400/70 pl-[13px] md:pl-[13px]';
    case 'success':
      return 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-l-[3px] border-l-emerald-400/70 pl-[13px] md:pl-[13px]';
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

  return (
    <motion.div className="relative flex min-h-full w-full min-w-0 items-start justify-center p-4 md:p-8">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-90`} />
      <motion.div
        className={`relative z-10 w-full min-w-0 max-w-4xl rounded-[1.5rem] border-2 ${theme.borderColor} bg-slate-950/50 p-5 backdrop-blur-md md:rounded-[2rem] md:p-7`}
        style={{ boxShadow: `0 0 60px -20px ${theme.glow}` }}
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="mb-4 flex items-center gap-3 md:mb-6">
          <motion.div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} shadow-[0_0_20px_rgba(251,191,36,0.15)]`}
          >
            <Table2 className={`h-5 w-5 ${theme.iconText}`} />
          </motion.div>
          {title ? (
            <h2 className="font-display min-w-0 flex-1 text-base font-extrabold uppercase leading-tight tracking-tight break-words [overflow-wrap:anywhere] md:text-xl lg:text-2xl">
              <span className="bg-gradient-to-r from-amber-100 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                {title}
              </span>
            </h2>
          ) : (
            <span className={`font-mono text-[11px] uppercase tracking-widest ${theme.textSecondary}`}>
              Referência rápida
            </span>
          )}
        </div>

        <motion.div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-inner">
          <motion.div
            className={`font-mono hidden gap-0 border-b border-white/10 bg-white/[0.06] px-4 py-2.5 text-[10px] uppercase tracking-widest md:grid ${
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
          <motion.ul className="divide-y divide-white/10">
            {rows.map((row, index) => {
              const emphasis = row.emphasis ?? 'default';
              const rowClass = rowEmphasisClasses(emphasis);

              return (
                <motion.li
                  key={`${row.label}-${index}`}
                  className={`grid grid-cols-1 gap-1.5 px-4 py-3 transition-colors hover:bg-white/[0.03] md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)_72px] md:items-center md:gap-4 md:py-3.5 ${
                    hasBadges ? '' : 'md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]'
                  } ${rowClass}`}
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.28, delay: reduceMotion ? 0 : index * 0.05 }}
                >
                  <span
                    className={`font-mono text-[11px] uppercase tracking-wide break-words [overflow-wrap:anywhere] md:text-sm ${
                      emphasis === 'highlight'
                        ? 'text-amber-200'
                        : emphasis === 'alert'
                          ? 'text-red-200'
                          : emphasis === 'success'
                            ? 'text-emerald-200'
                            : theme.textSecondary
                    }`}
                  >
                    {row.label}
                  </span>
                  <span
                    className={`font-body text-sm leading-snug break-words [overflow-wrap:anywhere] md:text-base ${
                      emphasis === 'default' ? theme.textPrimary : 'text-white'
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
            className={`font-body mt-4 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm italic leading-relaxed md:mt-6 md:text-base ${theme.textSecondary}`}
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
      <div className="relative flex min-h-full w-full min-w-0 items-center justify-center p-3 md:p-8">
        <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-90`} />
        <motion.div
          className={`golden-rule-card relative z-10 w-full min-w-0 max-w-4xl p-6 md:p-8 lg:p-10 rounded-[2rem] md:rounded-[3rem] text-center border-4 ${theme.borderColor} backdrop-blur-sm`}
          style={{ boxShadow: `0 0 80px -20px ${theme.glow}` }}
        >
          <div className="golden-rule-shine pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="relative z-10 min-w-0">
            <Sparkles className={`${theme.iconText} w-8 h-8 md:w-10 md:h-10 mx-auto mb-3 drop-shadow-2xl`} />
            <h2 className="golden-rule-text font-display text-lg font-extrabold uppercase tracking-tighter leading-tight break-words [overflow-wrap:anywhere] hyphens-none text-white [text-shadow:0_0_40px_rgba(255,255,255,0.15)] md:text-3xl lg:text-4xl xl:text-6xl">
              {content}
            </h2>
            {footerRule ? (
              <p className={`font-body mt-4 text-sm italic leading-relaxed md:mt-6 md:text-base ${theme.textSecondary}`}>
                {footerRule}
              </p>
            ) : null}
          </div>
        </motion.div>
      </div>
    );
  }

  // VARIANTE 2: COMPACT — Ícone no topo, texto abaixo
  if (variant === 'compact') {
    return (
      <motion.div className="relative flex min-h-full w-full min-w-0 items-center justify-center p-4 md:p-6 lg:p-10">
        <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-70`} />
        <motion.div
          className={`relative z-10 w-full min-w-0 max-w-3xl p-5 md:p-7 rounded-2xl border-2 ${theme.borderColor} backdrop-blur-xl`}
          style={{ boxShadow: `0 0 40px ${theme.glow}` }}
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
        <motion.div className={`absolute inset-0 bg-slate-900/95`} />
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
    return (
      <motion.div className="relative flex min-h-full w-full min-w-0 items-center justify-center p-3 md:p-6">
        <motion.div className={`absolute inset-0 bg-gradient-to-r ${theme.primary} opacity-90`} />
        <motion.div className="relative z-10 flex w-full min-w-0 max-w-5xl flex-col items-center gap-4 p-6 md:p-8 rounded-2xl border-2 border-white/20">
          <motion.div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </motion.div>
          <h2 className="font-display w-full min-w-0 text-center text-lg font-extrabold uppercase tracking-tight leading-tight break-words [overflow-wrap:anywhere] hyphens-auto text-white md:text-2xl lg:text-3xl">
            {content}
          </h2>
          {footerRule ? (
            <p className="font-body w-full text-center text-sm italic leading-relaxed text-white/80 md:text-base">
              {footerRule}
            </p>
          ) : null}
        </motion.div>
      </motion.div>
    );
  }

  // Fallback: center
  return (
    <motion.div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col items-stretch justify-start p-3 md:p-8">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-90`} />
      <motion.div
        className={`relative z-10 w-full min-w-0 max-w-4xl p-6 md:p-8 lg:p-10 rounded-[2rem] text-center border-4 ${theme.borderColor} backdrop-blur-sm`}
        style={{ boxShadow: `0 0 80px -20px ${theme.glow}` }}
      >
        <Sparkles className={`${theme.iconText} w-8 h-8 md:w-10 md:h-10 mx-auto mb-3`} />
        <h2 className="font-display text-lg font-extrabold uppercase tracking-tighter leading-tight break-words [overflow-wrap:anywhere] hyphens-none text-white [text-shadow:0_0_40px_rgba(255,255,255,0.15)] md:text-3xl">
          {content}
        </h2>
        {footerRule ? (
          <p className={`font-body mt-4 text-sm italic leading-relaxed md:mt-6 md:text-base ${theme.textSecondary}`}>
            {footerRule}
          </p>
        ) : null}
      </motion.div>
    </motion.div>
  );
};
