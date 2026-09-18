'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AVANT_BRAND_V21 } from '@/lib/brand/avantBrandV21Assets';
import {
  AVANT_LOGO_ANIMATION,
  AVANT_LOGO_COLORS,
  AVANT_LOGO_DIMENSIONS,
  AVANT_LOGO_GRADIENTS,
  AVANT_LOGO_SHELL_SHADOW,
  getAvantLogoLockupPadding,
  scaleAvantLogoPx,
  type AvantLogoSizeToken,
} from '@/lib/brand/avantLogoConstants';

export type { AvantLogoSizeToken } from '@/lib/brand/avantLogoConstants';

export type AvantLogoVariant = 'lockup' | 'icon';

/**
 * - `default` — cyber (shell + lockup escuro V2.1)
 * - `light` / `brand` — editorial (horizontal V2.1, sem shell)
 */
export type AvantLogoTone = 'default' | 'light' | 'brand';

export type AvantLogoProps = {
  variant?: AvantLogoVariant;
  size?: AvantLogoSizeToken;
  tone?: AvantLogoTone;
  animated?: boolean;
  href?: string;
  className?: string;
  'aria-label'?: string;
  /** Escala só o lockup horizontal (sidebar estreita). `1` = padrão do `size`. */
  wordmarkScale?: number;
};

const LOCKUP_HEIGHT_BY_SIZE: Record<AvantLogoSizeToken, number> = {
  nav: 28,
  md: 32,
  lg: 36,
};

function getLockupHeight(size: AvantLogoSizeToken, wordmarkScale: number): number {
  return Math.round(LOCKUP_HEIGHT_BY_SIZE[size] * wordmarkScale);
}

/** Símbolo A oficial V2.1 — SVG congelado. */
function AvantLogoIcon({ size }: { size: AvantLogoSizeToken }) {
  const iconPx = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.icon.size, size);

  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-visible"
      style={{ width: iconPx, height: iconPx }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG master */}
      <img
        src={AVANT_BRAND_V21.symbol}
        alt=""
        width={iconPx}
        height={iconPx}
        className="h-full w-full select-none object-contain"
        draggable={false}
      />
    </div>
  );
}

/** Lockup horizontal oficial V2.1 — artwork proprietário (não tipografia). */
function AvantLogoLockupArtwork({
  size,
  wordmarkScale = 1,
  tone,
}: {
  size: AvantLogoSizeToken;
  wordmarkScale?: number;
  tone: AvantLogoTone;
}) {
  const isLight = tone === 'light' || tone === 'brand';
  const height = getLockupHeight(size, wordmarkScale);
  const width = Math.round(height * AVANT_BRAND_V21.horizontalAspect);
  const src = isLight ? AVANT_BRAND_V21.horizontal : AVANT_BRAND_V21.darkLockup;

  return (
    <span className="inline-flex min-w-0 shrink items-center overflow-visible" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG lockup */}
      <img
        src={src}
        alt=""
        width={width}
        height={height}
        className="max-w-full select-none object-contain object-left"
        style={{ height, width: 'auto', maxWidth: width }}
        draggable={false}
      />
    </span>
  );
}

export function AvantLogo({
  variant = 'lockup',
  size = 'lg',
  tone = 'default',
  animated,
  href,
  className,
  'aria-label': ariaLabel = 'AVANT enf - inicio',
  wordmarkScale = 1,
}: AvantLogoProps) {
  const isLight = tone === 'light' || tone === 'brand';
  const pulse =
    animated ?? (variant === 'lockup' && size === 'lg' && tone === 'default');

  const iconOnly = variant === 'icon';

  const lightLockup = (
    <AvantLogoLockupArtwork size={size} wordmarkScale={wordmarkScale} tone={tone} />
  );

  const cyberLockup = (
    <div
      className={cn(
        'inline-flex shrink-0',
        pulse && AVANT_LOGO_ANIMATION.pulseClassName,
      )}
      style={{
        padding: scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.lockupShell.padding, size),
        borderRadius: scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.lockupShell.radius, size),
        background: AVANT_LOGO_GRADIENTS.shellBorder,
        boxShadow: pulse ? undefined : AVANT_LOGO_SHELL_SHADOW.rest,
      }}
    >
      <div
        className="flex items-center"
        style={{
          padding: getAvantLogoLockupPadding(size),
          borderRadius: scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.lockupInner.radius, size),
          background: AVANT_LOGO_COLORS.lockupInnerBg,
          boxShadow: AVANT_LOGO_COLORS.lockupInnerInsetShadow,
        }}
      >
        <div
          className="shrink-0 self-stretch"
          style={{
            width: scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.lockupInner.accentBarWidth, size),
            borderRadius: 1,
            background: AVANT_LOGO_COLORS.accentBar,
          }}
          aria-hidden
        />
        <AvantLogoLockupArtwork size={size} wordmarkScale={wordmarkScale} tone={tone} />
      </div>
    </div>
  );

  const content = iconOnly ? (
    <AvantLogoIcon size={size} />
  ) : isLight ? (
    lightLockup
  ) : (
    cyberLockup
  );

  const rootClass = cn('inline-flex shrink-0 items-center overflow-visible', className);

  if (href) {
    return (
      <Link href={href} className={rootClass} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return <div className={rootClass}>{content}</div>;
}
