'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';
import { DEVICE_SVG_LAYOUTS, type DeviceFrameVariant } from '@/components/marketing/deviceSvgLayouts';

type DeviceSvgOverlayProps = {
  variant: DeviceFrameVariant;
  className?: string;
  minimalChrome?: boolean;
};

function PhoneOverlay({ maskId, bezelGradId }: { maskId: string; bezelGradId: string }) {
  return (
    <g mask={`url(#${maskId})`}>
      <rect width="390" height="780" rx="52" fill={`url(#${bezelGradId})`} />
      <rect x="-2" y="168" width="4" height="44" rx="2" fill="#0a0c10" />
      <rect x="-2" y="228" width="4" height="64" rx="2" fill="#0a0c10" />
      <rect x="388" y="198" width="4" height="72" rx="2" fill="#0a0c10" />
      <rect x="5" y="18" width="3" height="744" rx="1.5" fill="white" opacity="0.1" />
      <rect x="382" y="18" width="2" height="744" rx="1" fill="black" opacity="0.28" />
    </g>
  );
}

function PhoneChrome() {
  return (
    <>
      <rect x="145" y="18" width="100" height="28" rx="14" fill="#080a0e" />
      <circle cx="210" cy="32" r="4" fill="#1a2030" />
      <rect x="148" y="748" width="94" height="5" rx="2.5" fill="white" opacity="0.32" />
    </>
  );
}

/** Tablet portrait (560×720). */
function TabletOverlay({ maskId, bezelGradId }: { maskId: string; bezelGradId: string }) {
  return (
    <g mask={`url(#${maskId})`}>
      <rect width="560" height="720" rx="32" fill={`url(#${bezelGradId})`} />
      <rect x="-2" y="120" width="4" height="52" rx="2" fill="#0a0c10" />
      <rect x="558" y="160" width="4" height="72" rx="2" fill="#0a0c10" />
      <rect x="6" y="14" width="3" height="692" rx="1.5" fill="white" opacity="0.09" />
      <rect x="551" y="14" width="2" height="692" rx="1" fill="black" opacity="0.26" />
    </g>
  );
}

function TabletChrome() {
  return (
    <>
      <circle cx="280" cy="22" r="5" fill="#080a0e" />
      <circle cx="280" cy="22" r="2.5" fill="#222830" />
    </>
  );
}

function LaptopOverlay({
  maskId,
  minimalChrome,
  lidGradId,
  baseGradId,
}: {
  maskId: string;
  minimalChrome?: boolean;
  lidGradId: string;
  baseGradId: string;
}) {
  const chromeH = minimalChrome ? 28 : 40;

  return (
    <>
      {/* Base / teclado */}
      <path
        d="M 48 432 L 912 432 L 936 472 L 24 472 Z"
        fill={`url(#${baseGradId})`}
        stroke="#b8bcc4"
        strokeWidth="1"
      />
      <rect x="24" y="472" width="912" height="12" rx="4" fill="#c8ccd4" />
      <ellipse cx="480" cy="484" rx="120" ry="3" fill="#9ca3af" opacity="0.45" />
      <rect x="380" y="438" width="200" height="28" rx="4" fill="#a8adb8" opacity="0.4" />

      <g mask={`url(#${maskId})`}>
        <rect x="0" y="0" width="960" height="432" rx="14" fill={`url(#${lidGradId})`} stroke="#c8ccd4" strokeWidth="1.5" />
        <rect x="10" y="10" width="940" height="412" rx="10" fill="#12151c" />
      </g>

      {!minimalChrome ? (
        <g>
          <rect x="10" y="10" width="940" height="36" rx="10" fill="#f1f5f9" />
          <rect x="10" y="38" width="940" height="8" fill="#f1f5f9" />
          <circle cx="34" cy="28" r="5" fill="#ff5f57" opacity="0.92" />
          <circle cx="52" cy="28" r="5" fill="#febc2e" opacity="0.92" />
          <circle cx="70" cy="28" r="5" fill="#28c840" opacity="0.92" />
          <rect x="380" y="20" width="200" height="16" rx="8" fill="#e2e8f0" />
        </g>
      ) : (
        <g>
          <rect x="10" y="10" width="940" height={chromeH} rx="10" fill="#f8fafc" />
          <circle cx="34" cy="24" r="5" fill="#ff5f57" opacity="0.92" />
          <circle cx="52" cy="24" r="5" fill="#febc2e" opacity="0.92" />
          <circle cx="70" cy="24" r="5" fill="#28c840" opacity="0.92" />
        </g>
      )}
    </>
  );
}

