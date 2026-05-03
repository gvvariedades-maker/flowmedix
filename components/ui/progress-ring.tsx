interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'brand' | 'success' | 'warning';
}

const colors = {
  brand:   '#00f2ff',
  success: '#00ff88',
  warning: '#ffb800',
};

export function ProgressRing({
  value,
  size = 48,
  strokeWidth = 4,
  variant = 'brand',
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, value)) / 100) * circ;
  const color = colors[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - dash}
        style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  );
}
