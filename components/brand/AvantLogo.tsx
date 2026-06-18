'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
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
 * - `default` — cyber (gradiente no wordmark + shell escuro no lockup)
 * - `light` — auth editorial: wordmark `#0f172a`
 * - `brand` — dashboard editorial: wordmark `#166534` (mesma regra do chip)
 */
export type AvantLogoTone = 'default' | 'light' | 'brand';

export type AvantLogoProps = {
  variant?: AvantLogoVariant;
  size?: AvantLogoSizeToken;
  tone?: AvantLogoTone;
  /** Default: true apenas em lockup cyber + size lg */
  animated?: boolean;
  href?: string;
  className?: string;
  'aria-label'?: string;
};

function AvantLogoIcon({ size }: { size: AvantLogoSizeToken }) {
  const iconPx = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.icon.size, size);
  const radius = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.icon.radius, size);
  const fontSize = Math.round(iconPx * 0.48);
  const sheenHeight = Math.round(iconPx * AVANT_LOGO_COLORS.iconSheenHeightRatio);

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{
        width: iconPx,
        height: iconPx,
        borderRadius: radius,
        background: AVANT_LOGO_GRADIENTS.icon,
        boxShadow: `${AVANT_LOGO_COLORS.iconOuterShadow}, inset 0 1px 0 ${AVANT_LOGO_COLORS.iconInsetHighlight}, inset 0 -1px 0 ${AVANT_LOGO_COLORS.iconInsetShadow}`,
      }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: sheenHeight,
          borderRadius: `${radius}px ${radius}px 0 0`,
          background: AVANT_LOGO_COLORS.iconSheen,
        }}
      />
      <span
        className="relative select-none text-white"
        style={{
          fontFamily: AVANT_LOGO_FONT_FAMILY,
          fontWeight: 800,
          fontSize,
          lineHeight: 1,
          textShadow: AVANT_LOGO_COLORS.iconLetterShadow,
          transform: `translateY(${AVANT_LOGO_COLORS.iconLetterOffsetY}px)`,
        }}
      >
        A
      </span>
    </div>
  );
}

function AvantLogoWordmark({
  size,
  tone,
}: {
  size: AvantLogoSizeToken;
  tone: AvantLogoTone;
}) {
  const fontSize = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.wordmark.fontSize, size);
  const letterSpacing = getAvantLogoWordmarkLetterSpacing(size);

  const baseStyle = {
    fontFamily: AVANT_LOGO_FONT_FAMILY,
    fontSize,
    fontWeight: AVANT_LOGO_DIMENSIONS.wordmark.fontWeight,
    lineHeight: AVANT_LOGO_DIMENSIONS.wordmark.lineHeight,
    letterSpacing: `${letterSpacing}px`,
  };

  if (tone === 'light' || tone === 'brand') {
    return (
      <span
        className="shrink-0 select-none"
        style={{
          ...baseStyle,
          color:
            tone === 'brand'
              ? AVANT_LOGO_COLORS.wordmarkEditorial
              : AVANT_LOGO_COLORS.wordmarkLight,
        }}
      >
        AVANT
      </span>
    );
  }

  return (
    <span
      className="shrink-0 select-none"
      style={{
        ...baseStyle,
        backgroundImage: AVANT_LOGO_GRADIENTS.wordmark,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: `drop-shadow(0 0 12px ${AVANT_LOGO_COLORS.wordmarkGlow})`,
      }}
    >
      AVANT
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
  'aria-label': ariaLabel = 'AVANT — início',
}: AvantLogoProps) {
  const isLight = tone === 'light' || tone === 'brand';
  const pulse =
    animated ?? (variant === 'lockup' && size === 'lg' && tone === 'default');

  const iconOnly = variant === 'icon';
  const accentGlowPx = scaleAvantLogoPx(10, size);

  const lightLockup = (
    <div
      className="inline-flex shrink-0 items-center"
      style={{
        gap: scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.lockupInner.gap, size),
      }}
    >
      <AvantLogoIcon size={size} />
      <AvantLogoWordmark size={size} tone={tone} />
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
            borderRadius: 2,
            background: AVANT_LOGO_COLORS.accentBar,
            boxShadow: `0 0 ${accentGlowPx}px ${AVANT_LOGO_COLORS.accentBarGlow}`,
          }}
          aria-hidden
        />
        <AvantLogoIcon size={size} />
        <AvantLogoWordmark size={size} tone={tone} />
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
