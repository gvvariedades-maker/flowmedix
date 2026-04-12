/**
 * Preferência global de tamanho de texto (base `rem` via `font-size` no `html`).
 * Persistida em localStorage — mesma chave no script inline do layout (evita FOUC).
 */

export const TEXT_SIZE_STORAGE_KEY = 'avant-text-size-step';

/** Quantidade de níveis (índices 0 .. length-1). */
export const TEXT_SIZE_STEP_COUNT = 5;

/** Índice padrão = 100% (Padrão). */
export const TEXT_SIZE_STEP_DEFAULT = 1;

/** Percentuais do `font-size` do elemento `html` (escala tudo que usa `rem` no Tailwind). */
export const TEXT_SIZE_HTML_FONT_PERCENT = [
  '92.5%',
  '100%',
  '107.5%',
  '115%',
  '122.5%',
] as const;

export const TEXT_SIZE_LABELS_PT: readonly string[] = [
  'Menor',
  'Padrão',
  'Médio',
  'Grande',
  'Maior',
];

export function clampTextSizeStep(n: number): number {
  if (Number.isNaN(n)) return TEXT_SIZE_STEP_DEFAULT;
  return Math.max(0, Math.min(TEXT_SIZE_STEP_COUNT - 1, Math.floor(n)));
}

export function getFontSizePercentForStep(step: number): string {
  const i = clampTextSizeStep(step);
  return TEXT_SIZE_HTML_FONT_PERCENT[i] ?? TEXT_SIZE_HTML_FONT_PERCENT[TEXT_SIZE_STEP_DEFAULT];
}

export function getLabelForStep(step: number): string {
  const i = clampTextSizeStep(step);
  return TEXT_SIZE_LABELS_PT[i] ?? TEXT_SIZE_LABELS_PT[TEXT_SIZE_STEP_DEFAULT];
}

/** Script mínimo para `next/script` strategy="beforeInteractive" (sincronizado com as constantes acima). */
export function buildTextSizeInitScript(): string {
  const key = TEXT_SIZE_STORAGE_KEY;
  const percents = JSON.stringify([...TEXT_SIZE_HTML_FONT_PERCENT]);
  const d = TEXT_SIZE_STEP_DEFAULT;
  return `(function(){try{var k=${JSON.stringify(key)};var p=${percents};var d=${d};var r=localStorage.getItem(k);var i=r==null?d:parseInt(r,10);if(isNaN(i)||i<0||i>=p.length)i=d;document.documentElement.style.fontSize=p[i];}catch(e){}})();`;
}
