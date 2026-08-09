'use client';

import type { ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/utils';

/** Paleta flat estilo mapa mental IM (não copia asset de feed). */
export const IM_ICON_COLORS = {
  green: '#2D7D46',
  greenSoft: '#4CAF50',
  red: '#D32F2F',
  blue: '#1976D2',
  orange: '#FF9800',
  yellow: '#FFC107',
  ink: '#1e293b',
} as const;

export type ImIconColor = keyof typeof IM_ICON_COLORS;

type BaseProps = SVGProps<SVGSVGElement> & {
  title?: string;
  className?: string;
};

function IconBase({
  title,
  className,
  children,
  ...rest
}: BaseProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      className={cn('h-6 w-6 shrink-0', className)}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Estetoscópio — outline verde. */
export function ImStethoscope({ className, ...rest }: BaseProps) {
  const c = IM_ICON_COLORS.green;
  return (
    <IconBase title="Estetoscópio" className={className} {...rest}>
      <path
        d="M8.5 3.5v5.2a3.5 3.5 0 1 0 7 0V3.5"
        stroke={c}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M8.5 3.5h1.2M14.3 3.5h1.2"
        stroke={c}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M12 12v2.2a3.3 3.3 0 0 0 3.3 3.3H16"
        stroke={c}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="17.5" cy="17.5" r="2.2" stroke={c} strokeWidth="1.75" />
    </IconBase>
  );
}

/** Frasco + seringa. */
export function ImVialSyringe({ className, ...rest }: BaseProps) {
  const c = IM_ICON_COLORS.green;
  return (
    <IconBase title="Frasco e seringa" className={className} {...rest}>
      <rect x="3.5" y="5" width="5" height="12" rx="1" stroke={c} strokeWidth="1.6" />
      <path d="M4.2 7.2h3.6M5 3.8h2v1.4H5z" stroke={c} strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d="M12.2 18.5 18.8 6.8l1.4.8-6.6 11.7-2.2-.2.8-1.6z"
        stroke={c}
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <path d="M17.6 5.8l1.3.7M13.4 17.2l1.6.4" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </IconBase>
  );
}

/** Régua inclinada. */
export function ImRuler({ className, ...rest }: BaseProps) {
  const c = IM_ICON_COLORS.blue;
  return (
    <IconBase title="Régua" className={className} {...rest}>
      <g transform="rotate(-35 12 12)">
        <rect x="4" y="9.2" width="16" height="5.6" rx="1" stroke={c} strokeWidth="1.6" fill={`${c}18`} />
        <path
          d="M7 9.2v2.2M9.5 9.2v1.4M12 9.2v2.2M14.5 9.2v1.4M17 9.2v2.2"
          stroke={c}
          strokeWidth="1.35"
          strokeLinecap="round"
        />
      </g>
    </IconBase>
  );
}

/** Prancheta com checks. */
export function ImClipboardChecks({ className, ...rest }: BaseProps) {
  const c = IM_ICON_COLORS.red;
  return (
    <IconBase title="Checklist" className={className} {...rest}>
      <rect x="5" y="4.5" width="14" height="16" rx="2" stroke={c} strokeWidth="1.65" fill={`${c}10`} />
      <path d="M9 4.5h6v2.2H9z" stroke={c} strokeWidth="1.5" fill="white" />
      <path
        d="M8.2 10.2h6.5M8.2 13h6.5M8.2 15.8h5"
        stroke={c}
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M16.2 9.8l1 1 1.8-2.1M16.2 12.7l1 1 1.8-2.1"
        stroke={c}
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

/** Três seringas — profundidades IM / SC / ID. */
export function ImSyringeDepths({ className, ...rest }: BaseProps) {
  return (
    <IconBase title="Vias IM SC ID" className={className} {...rest}>
      {/* ID — curta */}
      <g stroke={IM_ICON_COLORS.orange} strokeWidth="1.45" strokeLinecap="round">
        <path d="M5 16.5V11.2" />
        <path d="M3.8 11.2h2.4M4.2 16.5h1.6" />
        <path d="M5 11.2 5 9.6" />
      </g>
      {/* SC — média */}
      <g stroke={IM_ICON_COLORS.blue} strokeWidth="1.45" strokeLinecap="round">
        <path d="M12 17.5V9" />
        <path d="M10.6 9h2.8M11 17.5h2" />
        <path d="M12 9V7.2" />
      </g>
      {/* IM — longa */}
      <g stroke={IM_ICON_COLORS.green} strokeWidth="1.5" strokeLinecap="round">
        <path d="M19 18.2V6.5" />
        <path d="M17.4 6.5h3.2M18 18.2h2" />
        <path d="M19 6.5V4.6" />
      </g>
    </IconBase>
  );
}

/** Mãos + coração (cuidado de enfermagem). */
export function ImHandsHeart({ className, ...rest }: BaseProps) {
  const c = IM_ICON_COLORS.green;
  return (
    <IconBase title="Cuidados de enfermagem" className={className} {...rest}>
      <path
        d="M12 10.2c-.7-1.4-2.6-1.7-3.6-.5-1 1.1-.7 2.8.5 3.7L12 15.8l2.9-2.4c1.2-.9 1.5-2.6.5-3.7-1-1.2-2.9-.9-3.6.5z"
        fill={c}
      />
      <path
        d="M4.2 13.5c0-1.8 1.3-3 2.8-3 .9 0 1.6.3 2.2.9M19.8 13.5c0-1.8-1.3-3-2.8-3-.9 0-1.6.3-2.2.9"
        stroke={c}
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <path
        d="M3.5 14.2c0 3.2 3.2 5.6 8.5 7.2 5.3-1.6 8.5-4 8.5-7.2"
        stroke={c}
        strokeWidth="1.55"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

/** Escudo alerta. */
export function ImShieldAlert({ className, ...rest }: BaseProps) {
  const c = IM_ICON_COLORS.red;
  return (
    <IconBase title="Alerta" className={className} {...rest}>
      <path
        d="M12 2.8 19.2 5.5v5.2c0 4.6-3 8.4-7.2 9.7-4.2-1.3-7.2-5.1-7.2-9.7V5.5L12 2.8z"
        fill={c}
      />
      <path d="M12 8v4.2" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="15.4" r="1.05" fill="white" />
    </IconBase>
  );
}

/** Escudo OK. */
export function ImShieldOk({ className, ...rest }: BaseProps) {
  const c = IM_ICON_COLORS.greenSoft;
  return (
    <IconBase title="Seguro" className={className} {...rest}>
      <path
        d="M12 2.8 19.2 5.5v5.2c0 4.6-3 8.4-7.2 9.7-4.2-1.3-7.2-5.1-7.2-9.7V5.5L12 2.8z"
        fill={c}
      />
      <path
        d="M8.6 12.2 11 14.6l4.6-5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

/** Raio (macete / atenção rápida). */
export function ImBolt({ className, ...rest }: BaseProps) {
  const c = IM_ICON_COLORS.orange;
  return (
    <IconBase title="Macete" className={className} {...rest}>
      <path d="M13.2 2.5 6.8 13.2h4.2l-1.2 8.3 7.2-12.2h-4.4L13.2 2.5z" fill={c} />
    </IconBase>
  );
}

/** Estrela. */
export function ImStar({ className, ...rest }: BaseProps) {
  const c = IM_ICON_COLORS.yellow;
  return (
    <IconBase title="Destaque" className={className} {...rest}>
      <path
        d="M12 3.2l2.2 5.2 5.6.5-4.3 3.7 1.3 5.4L12 15.4 7.2 18l1.3-5.4-4.3-3.7 5.6-.5L12 3.2z"
        fill={c}
        stroke={IM_ICON_COLORS.ink}
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

/** Balão de fala. */
export function ImSpeech({ className, ...rest }: BaseProps) {
  const c = IM_ICON_COLORS.blue;
  return (
    <IconBase title="Dica" className={className} {...rest}>
      <path
        d="M5 5.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H10l-4.2 3.2V16.5H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z"
        stroke={c}
        strokeWidth="1.6"
        fill={`${c}14`}
        strokeLinejoin="round"
      />
      <circle cx="9" cy="11" r="1.1" fill={c} />
      <circle cx="12" cy="11" r="1.1" fill={c} />
      <circle cx="15" cy="11" r="1.1" fill={c} />
    </IconBase>
  );
}

/** Alvo / sítio. */
export function ImTarget({ className, ...rest }: BaseProps) {
  const c = IM_ICON_COLORS.green;
  return (
    <IconBase title="Definir sítio" className={className} {...rest}>
      <circle cx="12" cy="12" r="7.2" stroke={c} strokeWidth="1.65" />
      <circle cx="12" cy="12" r="3.2" stroke={c} strokeWidth="1.55" />
      <path d="M12 3.5v2.4M12 18.1v2.4M3.5 12h2.4M18.1 12h2.4" stroke={c} strokeWidth="1.55" strokeLinecap="round" />
    </IconBase>
  );
}

/** Gota (antissepsia). */
export function ImDroplet({ className, ...rest }: BaseProps) {
  const c = IM_ICON_COLORS.greenSoft;
  return (
    <IconBase title="Antissepsia" className={className} {...rest}>
      <path
        d="M12 3.2c2.8 3.4 6.2 7 6.2 10.2A6.2 6.2 0 0 1 12 19.6 6.2 6.2 0 0 1 5.8 13.4C5.8 10.2 9.2 6.6 12 3.2z"
        fill={c}
      />
    </IconBase>
  );
}

/** Diamante de decisão. */
export function ImDecision({ className, ...rest }: BaseProps) {
  const c = IM_ICON_COLORS.green;
  return (
    <IconBase title="Decisão" className={className} {...rest}>
      <path
        d="M12 3.2 20.2 12 12 20.8 3.8 12 12 3.2z"
        stroke={c}
        strokeWidth="1.65"
        fill={`${c}14`}
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

/** STOP. */
export function ImStop({ className, ...rest }: BaseProps) {
  const c = IM_ICON_COLORS.red;
  return (
    <IconBase title="Parar" className={className} {...rest}>
      <path
        d="M8.2 3.5h7.6l4.7 4.7v7.6l-4.7 4.7H8.2L3.5 15.8V8.2L8.2 3.5z"
        fill={c}
      />
      <text
        x="12"
        y="13.2"
        textAnchor="middle"
        fill="white"
        fontSize="5.2"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
      >
        STOP
      </text>
    </IconBase>
  );
}

/** Check em círculo. */
export function ImCircleCheck({ className, ...rest }: BaseProps) {
  const c = IM_ICON_COLORS.greenSoft;
  return (
    <IconBase title="Concluído" className={className} {...rest}>
      <circle cx="12" cy="12" r="8.2" fill={c} />
      <path
        d="M8.2 12.2 11 15l5-5.6"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

/** Número em círculo (1–6). */
export function ImStepBadge({
  n,
  tone = 'green',
  className,
  ...rest
}: BaseProps & { n: number | string; tone?: 'green' | 'red' }) {
  const c = tone === 'red' ? IM_ICON_COLORS.red : IM_ICON_COLORS.greenSoft;
  return (
    <IconBase title={`Passo ${n}`} className={className} {...rest}>
      <circle cx="12" cy="12" r="9" fill={c} />
      <text
        x="12"
        y="15.2"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
      >
        {n}
      </text>
    </IconBase>
  );
}

export const IM_ICON_CATALOG = [
  { id: 'stethoscope', label: 'Estetoscópio', Component: ImStethoscope },
  { id: 'vial-syringe', label: 'Frasco + seringa', Component: ImVialSyringe },
  { id: 'ruler', label: 'Régua / ângulo', Component: ImRuler },
  { id: 'clipboard', label: 'Checklist', Component: ImClipboardChecks },
  { id: 'syringe-depths', label: 'IM · SC · ID', Component: ImSyringeDepths },
  { id: 'hands-heart', label: 'Cuidados TE', Component: ImHandsHeart },
  { id: 'shield-alert', label: 'Escudo alerta', Component: ImShieldAlert },
  { id: 'shield-ok', label: 'Escudo OK', Component: ImShieldOk },
  { id: 'bolt', label: 'Macete', Component: ImBolt },
  { id: 'star', label: 'Cai na prova', Component: ImStar },
  { id: 'speech', label: 'Dica', Component: ImSpeech },
  { id: 'target', label: 'Definir sítio', Component: ImTarget },
  { id: 'droplet', label: 'Antissepsia', Component: ImDroplet },
  { id: 'decision', label: 'Decisão', Component: ImDecision },
  { id: 'stop', label: 'STOP', Component: ImStop },
  { id: 'circle-check', label: 'Concluído', Component: ImCircleCheck },
] as const;
