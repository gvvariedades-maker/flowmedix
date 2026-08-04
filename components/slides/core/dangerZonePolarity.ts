/**
 * Polaridade de um item de danger_zone.
 *
 * `trap` — o item descreve conduta/afirmativa errada (chrome de erro).
 * `valid_conduct` — o item descreve conduta correta que só é "pegadinha" porque o
 * comando é negativo (EXCETO / INCORRETA); marcá-la com X ensinaria prática invertida.
 */
export type DangerZoneItemPolarity = 'trap' | 'valid_conduct';

export type DangerZoneItemLike = {
  label?: string;
  title?: string;
  correct?: string;
};

export type DangerZoneOptionLike = {
  id?: string;
  text?: string;
  is_correct?: boolean;
};

export type DangerZonePolarityContext = {
  instruction?: string;
  options?: DangerZoneOptionLike[];
};

const NEGATIVE_COMMAND_RE = /exceto|incorret/i;
const NAMED_LETTER_RE = /\b(?:alternativa|letra|item|op(?:ç|c)(?:ão|ao))\s+\(?([a-e])\)?\b/i;
const LEADING_LETTER_RE = /^\s*\(?([a-e])\)?\s*[)\-–—.:]/i;
const VALID_CONDUCT_RE = /^\s*(?:afirmativa|assertiva|alternativa|conduta|prática|pratica)\s+corret/i;

/** Comando negativo: os distratores descrevem conduta correta e o gabarito é a exceção. */
export function isNegativeCommandQuestion(instruction?: string): boolean {
  return Boolean(instruction && NEGATIVE_COMMAND_RE.test(instruction));
}

/** Letra da alternativa citada no rótulo do item ("Letra A — …", "B) …"). */
export function extractOptionLetter(label?: string): string | null {
  if (!label) return null;
  const match = NAMED_LETTER_RE.exec(label) ?? LEADING_LETTER_RE.exec(label);
  return match ? match[1].toUpperCase() : null;
}

function buildOptionCorrectness(options: DangerZoneOptionLike[]): Map<string, boolean> {
  const byLetter = new Map<string, boolean>();
  options.forEach((option, index) => {
    const rawId = typeof option?.id === 'string' ? option.id.trim() : '';
    const letter = /^[a-e]$/i.test(rawId)
      ? rawId.toUpperCase()
      : String.fromCharCode(65 + index);
    byLetter.set(letter, option?.is_correct === true);
  });
  return byLetter;
}

function describesValidConduct(correct?: string): boolean {
  return Boolean(correct && VALID_CONDUCT_RE.test(correct));
}

/**
 * Deriva a polaridade por item em runtime, a partir do enunciado + alternativas.
 * Fora de comando negativo tudo é `trap` — comportamento histórico dos moldes.
 */
export function resolveDangerZoneItemPolarities(
  items: DangerZoneItemLike[] | undefined,
  context?: DangerZonePolarityContext,
): DangerZoneItemPolarity[] {
  const list = Array.isArray(items) ? items : [];
  if (!isNegativeCommandQuestion(context?.instruction)) {
    return list.map(() => 'trap');
  }

  const options = Array.isArray(context?.options) ? context.options : [];
  const correctness = buildOptionCorrectness(options);
  const hasGabarito = [...correctness.values()].some(Boolean);

  return list.map((item) => {
    const letter = extractOptionLetter(item?.label ?? item?.title);
    if (hasGabarito && letter && correctness.has(letter)) {
      // Comando negativo: o gabarito é a conduta errada; o resto é conduta válida.
      return correctness.get(letter) ? 'trap' : 'valid_conduct';
    }
    return describesValidConduct(item?.correct) ? 'valid_conduct' : 'trap';
  });
}
