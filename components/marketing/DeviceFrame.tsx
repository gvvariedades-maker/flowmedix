'use client';

import type { ReactNode } from 'react';
import { DeviceScreen } from '@/components/marketing/DeviceScreen';
import { DeviceSvgOverlay } from '@/components/marketing/DeviceSvgOverlay';
import { DEVICE_SVG_LAYOUTS, type DeviceFrameVariant } from '@/components/marketing/deviceSvgLayouts';
import { cn } from '@/lib/utils';

export type { DeviceFrameVariant };

/** Sombra no device + projeção no plano (Estudei-style). */
const DEVICE_CSS_SHADOW: Record<DeviceFrameVariant, string> = {
  phone:
    'shadow-[0_40px_80px_-12px_rgba(15,23,42,0.55),0_16px_32px_-6px_rgba(15,23,42,0.35)]',
  tablet:
    'shadow-[0_44px_88px_-14px_rgba(15,23,42,0.52),0_18px_36px_-8px_rgba(15,23,42,0.32)]',
  laptop:
    'shadow-[0_48px_96px_-16px_rgba(15,23,42,0.45),0_24px_48px_-10px_rgba(15,23,42,0.28)]',
};

type DeviceFrameProps = {
  variant: DeviceFrameVariant;
  children: ReactNode;
  className?: string;
  screenClassName?: string;
  label?: string;
  minimalChrome?: boolean;
  /** Sombra elíptica projetada no "chão". */
  showGroundShadow?: boolean;
  /**
   * `canvas` — escala conteúdo React via resolução lógica (previews).
   * `cover` — filho preenche a tela (screenshots com object-cover).
   */
  screenMode?: 'canvas' | 'cover';
};

/**
 * Moldura SVG com tela recortada — conteúdo React atrás, overlay na frente.
 */
export function DeviceFrame({
  variant,
  children,
  className,
  screenClassName,
  label,
  minimalChrome = false,
  showGroundShadow = true,
  screenMode = 'canvas',
}: DeviceFrameProps) {
  const layout = DEVICE_SVG_LAYOUTS[variant];
  const { screen } = layout;

  return (
    <div className="relative w-full">
      <div
        className={cn(
          'relative w-full transform-gpu rounded-[2rem]',
          DEVICE_CSS_SHADOW[variant],
          className,
        )}
        style={{ aspectRatio: layout.aspectRatio }}
        aria-label={label}
        role={label ? 'img' : undefined}
      >
        <div
          className={cn('absolute z-0 overflow-hidden bg-[#f8fafc]', screenClassName)}
          style={{
            top: `${screen.top}%`,
            left: `${screen.left}%`,
            width: `${screen.width}%`,
            height: `${screen.height}%`,
            borderRadius: screen.borderRadius,
          }}
        >
          {screenMode === 'cover' ? (
            children
          ) : (
            <DeviceScreen logicalWidth={layout.logicalWidth} logicalHeight={layout.logicalHeight}>
              {children}
            </DeviceScreen>
          )}
        </div>

        <DeviceSvgOverlay variant={variant} minimalChrome={minimalChrome} />
      </div>

      {showGroundShadow ? (
        <div
          className="pointer-events-none absolute -bottom-[4%] left-1/2 z-[-1] h-5 w-[88%] -translate-x-1/2 rounded-[50%] bg-slate-900/22 blur-2xl"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
