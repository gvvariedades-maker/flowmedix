'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  AVANT_LOGO_ANIMATION,
  AVANT_LOGO_COLORS,
  AVANT_LOGO_DIMENSIONS,
  AVANT_LOGO_GRADIENTS,
  AVANT_LOGO_ICON_FLAT_BELOW,
  AVANT_LOGO_ICON_INSET_SCALE,
  AVANT_LOGO_SHELL_SHADOW,
  getAvantLogoLockupPadding,
  getAvantLogoWordmarkRasterSize,
  scaleAvantLogoPx,
  type AvantLogoSizeToken,
} from '@/lib/brand/avantLogoConstants';

export type { AvantLogoSizeToken } from '@/lib/brand/avantLogoConstants';

export type AvantLogoVariant = 'lockup' | 'icon';

/**
 * - `default` — cyber (shell + monograma azul 3D + wordmark raster)
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
 * Wordmark "AVANT enf" — AVANT azul metal 3D + enf verde glass (Canva v4).
 */
function AvantLogoWordmarkStack({ size }: { size: AvantLogoSizeToken }) {
  const { width: widthPx, height: heightPx } = getAvantLogoWordmarkRasterSize(size);

  return (
    <span
      className="inline-flex min-w-0 shrink items-center overflow-visible"
      style={{ height: heightPx, width: widthPx, maxWidth: '100%' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/avant-logo-wordmark-raster.png"
        alt="AVANT enf"
        width={widthPx}
        height={heightPx}
        className="h-full w-full select-none object-contain"
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
}: AvantLogoProps) {
  const isLight = tone === 'light' || tone === 'brand';
  const pulse =
    animated ?? (variant === 'lockup' && size === 'lg' && tone === 'default');

  const iconOnly = variant === 'icon';

  const lightLockup = (
    <div
      className="inline-flex shrink-0 items-center overflow-visible"
      style={{
        gap: scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.lockupInner.gap, size),
      }}
    >
      <AvantLogoIcon size={size} />
      <AvantLogoWordmarkStack size={size} />
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
          gap: scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.lockupInner.gap, size),
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
        <AvantLogoWordmarkStack size={size} />
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
