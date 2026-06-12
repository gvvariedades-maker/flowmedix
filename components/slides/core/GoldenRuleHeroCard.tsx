'use client';

import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import type { ThemeColors } from './themeGenerator';
import { SLIDE_CARD_LG } from './slideSurface';
import { getGoldenRuleTitleSizeClass } from '@/lib/slides/goldenRuleTypography';

export interface GoldenRuleHeroCardProps {
  content: string;
  theme: ThemeColors;
  footerRule?: string;
  icon?: LucideIcon;
  rounded?: '2xl' | '3xl';
}

/**
 * Card hero da Regra de Ouro — glow do acento, ícone grande, tipografia responsiva ao comprimento.
 */
export function GoldenRuleHeroCard({
  content,
  theme,
  footerRule,
  icon: Icon = Sparkles,
  rounded = '3xl',
}: GoldenRuleHeroCardProps) {
  const titleSize = getGoldenRuleTitleSizeClass(content);
  const roundClass = rounded === '3xl' ? 'rounded-[2rem] md:rounded-[3rem]' : 'rounded-2xl md:rounded-3xl';

  return (
    <div
      className={`golden-rule-card relative z-10 w-full min-w-0 max-w-4xl border-4 ${theme.borderColor} bg-white p-6 shadow-sm md:p-8 lg:p-10 ${roundClass} text-center`}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        aria-hidden
        style={{
          background: `radial-gradient(ellipse 85% 55% at 50% 0%, ${theme.glow} 0%, transparent 72%)`,
        }}
      />
      <div className="relative z-10 min-w-0">
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl md:mb-5 md:h-16 md:w-16 ${theme.iconBg}`}
        >
          <Icon className={`h-7 w-7 md:h-8 md:w-8 ${theme.iconText}`} aria-hidden />
        </div>
        <h2
          className={`golden-rule-text font-display font-extrabold uppercase leading-snug tracking-tight break-words [overflow-wrap:anywhere] hyphens-none text-slate-900 ${titleSize}`}
        >
          {content}
        </h2>
        {footerRule ? (
          <p
            className={`font-body mt-5 border-t border-slate-100 pt-4 text-sm font-medium leading-relaxed md:mt-6 md:text-base ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
