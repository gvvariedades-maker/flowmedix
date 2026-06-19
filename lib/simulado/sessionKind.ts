import { isDiagnosticoSessionFiltros } from '@/lib/simulado/diagnosticoConstants';
import {
  getIsoWeekInfo,
  isWeeklySimuladoFiltros,
  type IsoWeekInfo,
} from '@/lib/simulado/weeklySimuladoCore';

export type SimuladoSessionKind = 'livre' | 'weekly' | 'diagnostico';

export { getIsoWeekInfo, type IsoWeekInfo };

export function resolveSimuladoSessionKind(
  filtros: Record<string, unknown> | null | undefined,
): SimuladoSessionKind {
  if (isWeeklySimuladoFiltros(filtros)) return 'weekly';
  if (isDiagnosticoSessionFiltros(filtros)) return 'diagnostico';
  return 'livre';
}

export function isAdaptiveSimuladoKind(kind: SimuladoSessionKind): boolean {
  return kind === 'weekly' || kind === 'diagnostico';
}

export function getWeeklyFocoPrincipal(
  filtros: Record<string, unknown> | null | undefined,
): string | null {
  const foco = filtros?.foco_principal;
  if (typeof foco !== 'string') return null;
  const trimmed = foco.trim();
  return trimmed || null;
}

export function getWeeklyIsoWeek(
  filtros: Record<string, unknown> | null | undefined,
): number | null {
  if (!isWeeklySimuladoFiltros(filtros)) return null;
  const isoWeek = Number(filtros?.iso_week);
  return Number.isFinite(isoWeek) ? isoWeek : null;
}