function FrameMask({
  maskId,
  variant,
}: {
  maskId: string;
  variant: DeviceFrameVariant;
}) {
  const { viewBox, screen } = DEVICE_SVG_LAYOUTS[variant];
  const holeX = (screen.left / 100) * viewBox.w;
  const holeY = (screen.top / 100) * viewBox.h;
  const holeW = (screen.width / 100) * viewBox.w;
  const holeH = (screen.height / 100) * viewBox.h;
  const rx = variant === 'phone' ? 44 : variant === 'tablet' ? 20 : 6;

  return (
    <mask id={maskId}>
      <rect width={viewBox.w} height={viewBox.h} fill="white" />
      <rect x={holeX} y={holeY} width={holeW} height={holeH} rx={rx} fill="black" />
    </mask>
  );
}

function ScreenGlossSvg({
  variant,
  glossId,
}: {
  variant: DeviceFrameVariant;
  glossId: string;
}) {
  const { viewBox, screen } = DEVICE_SVG_LAYOUTS[variant];
  const x = (screen.left / 100) * viewBox.w;
  const y = (screen.top / 100) * viewBox.h;
  const w = (screen.width / 100) * viewBox.w;
  const h = (screen.height / 100) * viewBox.h;
  const rx = variant === 'phone' ? 44 : variant === 'tablet' ? 20 : 6;

  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={rx}
      fill={`url(#${glossId})`}
      pointerEvents="none"
    />
  );
}

function BezelGradient({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#2e3545" />
      <stop offset="45%" stopColor="#181c26" />
      <stop offset="100%" stopColor="#0a0c12" />
    </linearGradient>
  );
}

function LidGradient({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#eef0f4" />
      <stop offset="100%" stopColor="#d8dce4" />
    </linearGradient>
  );
}

function BaseGradient({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#d4d8e0" />
      <stop offset="100%" stopColor="#b0b5c0" />
    </linearGradient>
  );
}

export function DeviceSvgOverlay({ variant, className, minimalChrome }: DeviceSvgOverlayProps) {
  const uid = useId().replace(/:/g, '');
  const maskId = `device-mask-${variant}-${uid}`;
  const bezelGradId = `bezel-grad-${uid}`;
  const lidGradId = `lid-grad-${uid}`;
  const baseGradId = `base-grad-${uid}`;
  const glossId = `screen-gloss-${uid}`;
  const { viewBox } = DEVICE_SVG_LAYOUTS[variant];

  return (
    <svg
      className={cn('pointer-events-none absolute inset-0 z-20 h-full w-full', className)}
      viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <FrameMask maskId={maskId} variant={variant} />
        <BezelGradient id={bezelGradId} />
        <LidGradient id={lidGradId} />
        <BaseGradient id={baseGradId} />
        <linearGradient id={glossId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity={variant === 'tablet' ? '0.07' : '0.12'} />
          <stop offset="50%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {variant === 'phone' ? <PhoneOverlay maskId={maskId} bezelGradId={bezelGradId} /> : null}
      {variant === 'tablet' ? <TabletOverlay maskId={maskId} bezelGradId={bezelGradId} /> : null}
      {variant === 'laptop' ? (
        <LaptopOverlay
          maskId={maskId}
          minimalChrome={minimalChrome}
          lidGradId={lidGradId}
          baseGradId={baseGradId}
        />
      ) : null}

      {variant === 'phone' ? <PhoneChrome /> : null}
      {variant === 'tablet' ? <TabletChrome /> : null}
      <ScreenGlossSvg variant={variant} glossId={glossId} />
    </svg>
  );
}
