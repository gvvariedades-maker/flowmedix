/**
 * Períodos do hub `/desempenho` em datas civis de **Brasília** (UTC−3, sem DST).
 *
 * Contrato (docs/DESEMPENHO_METRICAS.md):
 * - intervalo **semiaberto** `[start, endExclusive)`;
 * - `endExclusive` = 00:00 do dia civil seguinte a hoje (evento futuro fica fora);
 * - `7d` = hoje + 6 datas civis anteriores (7 datas, não 8);
 * - `12m` = mesmo dia civil 12 meses atrás (inclusive) até hoje;
 * - `all` = sem limite inferior.
 *
 * Nunca usar o fuso local do runtime como contrato: o servidor pode estar em UTC.
 */

import {
  addFreemiumDaysToYmd,
  freemiumYmdToDate,
  toFreemiumTimezoneYmd,
} from '@/lib/freemium/constants';
import type { DesempenhoPeriodo } from '@/lib/desempenho/types';

/** Datas civis cobertas por período de dias (inclui hoje). */
export const DESEMPENHO_PERIODO_CIVIL_DAYS = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
} as const;

export type DesempenhoPeriodRange = {
  periodo: DesempenhoPeriodo;
  /** YYYY-MM-DD inclusivo (null em `all`). */
  startYmd: string | null;
  /** YYYY-MM-DD do último dia coberto (hoje em Brasília). */
  endYmdInclusive: string;
  /** Instante inclusivo do início (null em `all`). */
  start: Date | null;
  /** Instante exclusivo do fim — 00:00 do dia seguinte a hoje. */
  endExclusive: Date;
  /** Quantidade de datas civis cobertas (null em `all`). */
  civilDays: number | null;
};

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Soma meses em data civil YMD, com clamp de fim de mês (31/03 −1m → 28/02). */
export function shiftDesempenhoYmdMonths(ymd: string, months: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const anchor = new Date(Date.UTC(y!, (m! - 1) + months, 1));
  const ty = anchor.getUTCFullYear();
  const tm = anchor.getUTCMonth();
  const lastDay = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
  return `${ty}-${pad2(tm + 1)}-${pad2(Math.min(d!, lastDay))}`;
}

/** Data civil (YYYY-MM-DD) de um ISO no fuso do produto. */
export function toDesempenhoDayKey(iso: string, fallbackNow: Date = new Date()): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return toFreemiumTimezoneYmd(fallbackNow);
  return toFreemiumTimezoneYmd(parsed);
}

/** Range semiaberto do período em datas civis de Brasília. */
export function getDesempenhoPeriodRange(
  periodo: DesempenhoPeriodo,
  now: Date = new Date(),
): DesempenhoPeriodRange {
  const endYmdInclusive = toFreemiumTimezoneYmd(now);
  const endExclusive = freemiumYmdToDate(addFreemiumDaysToYmd(endYmdInclusive, 1));

  if (periodo === 'all') {
    return {
      periodo,
      startYmd: null,
      endYmdInclusive,
      start: null,
      endExclusive,
      civilDays: null,
    };
  }

  const startYmd =
    periodo === '12m'
      ? shiftDesempenhoYmdMonths(endYmdInclusive, -12)
      : addFreemiumDaysToYmd(
          endYmdInclusive,
          -(DESEMPENHO_PERIODO_CIVIL_DAYS[periodo] - 1),
        );

  const start = freemiumYmdToDate(startYmd);
  const civilDays =
    periodo === '12m'
      ? Math.round((endExclusive.getTime() - start.getTime()) / 86_400_000)
      : DESEMPENHO_PERIODO_CIVIL_DAYS[periodo];

  return { periodo, startYmd, endYmdInclusive, start, endExclusive, civilDays };
}

/** Evento pertence ao período? `[start, endExclusive)` — ISO inválido fica fora. */
export function isWithinDesempenhoPeriod(iso: string, range: DesempenhoPeriodRange): boolean {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  if (t >= range.endExclusive.getTime()) return false;
  if (range.start && t < range.start.getTime()) return false;
  return true;
}

/**
 * Datas civis do range, do mais antigo ao mais novo.
 * Em `all`, precisa de `fallbackStartYmd` (primeiro evento conhecido).
 */
export function eachDesempenhoDayKey(
  range: DesempenhoPeriodRange,
  fallbackStartYmd?: string | null,
): string[] {
  const startYmd = range.startYmd ?? fallbackStartYmd ?? range.endYmdInclusive;
  const keys: string[] = [];
  let cursor = startYmd;
  // Guarda de segurança: 12m + folga.
  for (let i = 0; i < 400; i++) {
    keys.push(cursor);
    if (cursor >= range.endYmdInclusive) break;
    cursor = addFreemiumDaysToYmd(cursor, 1);
  }
  return keys;
}
