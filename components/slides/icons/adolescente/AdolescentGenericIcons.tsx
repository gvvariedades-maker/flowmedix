'use client';

import { useId, type ReactNode, type SVGProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * Ícones soft-3D — Saúde do Adolescente (ramo generico).
 * Gramática: CalcMedIcons (viewBox 64, shine + shadow leve).
 * Refs: @docs/design-refs/svg-models/lucide/{heart,stethoscope,shield-check,circle,check}.svg
 */

export type AgIconTone =
  | 'emerald'
  | 'sky'
  | 'indigo'
  | 'orange'
  | 'rose'
  | 'teal'
  | 'navy'
  | 'amber'
  | 'white';

export const AG_ICON_PALETTE: Record<
  AgIconTone,
  { ink: string; mid: string; soft: string; paper: string; deep: string }
> = {
  emerald: { ink: '#047857', mid: '#10B981', soft: '#A7F3D0', paper: '#FFFFFF', deep: '#065F46' },
  sky: { ink: '#0369A1', mid: '#0EA5E9', soft: '#BAE6FD', paper: '#FFFFFF', deep: '#0C4A6E' },
  indigo: { ink: '#4338CA', mid: '#6366F1', soft: '#C7D2FE', paper: '#FFFFFF', deep: '#312E81' },
  orange: { ink: '#C2410C', mid: '#F97316', soft: '#FED7AA', paper: '#FFFFFF', deep: '#9A3412' },
  rose: { ink: '#BE123C', mid: '#F43F5E', soft: '#FECDD3', paper: '#FFFFFF', deep: '#9F1239' },
  teal: { ink: '#0F766E', mid: '#14B8A6', soft: '#99F6E4', paper: '#FFFFFF', deep: '#115E59' },
  navy: { ink: '#0B3A6E', mid: '#1A73E8', soft: '#BFDBFE', paper: '#FFFFFF', deep: '#082F54' },
  amber: { ink: '#B45309', mid: '#F59E0B', soft: '#FDE68A', paper: '#FFFFFF', deep: '#92400E' },
  white: { ink: '#A7F3D0', mid: '#6EE7B7', soft: '#ECFDF5', paper: '#FFFFFF', deep: '#34D399' },
};

type BaseProps = SVGProps<SVGSVGElement> & {
  title?: string;
  className?: string;
  tone?: AgIconTone;
};

type IconIds = { shine: string; shadow: string };

function IconBase({
  title,
  className,
  children,
  ...rest
}: Omit<BaseProps, 'children'> & { children: (ids: IconIds) => ReactNode }) {
  const uid = useId().replace(/:/g, '');
  const ids: IconIds = {
    shine: `agShine-${uid}`,
    shadow: `agShadow-${uid}`,
  };
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      className={cn('h-7 w-7 shrink-0', className)}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={ids.shine} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.1" />
        </linearGradient>
        <filter id={ids.shadow} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1.1" floodOpacity="0.22" />
        </filter>
      </defs>
      {children(ids)}
    </svg>
  );
}

function p(tone: AgIconTone = 'navy') {
  return AG_ICON_PALETTE[tone];
}

/** Escuta — balões sobrepostos. */
export function AgMessages({ tone = 'emerald', className, title, ...rest }: BaseProps) {
  const c = p(tone);
  return (
    <IconBase title={title} className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <path
            d="M14 18h28a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H30l-8 7v-7h-8a6 6 0 0 1-6-6V24a6 6 0 0 1 6-6z"
            fill={c.soft}
            stroke={c.ink}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M26 12h22a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5h-5l-6 5.5V30h-11a5 5 0 0 1-5-5v-8a5 5 0 0 1 5-5z"
            fill={c.paper}
            stroke={c.ink}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M32 20h10M32 25h7" stroke={c.mid} strokeWidth="2" strokeLinecap="round" />
          <rect x="16" y="20" width="5" height="18" rx="2.5" fill={`url(#${ids.shine})`} />
        </g>
      )}
    </IconBase>
  );
}

