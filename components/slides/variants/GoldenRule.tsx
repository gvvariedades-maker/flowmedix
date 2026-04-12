'use client';

import { Sparkles, Lightbulb, Zap } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';

interface GoldenRuleProps {
  content: string;
  theme: ThemeColors;
  layoutVariant?: string;
}

// ============================================================================
// GOLDEN RULE: Tipografia gigante com tema dinâmico + variantes didáticas
// layout_variant: center | compact | minimal | banner
// Ícones sempre no TOPO para maximizar espaço de texto (especialmente com zoom).
// ============================================================================
export const GoldenRule = ({ content, theme, layoutVariant = 'center' }: GoldenRuleProps) => {
  const variant = layoutVariant || 'center';

  // VARIANTE 1: CENTER (padrão) — Tipografia gigante centralizada
  if (variant === 'center') {
    return (
      <div className="relative flex min-h-full w-full min-w-0 items-start justify-center p-3 md:p-8">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-90`} />
        <div
          className={`golden-rule-card relative z-10 w-full min-w-0 max-w-4xl p-5 md:p-10 lg:p-12 rounded-[2rem] md:rounded-[3rem] text-center border-4 ${theme.borderColor} backdrop-blur-sm`}
          style={{ boxShadow: `0 0 80px -20px ${theme.glow}` }}
        >
          <div className="golden-rule-shine pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="relative z-10 min-w-0">
            <Sparkles className={`${theme.iconText} w-10 h-10 md:w-14 md:h-14 mx-auto mb-4 drop-shadow-2xl`} />
            <h2 className="golden-rule-text text-xl md:text-3xl lg:text-4xl xl:text-6xl font-black text-white leading-tight uppercase tracking-tighter break-words [overflow-wrap:anywhere] hyphens-auto drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              {content}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // VARIANTE 2: COMPACT — Ícone no topo, texto abaixo
  if (variant === 'compact') {
    return (
      <div className="relative flex min-h-full w-full min-w-0 items-start justify-center p-4 md:p-10">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-70`} />
        <div
          className={`relative z-10 w-full min-w-0 max-w-3xl p-5 md:p-8 rounded-2xl border-2 ${theme.borderColor} backdrop-blur-xl`}
          style={{ boxShadow: `0 0 40px ${theme.glow}` }}
        >
          <div className={`w-10 h-10 rounded-xl ${theme.iconBg} flex items-center justify-center ${theme.iconText} mb-3`}>
            <Lightbulb size={20} />
          </div>
          <p className={`min-w-0 text-base md:text-lg lg:text-xl font-bold ${theme.textPrimary} leading-relaxed break-words [overflow-wrap:anywhere] hyphens-auto`}>
            {content}
          </p>
        </div>
      </div>
    );
  }

  // VARIANTE 3: MINIMAL — Apenas texto com borda sutil
  if (variant === 'minimal') {
    return (
      <div className="relative flex min-h-full w-full min-w-0 items-start justify-center p-6">
        <div className={`absolute inset-0 bg-slate-900/95`} />
        <div className={`relative z-10 w-full min-w-0 max-w-2xl py-6 px-5 border-l-4 ${theme.borderColor}`}>
          <p className={`text-base md:text-xl font-semibold ${theme.textPrimary} leading-relaxed italic break-words [overflow-wrap:anywhere] hyphens-auto`}>
            {content}
          </p>
        </div>
      </div>
    );
  }

  // VARIANTE 4: BANNER — Ícone no topo + texto abaixo (coluna, evita corte horizontal)
  if (variant === 'banner') {
    return (
      <div className="relative flex min-h-full w-full min-w-0 items-start justify-center p-3 md:p-6">
        <div className={`absolute inset-0 bg-gradient-to-r ${theme.primary} opacity-90`} />
        <div className="relative z-10 flex w-full min-w-0 max-w-5xl flex-col items-center gap-4 p-5 md:p-8 rounded-2xl border-2 border-white/20">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="w-full min-w-0 text-center text-lg md:text-2xl lg:text-3xl font-black text-white uppercase tracking-tight leading-tight break-words [overflow-wrap:anywhere] hyphens-auto">
            {content}
          </h2>
        </div>
      </div>
    );
  }

  // Fallback: center
  return (
    <div className="relative flex min-h-full w-full min-w-0 items-start justify-center p-3 md:p-8">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-90`} />
      <div
        className={`relative z-10 w-full min-w-0 max-w-4xl p-5 md:p-10 rounded-[2rem] text-center border-4 ${theme.borderColor} backdrop-blur-sm`}
        style={{ boxShadow: `0 0 80px -20px ${theme.glow}` }}
      >
        <Sparkles className={`${theme.iconText} w-10 h-10 md:w-14 md:h-14 mx-auto mb-4`} />
        <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter break-words [overflow-wrap:anywhere] hyphens-auto">
          {content}
        </h2>
      </div>
    </div>
  );
};
