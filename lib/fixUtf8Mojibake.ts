/**
 * Recupera texto que era UTF-8 válido mas foi interpretado byte a byte como Latin-1
 * (comum ao copiar de editores/PDFs ou de fontes que decodificam errado).
 * Ex.: "NÃ£o" → "Não", "HistÃ³ria" → "História".
 *
 * Não altera strings que já têm codepoints > U+00FF (ex.: emoji).
 * Evita estragar texto já correto: se o "reagrupar bytes" gerar U+FFFD, mantém o original.
 */
function utf8MisreadAsLatin1PairCount(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length - 1; i++) {
    const a = s.charCodeAt(i);
    const b = s.charCodeAt(i + 1);
    if (a === 0xc3 && b >= 0x80 && b <= 0xbf) n++;
    if (a === 0xc2 && b >= 0x80 && b <= 0xbf) n++;
  }
  return n;
}

export function tryRecoverUtf8FromLatin1Misread(text: string): string {
  if (!text || text.length < 2) return text;

  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 255) return text;
  }

  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) {
    bytes[i] = text.charCodeAt(i);
  }

  const recovered = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

  if (recovered === text || recovered.includes('\uFFFD')) return text;

  const before = utf8MisreadAsLatin1PairCount(text);
  const after = utf8MisreadAsLatin1PairCount(recovered);

  if (before >= 1 && after < before) return recovered;

  return text;
}