/** Pré-natal — calendário + plus. */
export function AgCalendarPlus({ tone = 'sky', className, title, ...rest }: BaseProps) {
  const c = p(tone);
  return (
    <IconBase title={title} className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <rect x="12" y="16" width="40" height="36" rx="7" fill={c.paper} stroke={c.ink} strokeWidth="2.2" />
          <rect x="12" y="16" width="40" height="12" rx="7" fill={c.mid} />
          <rect x="12" y="22" width="40" height="6" fill={c.mid} />
          <path d="M22 12v8M42 12v8" stroke={c.ink} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="24" cy="36" r="2.2" fill={c.soft} />
          <circle cx="32" cy="36" r="2.2" fill={c.soft} />
          <circle cx="40" cy="36" r="2.2" fill={c.soft} />
          <circle cx="24" cy="44" r="2.2" fill={c.soft} />
          <path
            d="M40 42v8M36 46h8"
            stroke={c.deep}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <rect x="14" y="18" width="6" height="30" rx="3" fill={`url(#${ids.shine})`} />
        </g>
      )}
    </IconBase>
  );
}

/** Sigilo — cadeado keyhole. */
export function AgLockKeyhole({ tone = 'emerald', className, title, ...rest }: BaseProps) {
  const c = p(tone);
  return (
    <IconBase title={title} className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <path
            d="M20 28v-6a12 12 0 0 1 24 0v6"
            stroke={c.ink}
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M20 28v-6a12 12 0 0 1 24 0v6"
            stroke={c.mid}
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="14" y="28" width="36" height="26" rx="7" fill={c.mid} stroke={c.ink} strokeWidth="2.2" />
          <circle cx="32" cy="39" r="4.2" fill={c.paper} />
          <path d="M32 42v6" stroke={c.paper} strokeWidth="3" strokeLinecap="round" />
          <rect x="16" y="30" width="6" height="20" rx="3" fill={`url(#${ids.shine})`} />
        </g>
      )}
    </IconBase>
  );
}

/** Contracepção / vínculo — coração + pulso. */
export function AgHeartPulse({ tone = 'sky', className, title, ...rest }: BaseProps) {
  const c = p(tone);
  return (
    <IconBase title={title} className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <path
            d="M32 52S10 38 10 22.5A10.5 10.5 0 0 1 32 16a10.5 10.5 0 0 1 22 6.5C54 38 32 52 32 52z"
            fill={c.mid}
            stroke={c.ink}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M16 34h8l3-7 5 14 3-7h9"
            stroke={c.paper}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="20" r="3" fill="#fff" opacity="0.35" />
          <path d="M18 24c4-6 10-8 14-4" stroke={`url(#${ids.shine})`} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        </g>
      )}
    </IconBase>
  );
}

/** Hub — cruz clínica. */
export function AgCross({ tone = 'teal', className, title, ...rest }: BaseProps) {
  const c = p(tone);
  return (
    <IconBase title={title} className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <rect x="10" y="10" width="44" height="44" rx="12" fill={c.soft} stroke={c.ink} strokeWidth="2" />
          <rect x="27" y="16" width="10" height="32" rx="3" fill={c.mid} stroke={c.ink} strokeWidth="1.6" />
          <rect x="16" y="27" width="32" height="10" rx="3" fill={c.mid} stroke={c.ink} strokeWidth="1.6" />
          <rect x="29" y="18" width="3" height="28" rx="1.5" fill={`url(#${ids.shine})`} />
        </g>
      )}
    </IconBase>
  );
}

/** Chip header — mãos + coração. */
export function AgHeartHandshake({ tone = 'white', className, title, ...rest }: BaseProps) {
  const c = p(tone);
  return (
    <IconBase title={title} className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <path
            d="M32 28S22 20 18 24c-3 3-2 8 2 11l12 10 12-10c4-3 5-8 2-11-4-4-14 4-14 4z"
            fill={c.mid}
            stroke={c.ink}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M14 40c4 2 8 3 12 2M50 40c-4 2-8 3-12 2"
            stroke={c.ink}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M18 36c2 4 6 7 10 8M46 36c-2 4-6 7-10 8"
            stroke={c.soft}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="26" cy="22" r="2" fill="#fff" opacity="0.4" />
        </g>
      )}
    </IconBase>
  );
}

