import {
  formatAcertoErroAria,
  splitAcertoErroPct,
} from '@/lib/vitrine/resolveAcertoDisplay';
import { cn } from '@/lib/utils';

const TRACK_STROKE = '#e2e8f0';

export type AcertoErroDonutProps = {
  acertos: number;
  erros: number;
  respondidas: number;
  size?: number;
  strokeWidth?: number;
};

export function AcertoErroDonut({
  acertos,
  erros,
  respondidas,
  size = 120,
  strokeWidth = 14,
}: AcertoErroDonutProps) {
  const { acertoPct, erroPct } = splitAcertoErroPct(acertos, respondidas);
  const empty = respondidas <= 0;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const acertoLen = (acertoPct / 100) * circ;
  const erroLen = (erroPct / 100) * circ;
  const bothSlices = acertoPct > 0 && erroPct > 0;
  const linecap = bothSlices ? 'round' : 'butt';
  const ariaLabel = empty
    ? 'Ainda sem respostas neste assunto'
    : formatAcertoErroAria(acertos, erros, respondidas, acertoPct);

  return (
    <figure className="m-0 flex flex-col items-center" aria-label={ariaLabel}>
      <div className="relative" style={{ width: size, height: size }} data-testid="acerto-erro-donut">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={TRACK_STROKE}
            strokeWidth={strokeWidth}
          />
          {!empty && erroPct > 0 ? (
            <circle
              cx={cx}
              cy={cx}
              r={r}
              fill="none"
              stroke="var(--color-danger)"
              strokeWidth={strokeWidth}
              strokeLinecap={linecap}
              strokeDasharray={`${erroLen} ${circ}`}
              strokeDashoffset={-acertoLen}
            />
          ) : null}
          {!empty && acertoPct > 0 ? (
            <circle
              cx={cx}
              cy={cx}
              r={r}
              fill="none"
              stroke="var(--color-success)"
              strokeWidth={strokeWidth}
              strokeLinecap={linecap}
              strokeDasharray={`${acertoLen} ${circ}`}
              strokeDashoffset={0}
            />
          ) : null}
        </svg>
        <div
          className="absolute inset-0 flex select-none flex-col items-center justify-center px-3"
          aria-hidden
        >
          {empty ? (
            <>
              <span className="text-2xl font-bold leading-none text-slate-400">—</span>
              <span className="mt-1.5 text-center text-[0.55rem] font-medium uppercase tracking-wide text-slate-500">
                Ainda sem respostas
              </span>
            </>
          ) : (
            <>
              <span
                className={cn(
                  'font-bold tabular-nums leading-none text-[var(--color-success-text)]',
                  size >= 120 ? 'text-2xl' : 'text-xl',
                )}
              >
                {acertoPct}%
              </span>
              <span className="mt-1 text-center text-[0.55rem] font-medium uppercase tracking-wide text-slate-500 sm:text-[0.6rem]">
                de acerto
              </span>
            </>
          )}
        </div>
      </div>
    </figure>
  );
}
