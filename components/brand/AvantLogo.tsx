'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  AVANT_AE_MONOGRAM_PATHS,
  AVANT_LOGO_ANIMATION,
  AVANT_LOGO_COLORS,
  AVANT_LOGO_DIMENSIONS,
  AVANT_LOGO_FONT_FAMILY,
  AVANT_LOGO_GRADIENTS,
  AVANT_LOGO_SHELL_SHADOW,
  getAvantLogoLockupPadding,
  getAvantLogoWordmarkLetterSpacing,
  scaleAvantLogoPx,
  type AvantLogoSizeToken,
} from '@/lib/brand/avantLogoConstants';

export type { AvantLogoSizeToken } from '@/lib/brand/avantLogoConstants';

export type AvantLogoVariant = 'lockup' | 'icon';

/**
 * - `default` — cyber (shell + selo forest + wordmark claro)
 * - `light` / `brand` — editorial: slate + ENF + hairline
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

function AvantAeMonogram({ size }: { size: AvantLogoSizeToken }) {
  const iconPx = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.icon.size, size);
  return (
    <svg
      width={iconPx}
      height={iconPx}
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden
      className="absolute inset-0"
    >
      {AVANT_AE_MONOGRAM_PATHS.map((d) => (
        <path key={d} d={d} fill={AVANT_LOGO_COLORS.monogramFill} />
      ))}
    </svg>
  );
}

function AvantLogoIcon({
  size,
  tone,
}: {
  size: AvantLogoSizeToken;
  tone: AvantLogoTone;
}) {
  const iconPx = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.icon.size, size);
  const isEditorial = tone === 'light' || tone === 'brand';

  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        width: iconPx,
        height: iconPx,
        background: AVANT_LOGO_COLORS.iconForestGradient,
        boxShadow: isEditorial
          ? `${AVANT_LOGO_COLORS.iconOuterShadowEditorial}, ${AVANT_LOGO_COLORS.iconInsetHighlight}`
          : `${AVANT_LOGO_COLORS.iconOuterShadowCyber}, ${AVANT_LOGO_COLORS.iconInsetHighlight}`,
      }}
      aria-hidden
    >
      <AvantAeMonogram size={size} />
    </div>
  );
}

function AvantLogoWordmarkStack({
  size,
  tone,
}: {
  size: AvantLogoSizeToken;
  tone: AvantLogoTone;
}) {
  const fontSize = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.wordmark.fontSize, size);
  const letterSpacing = getAvantLogoWordmarkLetterSpacing(size);
  const subtitleSize = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.subtitle.fontSize, size);
  const subtitleTracking = AVANT_LOGO_DIMENSIONS.subtitle.letterSpacingPx;
  const stackGap = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.subtitle.gapFromWordmark, size);
  const subtitleLabel = AVANT_LOGO_DIMENSIONS.subtitle.label;
  const hairlineW = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.subtitle.hairlineWidth, size);
  const hairlineH = AVANT_LOGO_DIMENSIONS.subtitle.hairlineHeight;
  const isEditorial = tone === 'light' || tone === 'brand';

  const wordmarkBase = {
    fontFamily: AVANT_LOGO_FONT_FAMILY,
    fontSize,
    fontWeight: AVANT_LOGO_DIMENSIONS.wordmark.fontWeight,
    lineHeight: AVANT_LOGO_DIMENSIONS.wordmark.lineHeight,
    letterSpacing: `${letterSpacing}px`,
  } as const;

  const subtitleBase = {
    fontFamily: AVANT_LOGO_FONT_FAMILY,
    fontSize: subtitleSize,
    fontWeight: AVANT_LOGO_DIMENSIONS.subtitle.fontWeight,
    lineHeight: AVANT_LOGO_DIMENSIONS.subtitle.lineHeight,
    letterSpacing: `${subtitleTracking}px`,
    textTransform: 'uppercase' as const,
  };

  return (
    <span className="inline-flex shrink-0 flex-col justify-center" style={{ gap: stackGap }}>
      <span
        className="select-none"
        style={{
          ...wordmarkBase,
          color: isEditorial
            ? AVANT_LOGO_COLORS.wordmarkEditorial
            : AVANT_LOGO_COLORS.wordmarkCyber,
        }}
      >
        AVANT
      </span>
      <span className="inline-flex items-center" style={{ gap: Math.max(6, Math.round(stackGap * 1.2)) }}>
        <span
          aria-hidden
          style={{
            width: hairlineW,
            height: hairlineH,
            borderRadius: 1,
            background: isEditorial
              ? AVANT_LOGO_COLORS.hairlineEditorial
              : AVANT_LOGO_COLORS.hairlineCyber,
          }}
        />
        <span
          className="select-none"
          style={{
            ...subtitleBase,
            color: isEditorial
              ? AVANT_LOGO_COLORS.subtitleEditorial
              : AVANT_LOGO_COLORS.subtitleCyber,
          }}
        >
          {subtitleLabel}
        </span>
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
  'aria-label': ariaLabel = 'AVANT Enf — início',
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
      <AvantLogoIcon size={size} tone={tone} />
      <AvantLogoWordmarkStack size={size} tone={tone} />
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
        <AvantLogoIcon size={size} tone={tone} />
        <AvantLogoWordmarkStack size={size} tone={tone} />
      </div>
    </div>
  );

  const content = iconOnly ? (
    <AvantLogoIcon size={size} tone={tone} />
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
