/**
 * Contrato canônico para slides premium — gabarito em danger_zone e detecção semântica.
 * @see docs/PACOTE_PREMIUM_CHECKLIST.md § Qualidade pedagógica por ramos
 */

export type GabaritoLetter = 'A' | 'B' | 'C' | 'D' | 'E';

const GABARITO_LETTER_RE = /gabarito:?\s*(?:letra\s*)?([A-E])\b/i;

const IPCS_SIGNATURE =
  /\b(bundle|ipcs|cvc|cateter venoso central|barreira estéril máxima|barreira esteril maxima|remoção precoce)\b/i;
const IPCS_ANCHOR =
  /\b(ipcs|cvc|cateter venoso central|corrente sangu[ií]nea|barreira est[ée]ril|bundle|hemodi[aá]lise|hemodialise|insufici[eê]ncia renal|via intravenosa central|intravenosa central|escolha do cateter|cateter recomendado)\b/i;

/** Formato canônico para danger_zone.items[].correct (arena / compare). */
export function formatGabaritoCorrect(letter: string, explanation: string): string {
  const id = letter.trim().toUpperCase();
  const text = explanation.trim();
  if (!text) return `Gabarito letra ${id}`;
  return `Gabarito letra ${id} — ${text}`;
}

/** Extrai letra do gabarito em `correct` (aceita legado `Gabarito B —` e `Gabarito letra B —`). */
export function parseGabaritoLetter(correct: string | undefined | null): GabaritoLetter | null {
  if (!correct?.trim()) return null;
  const m = correct.match(GABARITO_LETTER_RE);
  return m ? (m[1].toUpperCase() as GabaritoLetter) : null;
}

/** Remove prefixo "Gabarito … —" deixando só a explicação. */
export function stripGabaritoPrefix(correct: string): string {
  return correct
    .replace(/^Gabarito:?\s*(?:letra\s*)?[A-E]\s*[—–-]\s*/i, '')
    .replace(/^Gabarito:?\s*/i, '')
    .trim();
}

export function hasInstructionArtifacts(instruction: string): boolean {
  return (
    /\b\d{3,4}\)\s*(\d{3,4}\)|$)/.test(instruction) ||
    /^\s*\d{3,4}\)/m.test(instruction) ||
    /\(\s*\d{3,4}\s*\)/.test(instruction)
  );
}

/** Slides citam vocabulário IPCS/CVC sem âncora no enunciado. */
export function detectSlideTopicDrift(instruction: string, slides: unknown): boolean {
  const slideText = JSON.stringify(slides ?? '');
  return IPCS_SIGNATURE.test(slideText) && !IPCS_ANCHOR.test(instruction);
}

/**
 * Detecta justificativas recicladas em `danger_zone.items[].correct`.
 * Anti-reciclagem: cada alternativa errada deve ter explicação específica —
 * dois cards não podem compartilhar o mesmo texto de gabarito (descontando o prefixo).
 */
export function detectDuplicateDangerJustifications(slides: unknown): {
  duplicate: boolean;
  total: number;
  unique: number;
} {
  const slideList = Array.isArray(slides) ? slides : [];
  const dz = slideList.find(
    (s) => s && typeof s === 'object' && (s as { type?: string }).type === 'danger_zone',
  ) as { items?: { correct?: string }[] } | undefined;

  const explanations = (dz?.items ?? [])
    .map((i) => stripGabaritoPrefix((i.correct ?? '').trim()).toLowerCase())
    .filter((t) => t.length > 0);

  const unique = new Set(explanations);
  return {
    duplicate: unique.size < explanations.length,
    total: explanations.length,
    unique: unique.size,
  };
}

type OptionLike = { id?: string; is_correct?: boolean };

/** Letra gabarito da questão vs. letras parseadas em danger_zone.items[].correct. */
export function detectDangerGabaritoMismatch(
  options: OptionLike[] | undefined,
  slides: unknown,
): { mismatch: boolean; unparseable: boolean; expected?: string; parsed?: string } {
  const correctId = options?.find((o) => o.is_correct)?.id?.toUpperCase();
  if (!correctId) return { mismatch: false, unparseable: false };

  const slideList = Array.isArray(slides) ? slides : [];
  const dz = slideList.find(
    (s) => s && typeof s === 'object' && (s as { type?: string }).type === 'danger_zone',
  ) as { items?: { correct?: string }[] } | undefined;

  const items = dz?.items ?? [];
  const letters = items
    .map((i) => parseGabaritoLetter(i.correct))
    .filter((l): l is GabaritoLetter => l !== null);

  if (letters.length === 0 && items.some((i) => i.correct?.trim())) {
    return { mismatch: false, unparseable: true, expected: correctId };
  }

  const unique = [...new Set(letters)];
  if (unique.length === 0) return { mismatch: false, unparseable: false, expected: correctId };

  const parsed = unique.length === 1 ? unique[0] : unique.join('/');
  return {
    mismatch: unique.length > 1 || (unique[0] !== correctId && unique.length === 1),
    unparseable: false,
    expected: correctId,
    parsed,
  };
}

const CANONICAL_SLIDE_TYPES = [
  'concept_map',
  'golden_rule',
  'logic_flow',
  'danger_zone',
] as const;

const GENERIC_FOOTER_RE =
  /^(regra|footer|completar|ver exemplo|\[ia\]|fixação:|mnemônico desta questão)/i;

const MIN_FOOTER_STRATEGY_LEN = 12;

function slideByType(slides: unknown, type: string): { footer_rule?: string } | undefined {
  const slideList = Array.isArray(slides) ? slides : [];
  return slideList.find(
    (s) => s && typeof s === 'object' && (s as { type?: string }).type === type,
  ) as { footer_rule?: string } | undefined;
}

/** golden-v1: cada slide do pacote 4/4 deve ter footer_rule com dica de estratégia de prova. */
export function detectMissingFooterRules(slides: unknown): {
  missing: boolean;
  slideTypes: string[];
} {
  const slideTypes: string[] = [];
  for (const type of CANONICAL_SLIDE_TYPES) {
    const slide = slideByType(slides, type);
    const footer = typeof slide?.footer_rule === 'string' ? slide.footer_rule.trim() : '';
    if (!footer) slideTypes.push(type);
  }
  return { missing: slideTypes.length > 0, slideTypes };
}

/** Footers presentes mas genéricos ou curtos demais para estratégia de prova. */
export function detectWeakFooterRules(slides: unknown): {
  weak: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  for (const type of CANONICAL_SLIDE_TYPES) {
    const footer = slideByType(slides, type)?.footer_rule?.trim() ?? '';
    if (!footer) continue;
    if (footer.length < MIN_FOOTER_STRATEGY_LEN) {
      issues.push(`${type}: footer_rule curto (${footer.length} chars)`);
    } else if (GENERIC_FOOTER_RE.test(footer)) {
      issues.push(`${type}: footer_rule genérico`);
    }
  }
  return { weak: issues.length > 0, issues };
}
