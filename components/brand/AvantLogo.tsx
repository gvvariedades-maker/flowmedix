'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  AVANT_LOGO_ANIMATION,
  AVANT_LOGO_COLORS,
  AVANT_LOGO_DIMENSIONS,
  AVANT_LOGO_FONT_FAMILY,
  AVANT_LOGO_GRADIENTS,
  AVANT_LOGO_ICON_FLAT_BELOW,
  AVANT_LOGO_ICON_INSET_SCALE,
  AVANT_LOGO_SHELL_SHADOW,
  getAvantLogoLockupPadding,
  getAvantLogoWordmarkLetterSpacing,
  scaleAvantLogoPx,
  type AvantLogoSizeToken,
} from '@/lib/brand/avantLogoConstants';

export type { AvantLogoSizeToken } from '@/lib/brand/avantLogoConstants';

export type AvantLogoVariant = 'lockup' | 'icon';

/**
 * - `default` — cyber (shell + monograma cobre 3D + wordmark raster)
 * - `light` / `brand` — editorial (monograma + wordmark raster, sem shell)
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
  /**
   * Reduz só o wordmark "AVANT enf" (e o gap até o ícone), sem afetar o
   * ícone — usar quando o lockup precisa caber num espaço estreito (ex.:
   * sidebar). `1` = tamanho padrão do `size`.
   */
  wordmarkScale?: number;
};

/**
 * Abaixo de `AVANT_LOGO_ICON_FLAT_BELOW` (ex.: nav), usa flat para nitidez em tamanho pequeno.
 */
function AvantLogoIcon({ size }: { size: AvantLogoSizeToken }) {
  const iconPx = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.icon.size, size);
  const insetPx = Math.round(iconPx * AVANT_LOGO_ICON_INSET_SCALE);
  const useFlat = size === AVANT_LOGO_ICON_FLAT_BELOW;

  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-visible"
      style={{ width: iconPx, height: iconPx }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={useFlat ? '/brand/avant-logo-ae-flat.png' : '/brand/avant-logo-shield.png'}
        alt=""
        width={insetPx}
        height={insetPx}
        className="h-full w-full select-none object-contain"
        draggable={false}
      />
    </div>
  );
}

/**
 * Wordmark tipográfico "AVANT enf":
 * - Editorial (`light`/`brand`): AVANT preto + enf laranja print
 * - Cyber (`default`): AVANT claro + enf laranja print
 */
function AvantLogoWordmarkStack({
  size,
  wordmarkScale = 1,
  tone,
}: {
  size: AvantLogoSizeToken;
  wordmarkScale?: number;
  tone: AvantLogoTone;
}) {
  const isLight = tone === 'light' || tone === 'brand';
  const fontSize = Math.round(
    scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.wordmark.fontSize, size) * wordmarkScale,
  );
  const enfSize = Math.max(
    10,
    Math.round(scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.subtitle.fontSize, size) * wordmarkScale * 1.35),
  );
  const letterSpacing = getAvantLogoWordmarkLetterSpacing(size) * wordmarkScale;
  const enfTracking = Math.round(
    scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.subtitle.letterSpacingPx, size) * wordmarkScale * 10,
  ) / 10;
  const avantColor = isLight
    ? AVANT_LOGO_COLORS.wordmarkEditorial
    : AVANT_LOGO_COLORS.wordmarkCyber;
  const enfColor = AVANT_LOGO_COLORS.wordmarkEnf;

  return (
    <span
      className="inline-flex min-w-0 shrink items-baseline overflow-visible"
      style={{
        fontFamily: AVANT_LOGO_FONT_FAMILY,
        gap: Math.max(4, Math.round(6 * wordmarkScale)),
        maxWidth: '100%',
      }}
      aria-hidden
    >
      <span
        style={{
          fontSize,
          fontWeight: 800,
          letterSpacing: `${letterSpacing}px`,
          lineHeight: AVANT_LOGO_DIMENSIONS.wordmark.lineHeight,
          color: avantColor,
          whiteSpace: 'nowrap',
        }}
      >
        AVANT
      </span>
      <span
        style={{
          fontSize: enfSize,
          fontWeight: AVANT_LOGO_DIMENSIONS.subtitle.fontWeight,
          letterSpacing: `${enfTracking}px`,
          lineHeight: AVANT_LOGO_DIMENSIONS.subtitle.lineHeight,
          color: enfColor,
          whiteSpace: 'nowrap',
        }}
      >
        {AVANT_LOGO_DIMENSIONS.subtitle.label}
      </span>
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
  const lockupGap = Math.round(
    scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.lockupInner.gap, size) * wordmarkScale,
  );

  const lightLockup = (
    <div
      className="inline-flex shrink-0 items-center overflow-visible"
      style={{
        gap: lockupGap,
      }}
    >
      <AvantLogoIcon size={size} />
      <AvantLogoWordmarkStack size={size} wordmarkScale={wordmarkScale} tone={tone} />
    </div>
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
          gap: lockupGap,
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
        <AvantLogoIcon size={size} />
        <AvantLogoWordmarkStack size={size} wordmarkScale={wordmarkScale} tone={tone} />
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
