/** Escala tipográfica da Regra de Ouro — evita overflow em textos longos. */
export function getGoldenRuleTitleSizeClass(content: string): string {
  const len = content.trim().length;
  if (len <= 80) {
    return 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl';
  }
  if (len <= 150) {
    return 'text-lg sm:text-xl md:text-2xl lg:text-3xl';
  }
  return 'text-base sm:text-lg md:text-xl lg:text-2xl';
}

/** Título da coluna "correto" no layout compare — evita repetir letra + gabarito. */
export function getCompareCorrectColumnTitle(label: string, correctText: string): string {
  const correct = correctText.trim();
  if (!correct) return 'Correto';
  const labelNorm = label.trim().toLowerCase();
  if (/^gabarito\s*:/i.test(correct)) return 'Resposta certa';
  if (labelNorm && correct.toLowerCase().includes(labelNorm)) return 'Resposta certa';
  return label.trim() || 'Correto';
}
