'use client';

import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, Zap, Table2 } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';

export interface GoldenRuleRow {
  label: string;
  value: string;
}

interface GoldenRuleProps {
  content?: string;
  rows?: GoldenRuleRow[];
  theme: ThemeColors;
  layoutVariant?: string;
  footerRule?: string;
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

  return (
    <motion.div className="relative flex min-h-full w-full min-w-0 items-start justify-center p-3 md:p-8">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-90`} />
      <motion.div
        className={`relative z-10 w-full min-w-0 max-w-4xl rounded-[1.5rem] border-2 ${theme.borderColor} bg-slate-950/40 p-4 backdrop-blur-sm md:rounded-[2rem] md:p-8`}
        style={{ boxShadow: `0 0 60px -20px ${theme.glow}` }}
      >
        <div className="mb-4 flex items-center gap-3 md:mb-6">
          <motion.div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg}`}>
            <Table2 className={`h-5 w-5 ${theme.iconText}`} />
          </motion.div>
          {title ? (
            <h2
              className={`min-w-0 flex-1 text-base font-black uppercase leading-tight tracking-tight break-words [overflow-wrap:anywhere] md:text-xl lg:text-2xl ${theme.textPrimary}`}
            >
              {title}
            </h2>
          ) : (
            <span className={`text-xs font-black uppercase tracking-widest ${theme.textSecondary}`}>
              Referência rápida
            </span>
          )}
        </div>

        <motion.div className="overflow-hidden rounded-xl border border-white/10">
          <motion.div
            className={`hidden grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-0 border-b border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest md:grid ${theme.textSecondary}`}
            aria-hidden
          >
            <span>Rótulo</span>
            <span>Valor</span>
          </motion.div>
          <motion.ul className="divide-y divide-white/10">
            {rows.map((row, index) => (
              <motion.li
                key={`${row.label}-${index}`}
                className="grid grid-cols-1 gap-1 px-4 py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-4 md:py-3.5"
              >
                <span
                  className={`text-xs font-bold uppercase tracking-wide break-words [overflow-wrap:anywhere] md:text-sm ${theme.textSecondary}`}
                >
                  {row.label}
                </span>
                <span
                  className={`text-sm font-semibold leading-snug break-words [overflow-wrap:anywhere] md:text-base ${theme.textPrimary}`}
                >
                  {row.value}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {footerRule ? (
          <p className={`mt-4 text-sm font-semibold italic leading-relaxed md:mt-6 md:text-base ${theme.textSecondary}`}>
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
      <div className="relative flex min-h-full w-full min-w-0 items-start justify-center p-3 md:p-8">
        <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-90`} />
        <motion.div
          className={`golden-rule-card relative z-10 w-full min-w-0 max-w-4xl p-5 md:p-10 lg:p-12 rounded-[2rem] md:rounded-[3rem] text-center border-4 ${theme.borderColor} backdrop-blur-sm`}
          style={{ boxShadow: `0 0 80px -20px ${theme.glow}` }}
        >
          <div className="golden-rule-shine pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="relative z-10 min-w-0">
            <Sparkles className={`${theme.iconText} w-10 h-10 md:w-14 md:h-14 mx-auto mb-4 drop-shadow-2xl`} />
            <h2 className="golden-rule-text text-lg font-black uppercase leading-tight tracking-tighter break-words [overflow-wrap:anywhere] hyphens-auto text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] md:text-3xl lg:text-4xl xl:text-6xl">
              {content}
            </h2>
          </div>
        </motion.div>
      </div>
    );
  }

  // VARIANTE 2: COMPACT — Ícone no topo, texto abaixo
  if (variant === 'compact') {
    return (
      <motion.div className="relative flex min-h-full w-full min-w-0 items-start justify-center p-4 md:p-10">
        <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-70`} />
        <motion.div
          className={`relative z-10 w-full min-w-0 max-w-3xl p-5 md:p-8 rounded-2xl border-2 ${theme.borderColor} backdrop-blur-xl`}
          style={{ boxShadow: `0 0 40px ${theme.glow}` }}
        >
          <motion.div className={`w-10 h-10 rounded-xl ${theme.iconBg} flex items-center justify-center ${theme.iconText} mb-3`}>
            <Lightbulb size={20} />
          </motion.div>
          <p className={`min-w-0 text-base font-bold leading-relaxed break-words [overflow-wrap:anywhere] hyphens-auto md:text-lg lg:text-xl ${theme.textPrimary}`}>
            {content}
          </p>
        </motion.div>
      </motion.div>
    );
  }

  // VARIANTE 3: MINIMAL — Apenas texto com borda sutil
  if (variant === 'minimal') {
    return (
      <motion.div className="relative flex min-h-full w-full min-w-0 items-start justify-center p-6">
        <motion.div className={`absolute inset-0 bg-slate-900/95`} />
        <motion.div className={`relative z-10 w-full min-w-0 max-w-2xl py-6 px-5 border-l-4 ${theme.borderColor}`}>
          <p className={`text-base font-semibold italic leading-relaxed break-words [overflow-wrap:anywhere] hyphens-auto md:text-xl ${theme.textPrimary}`}>
            {content}
          </p>
        </motion.div>
      </motion.div>
    );
  }

  // VARIANTE 4: BANNER — Ícone no topo + texto abaixo (coluna, evita corte horizontal)
  if (variant === 'banner') {
    return (
      <motion.div className="relative flex min-h-full w-full min-w-0 items-start justify-center p-3 md:p-6">
        <motion.div className={`absolute inset-0 bg-gradient-to-r ${theme.primary} opacity-90`} />
        <motion.div className="relative z-10 flex w-full min-w-0 max-w-5xl flex-col items-center gap-4 p-5 md:p-8 rounded-2xl border-2 border-white/20">
          <motion.div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </motion.div>
          <h2 className="w-full min-w-0 text-center text-lg font-black uppercase tracking-tight leading-tight break-words [overflow-wrap:anywhere] hyphens-auto text-white md:text-2xl lg:text-3xl">
            {content}
          </h2>
        </motion.div>
      </motion.div>
    );
  }

  // Fallback: center
  return (
    <motion.div className="relative flex min-h-full w-full min-w-0 items-start justify-center p-3 md:p-8">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-90`} />
      <motion.div
        className={`relative z-10 w-full min-w-0 max-w-4xl p-5 md:p-10 rounded-[2rem] text-center border-4 ${theme.borderColor} backdrop-blur-sm`}
        style={{ boxShadow: `0 0 80px -20px ${theme.glow}` }}
      >
        <Sparkles className={`${theme.iconText} w-10 h-10 md:w-14 md:h-14 mx-auto mb-4`} />
        <h2 className="text-lg font-black uppercase tracking-tighter break-words [overflow-wrap:anywhere] hyphens-auto text-white md:text-3xl">
          {content}
        </h2>
      </motion.div>
    </motion.div>
  );
};