/** Atenção primária — casa. */
export function AgHouse({ tone = 'teal', className, title, ...rest }: BaseProps) {
  const c = p(tone);
  return (
    <IconBase title={title} className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <path
            d="M8 30L32 12l24 18"
            stroke={c.ink}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 28v22a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V28"
            fill={c.soft}
            stroke={c.ink}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <rect x="26" y="36" width="12" height="18" rx="2" fill={c.mid} stroke={c.ink} strokeWidth="1.8" />
          <rect x="18" y="34" width="8" height="8" rx="1.5" fill={c.paper} stroke={c.ink} strokeWidth="1.4" />
          <rect x="38" y="34" width="8" height="8" rx="1.5" fill={c.paper} stroke={c.ink} strokeWidth="1.4" />
          <rect x="16" y="30" width="5" height="20" rx="2.5" fill={`url(#${ids.shine})`} />
        </g>
      )}
    </IconBase>
  );
}

/** Atenção secundária — estetoscópio. */
export function AgStethoscope({ tone = 'sky', className, title, ...rest }: BaseProps) {
  const c = p(tone);
  return (
    <IconBase title={title} className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <path
            d="M22 10v6a10 10 0 0 0 20 0v-6"
            stroke={c.ink}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path d="M22 10h4M38 10h4" stroke={c.mid} strokeWidth="2.6" strokeLinecap="round" />
          <path
            d="M32 26v6a10 10 0 0 0 10 10h2"
            stroke={c.ink}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="48" cy="42" r="8" fill={c.soft} stroke={c.ink} strokeWidth="2.2" />
          <circle cx="48" cy="42" r="3.2" fill={c.mid} />
          <circle cx="46.5" cy="40.5" r="1.2" fill="#fff" opacity="0.5" />
          <path d="M24 14c0 8 4 12 8 12" stroke={`url(#${ids.shine})`} strokeWidth="3" opacity="0.35" />
        </g>
      )}
    </IconBase>
  );
}

/** Atenção terciária — hospital. */
export function AgHospital({ tone = 'indigo', className, title, ...rest }: BaseProps) {
  const c = p(tone);
  return (
    <IconBase title={title} className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <rect x="12" y="18" width="40" height="36" rx="5" fill={c.soft} stroke={c.ink} strokeWidth="2.2" />
          <path d="M22 18V12h20v6" stroke={c.ink} strokeWidth="2.2" strokeLinejoin="round" />
          <rect x="28" y="8" width="8" height="10" rx="1.5" fill={c.mid} stroke={c.ink} strokeWidth="1.6" />
          <path d="M32 10v6M29 13h6" stroke={c.paper} strokeWidth="2" strokeLinecap="round" />
          <rect x="18" y="26" width="8" height="8" rx="1.5" fill={c.paper} stroke={c.ink} strokeWidth="1.4" />
          <rect x="28" y="26" width="8" height="8" rx="1.5" fill={c.paper} stroke={c.ink} strokeWidth="1.4" />
          <rect x="38" y="26" width="8" height="8" rx="1.5" fill={c.paper} stroke={c.ink} strokeWidth="1.4" />
          <rect x="18" y="38" width="8" height="8" rx="1.5" fill={c.paper} stroke={c.ink} strokeWidth="1.4" />
          <rect x="38" y="38" width="8" height="8" rx="1.5" fill={c.paper} stroke={c.ink} strokeWidth="1.4" />
          <rect x="27" y="40" width="10" height="14" rx="2" fill={c.mid} stroke={c.ink} strokeWidth="1.6" />
          <rect x="14" y="20" width="5" height="30" rx="2.5" fill={`url(#${ids.shine})`} />
        </g>
      )}
    </IconBase>
  );
}

/** Check em círculo. */
export function AgCircleCheck({ tone = 'emerald', className, title, ...rest }: BaseProps) {
  const c = p(tone);
  return (
    <IconBase title={title} className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <circle cx="32" cy="32" r="20" fill={c.mid} stroke={c.ink} strokeWidth="2.2" />
          <path
            d="M22 33l7 7 14-16"
            stroke={c.paper}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="26" cy="24" r="4" fill="#fff" opacity="0.28" />
        </g>
      )}
    </IconBase>
  );
}

