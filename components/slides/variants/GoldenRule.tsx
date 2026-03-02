'use client';

import { motion } from 'framer-motion';
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
// ============================================================================
export const GoldenRule = ({ content, theme, layoutVariant = 'center' }: GoldenRuleProps) => {
  const variant = layoutVariant || 'center';

  // VARIANTE 1: CENTER (padrão) - Tipografia gigante centralizada
  if (variant === 'center') {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 md:p-8 relative overflow-y-auto custom-scrollbar">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-90`} />
        <div
          className={`golden-rule-card relative z-10 w-full max-w-4xl p-6 md:p-12 lg:p-16 rounded-[2rem] md:rounded-[3rem] text-center border-4 ${theme.borderColor} backdrop-blur-sm my-auto`}
          style={{ boxShadow: `0 0 80px -20px ${theme.glow}`, minHeight: '300px' }}
        >
          <div className="golden-rule-shine absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="relative z-10">
            <Sparkles className={`${theme.iconText} w-16 h-16 mx-auto mb-6 drop-shadow-2xl`} />
            <h2 className="golden-rule-text text-2xl md:text-4xl lg:text-5xl xl:text-7xl font-black text-white leading-tight uppercase tracking-tighter drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] break-words">
              {content}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // VARIANTE 2: COMPACT - Card menor, texto mais denso
  if (variant === 'compact') {
    return (
      <div className="w-full h-full flex items-center justify-center p-6 md:p-10 relative overflow-y-auto custom-scrollbar">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-70`} />
        <div
          className={`relative z-10 w-full max-w-3xl p-8 md:p-10 rounded-2xl border-2 ${theme.borderColor} backdrop-blur-xl`}
          style={{ boxShadow: `0 0 40px ${theme.glow}` }}
        >
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-12 h-12 rounded-xl ${theme.iconBg} flex items-center justify-center ${theme.iconText}`}>
              <Lightbulb size={24} />
            </div>
            <p className={`text-lg md:text-xl lg:text-2xl font-bold ${theme.textPrimary} leading-relaxed`}>
              {content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // VARIANTE 3: MINIMAL - Apenas texto com borda sutil
  if (variant === 'minimal') {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 relative overflow-y-auto custom-scrollbar">
        <div className={`absolute inset-0 bg-slate-900/95`} />
        <div className={`relative z-10 w-full max-w-2xl py-8 px-6 border-l-4 ${theme.borderColor} pl-8`}>
          <p className={`text-xl md:text-2xl font-semibold ${theme.textPrimary} leading-relaxed italic`}>
            {content}
          </p>
        </div>
      </div>
    );
  }

  // VARIANTE 4: BANNER - Estilo faixa/destaque horizontal
  if (variant === 'banner') {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 relative overflow-y-auto custom-scrollbar">
        <div className={`absolute inset-0 bg-gradient-to-r ${theme.primary} opacity-90`} />
        <div className="relative z-10 w-full max-w-5xl flex items-center gap-6 p-6 md:p-8 rounded-2xl border-2 border-white/20">
          <div className={`shrink-0 w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center`}>
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white uppercase tracking-tight leading-tight">
            {content}
          </h2>
        </div>
      </div>
    );
  }

  // Fallback: center
  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-8 relative overflow-y-auto custom-scrollbar">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-90`} />
      <div
        className={`relative z-10 w-full max-w-4xl p-6 md:p-12 rounded-[2rem] text-center border-4 ${theme.borderColor} backdrop-blur-sm my-auto`}
        style={{ boxShadow: `0 0 80px -20px ${theme.glow}` }}
      >
        <Sparkles className={`${theme.iconText} w-12 h-12 mx-auto mb-4`} />
        <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter break-words">
          {content}
        </h2>
      </div>
    </div>
  );
};
