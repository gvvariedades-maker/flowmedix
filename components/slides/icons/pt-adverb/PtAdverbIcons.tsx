'use client';

import type { ComponentType, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

const shell = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
};

/** Refs: lucide/circle · map-pin grammar — lugar */
export function IconAdverbPlace(props: IconProps) {
  return (
    <svg {...shell} {...props}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/** Refs: lucide — tempo (clock) */
export function IconAdverbTime(props: IconProps) {
  return (
    <svg {...shell} {...props}>
      {props.title ? <title>{props.title}</title> : null}
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

/** Refs: lucide/target — modo (raios internos para não “sumir” em fundo claro) */
export function IconAdverbMode(props: IconProps) {
  const { title, className, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Refs: lucide — intensidade (gauge / flame-lite) */
export function IconAdverbIntensity(props: IconProps) {
  return (
    <svg {...shell} {...props}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M12 3c2.5 3 4 5.5 4 8a4 4 0 1 1-8 0c0-2.5 1.5-5 4-8z" />
      <path d="M12 14v2" />
    </svg>
  );
}

/** Refs: lucide/check — afirmação */
export function IconAdverbAffirm(props: IconProps) {
  return (
    <svg {...shell} {...props}>
      {props.title ? <title>{props.title}</title> : null}
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/** Refs: lucide/x — negação */
export function IconAdverbNegation(props: IconProps) {
  return (
    <svg {...shell} {...props}>
      {props.title ? <title>{props.title}</title> : null}
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  );
}

/** Refs: lucide — dúvida */
export function IconAdverbDoubt(props: IconProps) {
  return (
    <svg {...shell} {...props}>
      {props.title ? <title>{props.title}</title> : null}
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

/** Refs: diagrams/adverb-indicative-chevron — plug do painel */
export function IconAdverbIndicativeChevron(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 40"
      fill="currentColor"
      stroke="none"
      aria-hidden
      {...props}
    >
      {props.title ? <title>{props.title}</title> : null}
      <path d="M16 0 L0 20 L16 40 Z" />
    </svg>
  );
}

/** Refs: diagrams/adverb-radiate-marks — traços do título */
export function IconAdverbRadiateMarks(props: IconProps) {
  return (
    <svg {...shell} viewBox="0 0 24 24" {...props}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M4 8 L10 10" />
      <path d="M2 12 H9" />
      <path d="M4 16 L10 14" />
    </svg>
  );
}

/** Refs: diagrams/nao-erre-arrow-curve — seta curva peça → rótulo */
export function IconNaoErreCurveArrow(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 96 56"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {props.title ? <title>{props.title}</title> : null}
      <path d="M10 12 C36 8, 58 18, 72 40" />
      <path d="M62 36 L76 42 L66 48" />
    </svg>
  );
}

/** Refs: diagrams/nao-erre-header-pointer — triângulo do título */
export function IconNaoErreHeaderPointer(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 12"
      fill="currentColor"
      stroke="none"
      aria-hidden
      {...props}
    >
      {props.title ? <title>{props.title}</title> : null}
      <path d="M12 12 L2 0 H22 Z" />
    </svg>
  );
}

/** @deprecated use IconNaoErreCurveArrow — alias de compat */
export function IconAdverbArrowHint(props: IconProps) {
  return <IconNaoErreCurveArrow {...props} />;
}

/** Refs: lucide/triangle-alert · diagrams/mal-mau-warn-pill */
export function IconMalMauWarn(props: IconProps) {
  return (
    <svg {...shell} viewBox="0 0 24 24" {...props}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

/** Refs: lucide/circle-check · diagrams/mal-mau-compare */
export function IconMalMauCheck(props: IconProps) {
  return (
    <svg {...shell} viewBox="0 0 24 24" {...props}>
      {props.title ? <title>{props.title}</title> : null}
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/** Refs: lucide/target · diagrams/mal-mau-tip-banner */
export function IconMalMauTipTarget(props: IconProps) {
  return (
    <svg {...shell} viewBox="0 0 24 24" {...props}>
      {props.title ? <title>{props.title}</title> : null}
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export type AdverbTypeKey =
  | 'lugar'
  | 'tempo'
  | 'modo'
  | 'intensidade'
  | 'afirmacao'
  | 'negacao'
  | 'duvida'
  | 'generic';

const TYPE_ICONS: Record<AdverbTypeKey, ComponentType<IconProps>> = {
  lugar: IconAdverbPlace,
  tempo: IconAdverbTime,
  modo: IconAdverbMode,
  intensidade: IconAdverbIntensity,
  afirmacao: IconAdverbAffirm,
  negacao: IconAdverbNegation,
  duvida: IconAdverbDoubt,
  generic: IconAdverbMode,
};

export function resolveAdverbTypeKey(label: string, icon?: string): AdverbTypeKey {
  const hay = `${label} ${icon ?? ''}`.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  // 1) Nome canônico da faixa (antes das chips COMO/QUANDO/…)
  if (/\bmodo\b/.test(hay)) return 'modo';
  if (/\btempo\b/.test(hay)) return 'tempo';
  if (/\blugar\b/.test(hay)) return 'lugar';
  if (/\bintens/.test(hay)) return 'intensidade';
  if (/\bafirm/.test(hay)) return 'afirmacao';
  if (/\bnega/.test(hay)) return 'negacao';
  if (/\bduvida\b/.test(hay)) return 'duvida';
  // 2) Ícone Lucide / dicas
  if (/mappin|onde|aqui|ali/.test(hay)) return 'lugar';
  if (/clock|quando|ontem|hoje/.test(hay)) return 'tempo';
  if (/target|zap|como|mente/.test(hay)) return 'modo';
  if (/flame|volume|quanto|muito/.test(hay)) return 'intensidade';
  if (/check/.test(hay)) return 'afirmacao';
  if (/ban|xcircle|jamais/.test(hay)) return 'negacao';
  if (/help|alert|talvez/.test(hay)) return 'duvida';
  return 'generic';
}

export function AdverbTypeIcon({
  typeKey,
  className,
}: {
  typeKey: AdverbTypeKey;
  className?: string;
}) {
  const Cmp = TYPE_ICONS[typeKey] ?? IconAdverbMode;
  // className no SVG (inclui text-*) para currentColor ter contraste garantido
  return <Cmp className={className} />;
}
