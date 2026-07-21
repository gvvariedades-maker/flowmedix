export type FamilyId =
  | 'legis'
  | 'protocolo'
  | 'calc'
  | 'vf'
  | 'certo_errado'
  | 'conceito'
  | 'text_fragment';

export const FAMILY_LABELS: Record<FamilyId, string> = {
  legis: 'Legislação / dispositivo legal',
  protocolo: 'Protocolo / parâmetro de prova',
  calc: 'Cálculo / dose / infusão',
  vf: 'Afirmativas I / II / III (V/F)',
  certo_errado: 'Certo / Errado',
  conceito: 'Conceito / definição',
  text_fragment: 'Caso clínico (text_fragment)',
};

/** Golden de referência por família (para IA / revisão humana). */
export const FAMILY_GOLDEN_FILE: Record<FamilyId, string> = {
  legis: 'questao-premium-sus-lei-8080-cesgranrio.json',
  protocolo: 'questao-premium-admtec-urgencias-rcp-30-2-aha2020.json',
  calc: 'questao-premium-idecan-calculo-equivalencias-gotas.json',
  vf: 'questao-premium-cpcon-vias-im-vf.json',
  certo_errado: 'questao-premium-idecan-cme-rt-funcao-certo.json',
  conceito: 'questao-premium-fundatec-meningococica-3meses.json',
  text_fragment: 'questao-premium-fepese-anotacao-enfermagem-sae.json',
};

export type QuestionOption = { id: string; text: string; is_correct: boolean };

const TEXT_FRAGMENT_MIN_CHARS = 80;

export { TEXT_FRAGMENT_MIN_CHARS };

/** #1 — caso clínico longo em text_fragment. */
export function hasLongTextFragment(textFragment: string): boolean {
  return textFragment.trim().length > TEXT_FRAGMENT_MIN_CHARS;
}

function countParentheticalVfSlots(instruction: string): number {
  return instruction.match(/\(\s*\)|\(__\)/g)?.length ?? 0;
}

/** #2 — afirmativas I–III/IV ou colunas ( ) V/F com combinação. */
export function isVfFamily(instruction: string): boolean {
  const hasRomanCombination =
    /I\s*[-–]/.test(instruction) &&
    /II\s*[-–]/.test(instruction) &&
    /(III|IV)\s*[-–]/.test(instruction) &&
    /correto o que se afirma|assertivas|afirmativas|julgue os itens/i.test(instruction);

  const hasParentheticalVf =
    countParentheticalVfSlots(instruction) >= 3 &&
    /sequência.{0,24}correta|afirmativas/i.test(instruction) &&
    /verdadeir|fals|\(V\)|registre\s+V|marque\s+V|\bV\s+para|\bF\s+para/i.test(instruction);

  return hasRomanCombination || hasParentheticalVf;
}

/** #3 — duas opções Certo/Errado. */
export function isCertoErradoOptions(options: QuestionOption[]): boolean {
  return (
    options.length === 2 &&
    options.some((o) => /certo/i.test(o.text ?? '')) &&
    options.some((o) => /errado/i.test(o.text ?? ''))
  );
}

/** #4 — comando EXCETO / INCORRETA / INCORRETO. */
export function isExcetoIncorretaCommand(instruction: string): boolean {
  return /\bexceto\b|\bincorreta\b|\bincorreto\b/i.test(instruction);
}

/** #5 — cobrança de dispositivo legal / norma regulatória. */
export function isLegisFamily(instruction: string): boolean {
  const blob = instruction.toLowerCase();
  return (
    /lei\s*(n[ºo°]\s*)?\d|art\.|decreto|cofen|coren|\brdc\b|\banvisa\b|resolução|código de ética|8\.080|7\.498|cf\/88|de acordo com a lei|conforme a lei|dispõe sobre/i.test(
      blob,
    ) ||
    (/sus\b/i.test(blob) && /lei|art\.|decreto|8\.080|7\.498/i.test(blob))
  );
}

/** #6 — pedido explícito de conta / equivalência / infusão calculada. */
export function isCalcFamily(instruction: string): boolean {
  const blob = instruction.toLowerCase();
  return (
    /calcul|gts|gotas|comprimido|equiv|dilui|regra de três|microgotas|quantos?\s+ml|quantas?\s+gotas/i.test(
      blob,
    ) ||
    (/infus/i.test(blob) &&
      /quant|calcule|determine|prescri|gts\/min|ml\/h|mcg\/|\d+\s*(ml|gts)/i.test(blob)) ||
    (/dose/i.test(blob) &&
      /quant|calcule|determine|prescri|mg\/|mcg\/|\d+\s*mg/i.test(blob)) ||
    (/mg|ml/i.test(instruction) && /quant|calcule|determine|prescri/i.test(instruction))
  );
}

/**
 * #7 — sequência ou parâmetro numérico de conduta, sem pedido de conta.
 * Não dispara só por "urgência/emergência" genéricos.
 */
export function isProtocoloFamily(instruction: string): boolean {
  const blob = instruction.toLowerCase();
  if (
    /\brcp\b|parada cardiorrespirat[oó]ria|compress[aã]o.{0,25}ventila|\b30\s*:\s*2\b/i.test(blob)
  ) {
    return true;
  }
  if (
    /sinais\s+vitais|\bspo[_\s]?2\b|satur(a[cç][aã]o)?\s+de\s+oxig/i.test(blob) ||
    /\bfrequ[eê]ncia\s+card[ií]aca\b|\bbpm\b|\bpress[aã]o\s+arterial\b|\bmmhg\b/i.test(blob)
  ) {
    return true;
  }
  if (/\bprotocolo\b|\bpar[aâ]metro\b/i.test(blob)) {
    return true;
  }
  if (/\boxigenoterapia\b|\bfluxo\s+de\s+oxig[eê]nio\b|\bl\/min\b/i.test(blob)) {
    return true;
  }
  return false;
}

/** Funil canônico — manter em paridade com docs/skills/avant-classify-family/SKILL.md */
export function classifyFamily(
  instruction: string,
  _subtopico: string,
  options: QuestionOption[],
  textFragment: string,
): FamilyId {
  if (hasLongTextFragment(textFragment)) return 'text_fragment';
  if (isVfFamily(instruction)) return 'vf';
  if (isCertoErradoOptions(options)) return 'certo_errado';
  if (isExcetoIncorretaCommand(instruction)) return 'certo_errado';
  if (isLegisFamily(instruction)) return 'legis';
  if (isCalcFamily(instruction)) return 'calc';
  if (isProtocoloFamily(instruction)) return 'protocolo';
  return 'conceito';
}

/** Compara meta.family declarada com o funil — null quando alinhado ou ausente. */
export function inferFamilyMismatch(
  declared: FamilyId | string | undefined,
  instruction: string,
  options: QuestionOption[],
  textFragment: string,
): FamilyId | null {
  if (!declared?.trim()) return null;
  const inferred = classifyFamily(instruction, '', options, textFragment);
  return inferred === declared ? null : inferred;
}
