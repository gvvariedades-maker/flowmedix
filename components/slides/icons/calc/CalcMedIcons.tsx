'use client';

import { useId, type ReactNode, type SVGProps } from 'react';
import { cn } from '@/lib/utils';

/** Paleta soft-3D — cálculo de medicamentos (nível B/C). */
export const CALC_ICON_COLORS = {
  navy: '#2B4C7E',
  blue: '#5B84C1',
  blueSoft: '#A8C4E8',
  blueWash: '#D9E6F2',
  green: '#43A047',
  greenDark: '#2E7D32',
  purple: '#673AB7',
  purpleSoft: '#B39DDB',
  orange: '#FF9800',
  orangeDeep: '#F57C00',
  teal: '#009688',
  tealSoft: '#4DB6AC',
  ink: '#1E293B',
  paper: '#FFFFFF',
  metal: '#90A4AE',
} as const;

type BaseProps = SVGProps<SVGSVGElement> & {
  title?: string;
  className?: string;
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
    shine: `calcShine-${uid}`,
    shadow: `calcShadow-${uid}`,
  };
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      className={cn('h-12 w-12 shrink-0', className)}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={ids.shine} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.08" />
        </linearGradient>
        <filter id={ids.shadow} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1.1" floodOpacity="0.22" />
        </filter>
      </defs>
      {children(ids)}
    </svg>
  );
}

/** 1 — Frasco + cápsula (header). */
export function CalcBottlePill({ className, ...rest }: BaseProps) {
  const { navy, blue, paper, blueWash } = CALC_ICON_COLORS;
  return (
    <IconBase title="Frasco e comprimido" className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <rect x="14" y="18" width="24" height="34" rx="6" fill={paper} stroke={navy} strokeWidth="2.2" />
          <rect x="18" y="12" width="16" height="8" rx="2.5" fill={navy} />
          <rect x="18" y="14" width="16" height="3" rx="1" fill="#4A6FA5" opacity="0.7" />
          <rect x="18" y="26" width="16" height="14" rx="3" fill={blue} />
          <path d="M26 29.5v7M22.5 33h7" stroke={paper} strokeWidth="2.2" strokeLinecap="round" />
          <rect x="15.5" y="20" width="5" height="28" rx="2" fill={`url(#${ids.shine})`} />
          <g transform="rotate(-28 44 44)">
            <rect x="34" y="38" width="22" height="10" rx="5" fill={blueWash} stroke={navy} strokeWidth="1.8" />
            <rect x="34" y="38" width="11" height="10" rx="5" fill={blue} stroke={navy} strokeWidth="1.8" />
            <rect x="35" y="39.5" width="4" height="7" rx="2" fill="#fff" opacity="0.35" />
          </g>
        </g>
      )}
    </IconBase>
  );
}

