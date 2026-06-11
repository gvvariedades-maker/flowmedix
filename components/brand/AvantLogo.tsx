'use client';

import Link from 'next/link';
import { useId } from 'react';
import { cn } from '@/lib/utils';
import {
  AVANT_LOGO_ANIMATION,
  AVANT_LOGO_BOLT,
  AVANT_LOGO_COLORS,
  AVANT_LOGO_DIMENSIONS,
  AVANT_LOGO_FONT_FAMILY,
  AVANT_LOGO_GRADIENTS,
  AVANT_LOGO_SHELL_SHADOW,
  getAvantLogoLockupPadding,
  scaleAvantLogoPx,
  type AvantLogoSizeToken,
} from '@/lib/brand/avantLogoConstants';

export type AvantLogoVariant = 'lockup' | 'icon';

/** `light` = auth editorial (#f8fafc): lockup sem chip, wordmark escuro, verde só no raio */
export type AvantLogoTone = 'default' | 'light';

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

function AvantLogoIcon({
  size,
  gradientId,
}: {
  size: AvantLogoSizeToken;
  gradientId: string;
}) {
  const iconPx = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.icon.size, size);
  const radius = scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.icon.radius, size);
  const boltHeight = Math.round(iconPx * AVANT_LOGO_DIMENSIONS.icon.boltInsetRatio);
  const boltWidth = Math.round(boltHeight * (AVANT_LOGO_BOLT.width / AVANT_LOGO_BOLT.height));

  return (
    <div
      className="relative shrink-0"
      style={{
        width: iconPx,
        height: iconPx,
        borderRadius: radius,
        background: AVANT_LOGO_GRADIENTS.icon,
        boxShadow: '0 4px 16px rgba(48, 24, 200, 0.35)',
      }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: '42%',
          borderRadius: `${radius}px ${radius}px 0 0`,
          background: AVANT_LOGO_COLORS.iconSheen,
        }}
      />
      <svg
        viewBox={AVANT_LOGO_BOLT.viewBox}
        width={boltWidth}
        height={boltHeight}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={AVANT_LOGO_GRADIENTS.boltStops[0]} />
            <stop offset="52%" stopColor={AVANT_LOGO_GRADIENTS.boltStops[1]} />
            <stop offset="100%" stopColor={AVANT_LOGO_GRADIENTS.boltStops[2]} />
          </linearGradient>
        </defs>
        <polygon
          points={AVANT_LOGO_BOLT.polygon}
          fill={`url(#${gradientId})`}
        />
        <polygon
          points={AVANT_LOGO_BOLT.polygon}
          fill={AVANT_LOGO_COLORS.boltHighlight}
          style={{ mixBlendMode: 'soft-light' }}
        />
      </svg>
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
  const letterSpacing = Math.round(
    AVANT_LOGO_DIMENSIONS.wordmark.letterSpacingPx * (fontSize / AVANT_LOGO_DIMENSIONS.wordmark.fontSize),
  );

  const baseStyle = {
    fontFamily: AVANT_LOGO_FONT_FAMILY,
    fontSize,
    fontWeight: AVANT_LOGO_DIMENSIONS.wordmark.fontWeight,
    lineHeight: AVANT_LOGO_DIMENSIONS.wordmark.lineHeight,
    letterSpacing: `${letterSpacing}px`,
  };

  if (tone === 'light') {
    return (
      <span
        className="shrink-0 select-none uppercase"
        style={{
          ...baseStyle,
          color: AVANT_LOGO_COLORS.wordmarkLight,
        }}
      >
        AVANT
      </span>
    );
  }

  return (
    <span
      className="shrink-0 select-none uppercase"
      style={{
        ...baseStyle,
        backgroundImage: AVANT_LOGO_GRADIENTS.wordmark,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        textShadow: `0 0 18px ${AVANT_LOGO_COLORS.wordmarkGlow}`,
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
  const uid = useId().replace(/:/g, '');
  const boltGradientId = `avant-bolt-${uid}`;
  const isLight = tone === 'light';
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
      <AvantLogoIcon size={size} gradientId={boltGradientId} />
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
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="shrink-0 self-stretch"
          style={{
            width: scaleAvantLogoPx(AVANT_LOGO_DIMENSIONS.lockupInner.accentBarWidth, size),
            borderRadius: 2,
            background: AVANT_LOGO_COLORS.accentBar,
            boxShadow: `0 0 10px ${AVANT_LOGO_COLORS.accentBarGlow}`,
          }}
          aria-hidden
        />
        <AvantLogoIcon size={size} gradientId={boltGradientId} />
        <AvantLogoWordmark size={size} tone={tone} />
      </div>
    </div>
  );

  const content = iconOnly ? (
    <AvantLogoIcon size={size} gradientId={boltGradientId} />
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
