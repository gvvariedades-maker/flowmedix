/**
 * Detecta questão do tipo Certo/Errado (duas opções, textos normalizados).
 * Usado pelo player para layout dedicado sem alterar estudo reverso.
 */
export function isCertoErradoQuestion(options: { text: string }[] | undefined): boolean {
  if (!options || options.length !== 2) return false;
  const norm = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '');
  const a = norm(options[0].text);
  const b = norm(options[1].text);
  const set = new Set([a, b]);
  return set.has('certo') && set.has('errado');
}
