function maxWordLength(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  return Math.max(...words.map((w) => w.length));
}

/** Escala tipográfica da Regra de Ouro — evita overflow em textos longos. */
export function getGoldenRuleTitleSizeClass(content: string): string {
  const len = content.trim().length;
  const maxWord = maxWordLength(content.trim());
  // palavra >=13 chars (ex: HIGIENIZAÇÃO) força escala menor
  if (maxWord >= 13 || len > 150) {
    return 'text-base sm:text-lg md:text-xl lg:text-2xl';
  }
  if (maxWord >= 10 || len > 80) {
    return 'text-lg sm:text-xl md:text-2xl lg:text-3xl';
  }
  return 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl';
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
