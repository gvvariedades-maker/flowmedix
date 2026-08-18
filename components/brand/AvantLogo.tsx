'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  AVANT_LOGO_ANIMATION,
  AVANT_LOGO_COLORS,
  AVANT_LOGO_DIMENSIONS,
  AVANT_LOGO_GRADIENTS,
  AVANT_LOGO_ICON_INSET_SCALE,
  AVANT_LOGO_PNG,
  AVANT_LOGO_SHELL_SHADOW,
  getAvantLogoLockupPadding,
  scaleAvantLogoPx,
  type AvantLogoSizeToken,
} from '@/lib/brand/avantLogoConstants';

export type { AvantLogoSizeToken } from '@/lib/brand/avantLogoConstants';

export type AvantLogoVariant = 'lockup' | 'icon';

/**
 * - `default` — cyber (shell + PNGs de marca)
 * - `light` / `brand` — editorial (PNGs de marca, sem shell)
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

/** Card laranja + A partido branco — PNG oficial. */
function AvantLogoIcon({ size }: { size: AvantLogoSizeToken }) {
  const iconPx = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.icon.size, size);
  const insetPx = Math.round(iconPx * AVANT_LOGO_ICON_INSET_SCALE);

  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-visible"
      style={{ width: iconPx, height: iconPx }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- brand PNG lockup */}
      <img
        src={AVANT_LOGO_PNG.aMark}
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
 * Wordmark PNG "AVANT" + "enf" oficiais.
 * Editorial: AVANT escuro; cyber: AVANT claro.
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
  const avantH = Math.max(
    14,
    Math.round(fontSize * AVANT_LOGO_PNG.avantWordHeightScale),
  );
  const avantW = Math.round(avantH * AVANT_LOGO_PNG.avantWordAspect);
  const enfH = Math.max(
    11,
    Math.round(
      fontSize *
        AVANT_LOGO_DIMENSIONS.subtitle.scaleOfWordmark *
        AVANT_LOGO_PNG.enfHeightScale,
    ),
  );
  const enfW = Math.round(enfH * AVANT_LOGO_PNG.enfAspect);
  const avantSrc = isLight ? AVANT_LOGO_PNG.avantWord : AVANT_LOGO_PNG.avantWordOnDark;

  return (
    <span
      className="inline-flex min-w-0 shrink items-center overflow-visible"
      style={{
        gap: Math.max(
          3,
          Math.round(
            AVANT_LOGO_DIMENSIONS.subtitle.gapFromWordmark *
              wordmarkScale *
              AVANT_LOGO_PNG.subtitleGapScale,
          ),
        ),
        maxWidth: '100%',
      }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- brand PNG lockup */}
      <img
        src={avantSrc}
        alt=""
        width={avantW}
        height={avantH}
        className="select-none object-contain object-left"
        style={{ height: avantH, width: 'auto', maxWidth: avantW }}
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- brand PNG lockup */}
      <img
        src={AVANT_LOGO_PNG.enf}
        alt=""
        width={enfW}
        height={enfH}
        className="select-none object-contain object-left"
        style={{ height: enfH, width: 'auto', maxWidth: enfW }}
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