/** Escudo check. */
export function AgShieldCheck({ tone = 'teal', className, title, ...rest }: BaseProps) {
  const c = p(tone);
  return (
    <IconBase title={title} className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <path
            d="M32 8l18 6v14c0 12-8 20-18 24C22 48 14 40 14 28V14l18-6z"
            fill={c.soft}
            stroke={c.ink}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M24 32l6 6 12-14"
            stroke={c.deep}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M20 16l8-3" stroke={`url(#${ids.shine})`} strokeWidth="4" strokeLinecap="round" opacity="0.45" />
        </g>
      )}
    </IconBase>
  );
}

/** Pegadinha — escudo ban. */
export function AgShieldBan({ tone = 'orange', className, title, ...rest }: BaseProps) {
  const c = p(tone);
  return (
    <IconBase title={title} className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <path
            d="M32 8l18 6v14c0 12-8 20-18 24C22 48 14 40 14 28V14l18-6z"
            fill={c.soft}
            stroke={c.ink}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M22 22l20 20M42 22L22 42" stroke={c.deep} strokeWidth="3" strokeLinecap="round" />
          <path d="M20 16l8-3" stroke={`url(#${ids.shine})`} strokeWidth="4" strokeLinecap="round" opacity="0.4" />
        </g>
      )}
    </IconBase>
  );
}

/** Pegadinha — alerta em balão. */
export function AgMessageWarning({ tone = 'orange', className, title, ...rest }: BaseProps) {
  const c = p(tone);
  return (
    <IconBase title={title} className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <path
            d="M12 16h40a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H28l-10 8v-8H12a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6z"
            fill={c.soft}
            stroke={c.ink}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M32 24v10" stroke={c.deep} strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="32" cy="40" r="2.2" fill={c.deep} />
          <rect x="14" y="18" width="5" height="22" rx="2.5" fill={`url(#${ids.shine})`} />
        </g>
      )}
    </IconBase>
  );
}

/** Pegadinha — escudo alerta. */
export function AgShieldAlert({ tone = 'orange', className, title, ...rest }: BaseProps) {
  const c = p(tone);
  return (
    <IconBase title={title} className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <path
            d="M32 8l18 6v14c0 12-8 20-18 24C22 48 14 40 14 28V14l18-6z"
            fill={c.soft}
            stroke={c.ink}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M32 22v12" stroke={c.deep} strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="32" cy="42" r="2.4" fill={c.deep} />
          <path d="M20 16l8-3" stroke={`url(#${ids.shine})`} strokeWidth="4" strokeLinecap="round" opacity="0.4" />
        </g>
      )}
    </IconBase>
  );
}

/** Mapa nome canônico / alias → componente. */
export const ADOLESCENTE_GENERIC_ICON_MAP = {
  MessagesSquare: AgMessages,
  MessageCircle: AgMessages,
  CalendarPlus: AgCalendarPlus,
  Calendar: AgCalendarPlus,
  LockKeyhole: AgLockKeyhole,
  Lock: AgLockKeyhole,
  HeartPulse: AgHeartPulse,
  Heart: AgHeartPulse,
  Cross: AgCross,
  Plus: AgCross,
  HeartHandshake: AgHeartHandshake,
  House: AgHouse,
  Home: AgHouse,
  Stethoscope: AgStethoscope,
  Hospital: AgHospital,
  Building2: AgHospital,
  CircleCheck: AgCircleCheck,
  Check: AgCircleCheck,
  CheckCircle2: AgCircleCheck,
  ShieldCheck: AgShieldCheck,
  Shield: AgShieldCheck,
  ShieldBan: AgShieldBan,
  Ban: AgShieldBan,
  MessageSquareWarning: AgMessageWarning,
  MessageCircleWarning: AgMessageWarning,
  ShieldAlert: AgShieldAlert,
} as const;

export type AdolescentGenericIconName = keyof typeof ADOLESCENTE_GENERIC_ICON_MAP;
