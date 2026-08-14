/**
 * Ponte entre o hub `/desempenho` e o wizard de caderno.
 *
 * O hub guarda apenas os **títulos dos assuntos marcados**; a contagem de
 * questões e o lote são resolvidos no wizard, onde os módulos acessíveis já
 * estão carregados. Sem isto, a barra teria de adivinhar quantas questões
 * existem e o número exibido poderia divergir do que entra no caderno.
 */
export const DESEMPENHO_SELECAO_STORAGE_KEY = 'avant.caderno.desempenhoSelecao';

/** Teto de assuntos por caderno vindo do hub — mantém o lote legível. */
export const DESEMPENHO_SELECAO_MAX_ASSUNTOS = 6;

export function persistDesempenhoSelecao(assuntos: readonly string[]): void {
  if (typeof window === 'undefined') return;
  const limpos = [...new Set(assuntos.map((a) => a.trim()).filter(Boolean))].slice(
    0,
    DESEMPENHO_SELECAO_MAX_ASSUNTOS,
  );
  try {
    window.sessionStorage.setItem(DESEMPENHO_SELECAO_STORAGE_KEY, JSON.stringify(limpos));
  } catch {
    // Storage indisponível — o wizard segue sem seleção e avisa na tela.
  }
}

export function readDesempenhoSelecao(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(DESEMPENHO_SELECAO_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, DESEMPENHO_SELECAO_MAX_ASSUNTOS);
  } catch {
    return [];
  }
}

export function clearDesempenhoSelecao(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(DESEMPENHO_SELECAO_STORAGE_KEY);
  } catch {
    // Nada a limpar.
  }
}
