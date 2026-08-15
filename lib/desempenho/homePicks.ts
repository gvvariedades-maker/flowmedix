/**
 * Recortes da home curta de `/desempenho` (onda 1).
 *
 * Puros: a UI só pinta o que estes helpers escolhem. Áreas com 1 questão
 * nunca entram como “prioridade” — amostra < DESEMPENHO_MIN_SAMPLE não ranqueia.
 */

import {
  DESEMPENHO_HOME_AREA_LIMIT,
  DESEMPENHO_MIN_SAMPLE,
  type AreaPerformance,
  type RiskBandPerformance,
} from '@/lib/desempenho/types';

export type PriorityAreasPick = {
  priority: AreaPerformance[];
  rest: AreaPerformance[];
};

function compareLabel(a: string, b: string): number {
  return a.localeCompare(b, 'pt-BR');
}

function assuntoVisivelNoMapa(respondidas: number, totalDisponivel: number): boolean {
  return respondidas > 0 || totalDisponivel > 0;
}

/** Áreas que a hierarquia realmente pinta (com assunto praticado ou no catálogo). */
export function areasComPresencaNoMapa(
  areas: readonly AreaPerformance[],
): AreaPerformance[] {
  return areas
    .map((area) => ({
      ...area,
      assuntos: area.assuntos.filter((assunto) =>
        assuntoVisivelNoMapa(assunto.respondidas, assunto.totalDisponivel),
      ),
    }))
    .filter((area) => area.assuntos.length > 0);
}

/**
 * 3 piores com amostra ≥ 5; se faltar, completa com maior `respondidas`
 * (nunca 1 questão). O restante fica para “Ver mapa completo”.
 */
export function pickPriorityAreas(
  areas: readonly AreaPerformance[],
  limit = DESEMPENHO_HOME_AREA_LIMIT,
): PriorityAreasPick {
  const candidatos = areasComPresencaNoMapa(areas);
  const rankable = candidatos
    .filter((area) => area.amostraSuficiente && area.percentual !== null)
    .sort(
      (a, b) =>
        (a.percentual ?? 100) - (b.percentual ?? 100) ||
        b.respondidas - a.respondidas ||
        compareLabel(a.areaLabel, b.areaLabel),
    );

  const preenchimento = candidatos
    .filter(
      (area) =>
        !area.amostraSuficiente &&
        area.respondidas > 1 &&
        area.respondidas < DESEMPENHO_MIN_SAMPLE,
    )
    .sort(
      (a, b) =>
        b.respondidas - a.respondidas || compareLabel(a.areaLabel, b.areaLabel),
    );

  const priority: AreaPerformance[] = [];
  const usados = new Set<string>();

  for (const area of rankable) {
    if (priority.length >= limit) break;
    priority.push(area);
    usados.add(area.areaId);
  }
  for (const area of preenchimento) {
    if (priority.length >= limit) break;
    if (usados.has(area.areaId)) continue;
    priority.push(area);
    usados.add(area.areaId);
  }

  return {
    priority,
    rest: candidatos.filter((area) => !usados.has(area.areaId)),
  };
}

export function summarizeAreaMap(areas: readonly AreaPerformance[]): {
  total: number;
  comDiagnostico: number;
} {
  const visiveis = areasComPresencaNoMapa(areas);
  return {
    total: visiveis.length,
    comDiagnostico: visiveis.filter((area) => area.amostraSuficiente).length,
  };
}

/**
 * Faixa de menor desempenho para o radar recolhido.
 * Só afirma fraqueza com amostra ≥ 5; senão usa volume (> 1 respondida).
 */
export function pickLowestRiskBand(
  bands: readonly RiskBandPerformance[],
): RiskBandPerformance | null {
  const visiveis = bands.filter(
    (band) => band.riskBandId !== 'outros' || band.respondidas > 0,
  );

  const rankable = visiveis
    .filter((band) => band.amostraSuficiente && band.percentual !== null)
    .sort(
      (a, b) =>
        (a.percentual ?? 100) - (b.percentual ?? 100) ||
        b.respondidas - a.respondidas ||
        compareLabel(a.label, b.label),
    );
  if (rankable[0]) return rankable[0];

  const preenchimento = visiveis
    .filter((band) => band.respondidas > 1)
    .sort(
      (a, b) => b.respondidas - a.respondidas || compareLabel(a.label, b.label),
    );
  return preenchimento[0] ?? null;
}