/** 2 — Seringa. */
export function CalcSyringe({ className, ...rest }: BaseProps) {
  const { navy, blueSoft, paper, metal } = CALC_ICON_COLORS;
  return (
    <IconBase title="Seringa" className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`} transform="rotate(-38 32 32)">
          <rect x="18" y="14" width="8" height="6" rx="1.5" fill={navy} />
          <rect x="20" y="20" width="4" height="22" rx="1.2" fill={paper} stroke={navy} strokeWidth="1.8" />
          <rect x="20.5" y="28" width="3" height="12" rx="1" fill={blueSoft} />
          <path d="M21 24h2M21 26.5h2M21 29h2M21 31.5h2" stroke={navy} strokeWidth="0.9" opacity="0.55" />
          <rect x="19" y="42" width="6" height="4" rx="1" fill={navy} />
          <path d="M22 46v10" stroke={metal} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M22 56l-1.2 2.5h2.4L22 56z" fill={metal} />
          <rect x="20.5" y="21" width="1.4" height="18" rx="0.7" fill="#fff" opacity="0.45" />
        </g>
      )}
    </IconBase>
  );
}

/** 3 — Alvo com flecha. */
export function CalcTargetArrow({ className, ...rest }: BaseProps) {
  const { purple, purpleSoft, metal, paper } = CALC_ICON_COLORS;
  return (
    <IconBase title="Objetivo" className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <circle cx="30" cy="34" r="16" fill={purpleSoft} stroke={purple} strokeWidth="2.2" />
          <circle cx="30" cy="34" r="10" fill={paper} stroke={purple} strokeWidth="2" />
          <circle cx="30" cy="34" r="4.2" fill={purple} />
          <circle cx="28.8" cy="32.6" r="1.3" fill="#fff" opacity="0.45" />
          <path
            d="M38 14l12 8-9 2.2 2.4 9.2-12-8 9-2.2-2.4-9.2z"
            fill={metal}
            stroke="#607D8B"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M48.5 20.5l3.5-1.2-1.5 3.8" fill={purple} />
        </g>
      )}
    </IconBase>
  );
}

/** 4 — Balança (proporção). */
export function CalcBalanceScale({ className, ...rest }: BaseProps) {
  const { blue, navy, paper, blueSoft } = CALC_ICON_COLORS;
  return (
    <IconBase title="Monte a proporção" className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <path d="M32 14v8" stroke={navy} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="32" cy="12" r="3.2" fill={blue} stroke={navy} strokeWidth="1.5" />
          <path d="M14 24h36" stroke={navy} strokeWidth="2.4" strokeLinecap="round" />
          <path
            d="M14 24l-6 14h16L18 24"
            stroke={navy}
            strokeWidth="1.8"
            fill={`${blue}33`}
            strokeLinejoin="round"
          />
          <rect x="14.5" y="30" width="7" height="9" rx="1.5" fill={paper} stroke={navy} strokeWidth="1.3" />
          <rect x="15.5" y="32.5" width="5" height="4" rx="1" fill={blue} />
          <path d="M18 33.2v2.6M16.8 34.5h2.4" stroke={paper} strokeWidth="1.1" strokeLinecap="round" />
          <path
            d="M50 24l-6 14h16L46 24"
            stroke={navy}
            strokeWidth="1.8"
            fill={`${blue}33`}
            strokeLinejoin="round"
          />
          <path
            d="M46 31c1.8 2.2 4 4.5 4 6.5a4 4 0 1 1-8 0c0-2 2.2-4.3 4-6.5z"
            fill={blueSoft}
            stroke={navy}
            strokeWidth="1.3"
          />
          <path d="M18 52h28" stroke={navy} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M28 52h8v4h-8z" fill={navy} />
        </g>
      )}
    </IconBase>
  );
}

/** 5 — Elos (relacione). */
export function CalcChainLink({ className, ...rest }: BaseProps) {
  const { green, greenDark } = CALC_ICON_COLORS;
  return (
    <IconBase title="Relacione" className={className} {...rest}>
      {(ids) => (
        <>
          <g filter={`url(#${ids.shadow})`} transform="rotate(-28 32 32)">
            <ellipse cx="24" cy="32" rx="11" ry="7" stroke={greenDark} strokeWidth="3.2" fill="none" />
            <ellipse cx="24" cy="32" rx="11" ry="7" stroke={green} strokeWidth="2" fill="none" />
            <ellipse cx="40" cy="32" rx="11" ry="7" stroke={greenDark} strokeWidth="3.2" fill="none" />
            <ellipse cx="40" cy="32" rx="11" ry="7" stroke={green} strokeWidth="2" fill="none" />
          </g>
          <path
            d="M32 18v3M32 43v3M20 32h3M41 32h3"
            stroke={green}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.75"
          />
        </>
      )}
    </IconBase>
  );
}

/** 6 — Calculadora. */
export function CalcCalculator({ className, ...rest }: BaseProps) {
  const { orange, orangeDeep, paper, ink } = CALC_ICON_COLORS;
  const colors = ['#EF5350', '#FFCA28', '#42A5F5', '#AB47BC', '#66BB6A', '#FFA726', '#26C6DA', '#EC407A', '#7E57C2'];
  return (
    <IconBase title="Multiplique" className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <rect x="14" y="8" width="36" height="48" rx="8" fill={orange} stroke={orangeDeep} strokeWidth="2.2" />
          <rect x="19" y="14" width="26" height="10" rx="3" fill="#ECEFF1" stroke={ink} strokeWidth="1.2" opacity="0.95" />
          <rect x="20" y="15.5" width="8" height="7" rx="1.5" fill="#fff" opacity="0.55" />
          {[0, 1, 2].flatMap((row) =>
            [0, 1, 2].map((col) => {
              const i = row * 3 + col;
              return (
                <rect
                  key={`${row}-${col}`}
                  x={19 + col * 9}
                  y={28 + row * 8.5}
                  width="7"
                  height="6.5"
                  rx="1.6"
                  fill={colors[i]}
                  stroke={paper}
                  strokeWidth="0.6"
                />
              );
            }),
          )}
          <rect x="16" y="10" width="6" height="40" rx="3" fill={`url(#${ids.shine})`} />
        </g>
      )}
    </IconBase>
  );
}

