export const SIMULADO_DIAGNOSTICO_TIPO = 'diagnostico_inicial' as const;

export const SIMULADO_DIAGNOSTICO_TITULO = 'Simulado Diagnóstico Inicial';

export const SIMULADO_DIAGNOSTICO_QUANTIDADE_DEFAULT = 18;
export const SIMULADO_DIAGNOSTICO_QUANTIDADE_MIN = 15;
export const SIMULADO_DIAGNOSTICO_QUANTIDADE_MAX = 20;

export function clampDiagnosticoQuantidade(value: number): number {
  return Math.min(
    SIMULADO_DIAGNOSTICO_QUANTIDADE_MAX,
    Math.max(SIMULADO_DIAGNOSTICO_QUANTIDADE_MIN, value),
  );
}

export function isDiagnosticoSessionFiltros(
  filtros: Record<string, unknown> | null | undefined,
): boolean {
  return filtros?.tipo === SIMULADO_DIAGNOSTICO_TIPO;
}
