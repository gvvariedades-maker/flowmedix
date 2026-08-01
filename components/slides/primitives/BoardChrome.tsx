'use client';

import type { ReactNode } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import { cn } from '@/lib/utils';
import { BOARD_EYEBROW, BOARD_FOOTER } from './boardTokens';

export type BoardChromeMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '5xl';

const MAX_WIDTH: Record<BoardChromeMaxWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '5xl': 'max-w-5xl',
};

export interface BoardChromeProps {
  theme: ThemeColors;
  /** Wash opacity 0–1 (default ~0.3). */
  washOpacity?: number;
  eyebrow?: string;
  title?: string;
  /** Override do título (ex.: danger compare usa text-sm). */
  titleClassName?: string;
  footerRule?: string;
  maxWidth?: BoardChromeMaxWidth;
  className?: string;
  children: ReactNode;
}

/**
 * Shell glanceable: gradient wash + container max-w + eyebrow/title/footer.
 * Substitui wrappers duplicados nos moldes ética / boards de mercado.
 */
export function BoardChrome({
  theme,
  washOpacity = 0.3,
  eyebrow,
  title,
  titleClassName,
  footerRule,
  maxWidth = 'xl',
  className,
  children,
}: BoardChromeProps) {
  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <div
        className={cn('absolute inset-0 bg-gradient-to-br', theme.bgGradient)}
        style={{ opacity: washOpacity }}
        aria-hidden
      />

      <div
        className={cn(
          'relative z-10 mx-auto flex w-full flex-col gap-3',
          MAX_WIDTH[maxWidth],
          className,
        )}
      >
        {title ? (
          <h2
            className={cn(
              'text-center font-display text-base font-black uppercase tracking-wide text-slate-900 md:text-lg',
              titleClassName,
            )}
          >
            {title}
          </h2>
        ) : null}

        {eyebrow ? <p className={BOARD_EYEBROW}>{eyebrow}</p> : null}

        {children}

        {footerRule ? <p className={BOARD_FOOTER}>{footerRule}</p> : null}
      </div>
    </div>
  );
}
