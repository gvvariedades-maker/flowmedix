'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
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
 * - `default` - cyber (shell + selo forest + wordmark claro)
 * - `light` / `brand` - editorial: slate + ENF + hairline
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

function AvantLogoIcon({ size }: { size: AvantLogoSizeToken }) {
  const iconPx = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.icon.size, size);

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: iconPx, height: iconPx }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/avant-logo-shield.png"
        alt=""
        width={iconPx}
        height={iconPx}
        className="h-full w-full select-none object-contain"
        draggable={false}
      />
    </div>
  );
}

/**
 * Wordmark "AVANT enf" - mesmo modelo e cores do emblema dourado/esmeralda:
 * imagem raster (ouro 3D + "enf" cursivo verde) em vez de texto CSS, para
 * reproduzir fielmente a tipografia do emblema de referencia.
 */
function AvantLogoWordmarkStack({ size }: { size: AvantLogoSizeToken }) {
  const fontSize = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.wordmark.fontSize, size);
  const heightPx = Math.round(fontSize * 1.05);
  const widthPx = Math.round(heightPx * (1465 / 327));

  return (
    <span
      className="inline-flex shrink-0 items-center"
      style={{ height: heightPx, width: widthPx }}
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
  'aria-label': ariaLabel = 'AVANT Enf - inicio',
}: AvantLogoProps) {
  const isLight = tone === 'light' || tone === 'brand';
  const pulse =
    animated ?? (variant === 'lockup' && size === 'lg' && tone === 'default');

  const iconOnly = variant === 'icon';

  const lightLockup = (
    <div
      className="inline-flex shrink-0 items-center"
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

  const rootClass = cn('inline-flex shrink-0 items-center', className);

  if (href) {
    return (
      <Link href={href} className={rootClass} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return <div className={rootClass}>{content}</div>;
}