/** 7 — Clipboard + check. */
export function CalcClipboardCheck({ className, ...rest }: BaseProps) {
  const { purple, metal, paper, navy, blueSoft } = CALC_ICON_COLORS;
  return (
    <IconBase title="Resolva" className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <rect x="16" y="12" width="32" height="42" rx="5" fill="#CFD8DC" stroke="#78909C" strokeWidth="1.8" />
          <rect x="19" y="16" width="26" height="34" rx="3" fill={paper} stroke="#B0BEC5" strokeWidth="1.2" />
          <rect x="24" y="8" width="16" height="8" rx="2.5" fill={metal} stroke="#607D8B" strokeWidth="1.4" />
          <path
            d="M23 24h18M23 29h18M23 34h14M23 39h16"
            stroke={blueSoft}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="42" cy="44" r="9" fill={purple} stroke="#4527A0" strokeWidth="1.5" />
          <path
            d="M38.2 44.2 41 47l5.2-6"
            stroke={paper}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M20 18h4" stroke={navy} strokeWidth="1.2" strokeLinecap="round" opacity="0.25" />
        </g>
      )}
    </IconBase>
  );
}

/** 8 — Cápsula (resultado). */
export function CalcCapsule({ className, ...rest }: BaseProps) {
  const { teal, tealSoft, navy, paper } = CALC_ICON_COLORS;
  return (
    <IconBase title="Resultado" className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`} transform="rotate(-32 32 32)">
          <rect x="10" y="26" width="44" height="16" rx="8" fill={paper} stroke={navy} strokeWidth="2" />
          <path
            d="M10 34c0-4.4 3.6-8 8-8h14v16H18c-4.4 0-8-3.6-8-8z"
            fill={teal}
            stroke={navy}
            strokeWidth="2"
          />
          <path
            d="M14 28.5c1.2-1.5 3-2.3 5-2.3h8"
            stroke={tealSoft}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path d="M36 29h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
          <path d="M32 26v16" stroke={navy} strokeWidth="1.4" opacity="0.35" />
        </g>
      )}
    </IconBase>
  );
}

/** 9 — Lâmpada em círculo (dica). */
export function CalcLightbulbBadge({ className, ...rest }: BaseProps) {
  const { purple, paper } = CALC_ICON_COLORS;
  return (
    <IconBase title="Dica importante" className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <circle cx="32" cy="32" r="22" fill={purple} />
          <circle cx="26" cy="24" r="8" fill="#fff" opacity="0.12" />
          <path
            d="M32 16c-5.2 0-9 3.8-9 8.6 0 3.2 1.6 5.4 3.6 7.2V36h10.8v-4.2c2-1.8 3.6-4 3.6-7.2C41 19.8 37.2 16 32 16z"
            fill={paper}
          />
          <rect x="27.5" y="36.5" width="9" height="3.2" rx="1" fill={paper} opacity="0.9" />
          <rect x="28.5" y="40" width="7" height="2.4" rx="1" fill={paper} opacity="0.75" />
          <path
            d="M32 20.5v3.2M27.5 23.5l-2.2-2.2M36.5 23.5l2.2-2.2"
            stroke={purple}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.55"
          />
        </g>
      )}
    </IconBase>
  );
}

/** 10 — Escudo com cruz. */
export function CalcShieldCross({ className, ...rest }: BaseProps) {
  const { purple, paper } = CALC_ICON_COLORS;
  return (
    <IconBase title="Segurança" className={className} {...rest}>
      {(ids) => (
        <g filter={`url(#${ids.shadow})`}>
          <path
            d="M32 8 50 15v14.5c0 11.5-7.4 20.8-18 24.5C21.4 50.3 14 41 14 29.5V15L32 8z"
            fill={purple}
          />
          <path
            d="M32 12.5 46 18v11c0 9.2-5.8 16.8-14 20-8.2-3.2-14-10.8-14-20v-11l14-5.5z"
            fill="#7E57C2"
          />
          <path d="M32 22v16M24 30h16" stroke={paper} strokeWidth="4" strokeLinecap="round" />
          <path
            d="M24 16c2-1 5-1.5 8-1.5"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.28"
          />
        </g>
      )}
    </IconBase>
  );
}

export const CALC_ICON_CATALOG = [
  { id: 'bottle-pill', label: 'Frasco + cápsula', step: 'Header', Component: CalcBottlePill },
  { id: 'syringe', label: 'Seringa', step: 'Header', Component: CalcSyringe },
  { id: 'target-arrow', label: 'Alvo / objetivo', step: 'Subhead', Component: CalcTargetArrow },
  { id: 'balance-scale', label: 'Balança (proporção)', step: '1', Component: CalcBalanceScale },
  { id: 'chain-link', label: 'Elos (relacione)', step: '2', Component: CalcChainLink },
  { id: 'calculator', label: 'Calculadora', step: '3', Component: CalcCalculator },
  { id: 'clipboard-check', label: 'Prancheta OK', step: '4', Component: CalcClipboardCheck },
  { id: 'capsule', label: 'Cápsula (resultado)', step: '5', Component: CalcCapsule },
  { id: 'lightbulb-badge', label: 'Dica (lâmpada)', step: 'Footer', Component: CalcLightbulbBadge },
  { id: 'shield-cross', label: 'Escudo + cruz', step: 'Footer', Component: CalcShieldCross },
] as const;
