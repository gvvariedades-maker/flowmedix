/** Código de exibição alinhado ao admin (coluna modulos_estudo.avant_codigo). */
export function formatAvantCodigo(n: number | null | undefined): string | null {
  if (n == null || Number.isNaN(Number(n))) return null;
  return `Q-${n}`;
}
