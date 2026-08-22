import type { ReactElement, SVGProps } from 'react';

export type NursingIconId =
  | 'prenatal'
  | 'calendar'
  | 'folic_pill'
  | 'consultation'
  | 'no_smoking'
  | 'check_cross'
  | 'water_relief'
  | 'companion'
  | 'mobility'
  | 'cord_clamp'
  | 'fetal_monitor';

type IconProps = SVGProps<SVGSVGElement> & { label?: string };

function IconFrame({ label, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      {label ? <title>{label}</title> : null}
      {children}
    </svg>
  );
}

export function PrenatalIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="29" cy="12" r="6" />
      <path d="M27 19c-7 3-10 11-8 20l3 14M35 20c6 5 9 13 7 21-2 8-8 13-16 12" />
      <path d="M26 28c9-3 17 3 17 12-8 4-17 1-21-6" />
      <circle cx="34" cy="39" r="3" />
      <path d="M15 55h32" />
    </IconFrame>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="10" y="14" width="44" height="40" rx="7" />
      <path d="M20 8v12M44 8v12M10 27h44" />
      <path d="M21 37h7M36 37h7M21 46h7" />
      <path d="m37 46 3 3 6-7" />
    </IconFrame>
  );
}

export function FolicPillIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M18 47c-7-7-7-18 0-25l4-4c7-7 18-7 25 0s7 18 0 25l-4 4c-7 7-18 7-25 0Z" />
      <path d="m22 43 21-21" />
      <path d="M17 23c6 1 12 7 13 13" />
      <path d="M46 9v10M41 14h10" />
    </IconFrame>
  );
}

export function ConsultationIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="22" cy="17" r="7" />
      <path d="M9 48c1-12 6-19 13-19s12 7 13 19" />
      <path d="M38 17h16v28H36V24" />
      <path d="M42 13h8v8h-8zM41 29h8M41 36h8" />
      <path d="M15 54h40" />
    </IconFrame>
  );
}

export function NoSmokingIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="32" cy="32" r="24" />
      <path d="M15 49 49 15" />
      <path d="M14 37h26M45 37h5M42 29c4-3 4-7 0-10M49 27c4-4 4-9 0-13" />
    </IconFrame>
  );
}

export function CheckCrossIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M10 18h18v18H10zM36 28h18v18H36z" />
      <path d="m14 27 4 4 7-9M40 33l10 10M50 33 40 43" />
      <path d="M27 27h8" />
    </IconFrame>
  );
}

export function WaterReliefIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M13 38h38v8a10 10 0 0 1-10 10H23a10 10 0 0 1-10-10v-8Z" />
      <path d="M8 38h48M18 30c-3-4 3-6 0-10M31 30c-3-4 3-6 0-10M44 30c-3-4 3-6 0-10" />
      <path d="M16 56v3M48 56v3" />
    </IconFrame>
  );
}

export function CompanionIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="22" cy="18" r="7" />
      <circle cx="44" cy="20" r="6" />
      <path d="M10 52c1-14 5-22 12-22s11 8 12 22M35 52c1-11 4-18 9-18s8 7 10 18" />
      <path d="m28 34 5 5 5-5" />
    </IconFrame>
  );
}

export function MobilityIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="33" cy="11" r="6" />
      <path d="m31 19-8 13 10 8 8 15M24 31l-11 7M33 40l-11 15M36 23l12 8" />
      <path d="m10 22 7-5M10 22l8 2M54 42l-7 5M54 42l-8-2" />
    </IconFrame>
  );
}

export function CordClampIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M11 26c8-11 17-11 23 0s15 11 19 0M11 39c8 11 17 11 23 0s15-11 19 0" />
      <rect x="27" y="20" width="10" height="24" rx="3" />
      <path d="M30 27h4M30 37h4" />
    </IconFrame>
  );
}

export function FetalMonitorIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="8" y="12" width="48" height="40" rx="6" />
      <path d="M14 33h8l4-9 7 18 5-11 4 2h8" />
      <path d="M20 57h24M25 52v5M39 52v5" />
    </IconFrame>
  );
}

const ICONS = {
  prenatal: PrenatalIcon,
  calendar: CalendarIcon,
  folic_pill: FolicPillIcon,
  consultation: ConsultationIcon,
  no_smoking: NoSmokingIcon,
  check_cross: CheckCrossIcon,
  water_relief: WaterReliefIcon,
  companion: CompanionIcon,
  mobility: MobilityIcon,
  cord_clamp: CordClampIcon,
  fetal_monitor: FetalMonitorIcon,
} satisfies Record<NursingIconId, (props: IconProps) => ReactElement>;

export function NursingIcon({ icon, ...props }: IconProps & { icon: NursingIconId }) {
  const Component = ICONS[icon];
  return <Component {...props} />;
}
