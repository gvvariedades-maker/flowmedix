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
  protocolo: 'questao-premium-urgencias-rcp.json',
  calc: 'questao-premium-idecan-calculo-equivalencias-gotas.json',
  vf: 'questao-premium-cpcon-vias-im-vf.json',
  certo_errado: 'questao-premium-cpcon-poliomielite-pfa-vf.json',
  conceito: 'questao-premium-fundatec-meningococica-3meses.json',
  text_fragment: 'questao-premium-fepese-anotacao-enfermagem-sae.json',
};

export type QuestionOption = { id: string; text: string; is_correct: boolean };

export function classifyFamily(
  instruction: string,
  subtopico: string,
  options: QuestionOption[],
  textFragment: string,
): FamilyId {
  const blob = `${instruction} ${subtopico}`.toLowerCase();

  if (textFragment.trim().length > 80) return 'text_fragment';

  if (
    /I\s*[-–]/.test(instruction) &&
    /II\s*[-–]/.test(instruction) &&
    /(III|IV)\s*[-–]/.test(instruction) &&
    /correto o que se afirma|assertivas|afirmativas|julgue os itens/i.test(instruction)
  ) {
    return 'vf';
  }

  if (
    options.length === 2 &&
    options.some((o) => /certo/i.test(o.text ?? '')) &&
    options.some((o) => /errado/i.test(o.text ?? ''))
  ) {
    return 'certo_errado';
  }

  if (
    /lei\s*(n[ºo°]\s*)?\d|art\.|decreto|cofen|coren|resolução|código de ética|8\.080|7\.498|cf\/88|de acordo com a lei|conforme a lei|dispõe sobre/i.test(
      blob,
    ) ||
    (/sus\b/i.test(blob) && /lei|art\.|decreto|8\.080|7\.498/i.test(blob))
  ) {
    return 'legis';
  }

  if (
    /rcp|compressão|30:2|sinais vitais|oxigen|protocolo|parâmetro|bpm|mmhg|frequência cardíaca|pressão arterial|urgência|emergência/i.test(
      blob,
    )
  ) {
    return 'protocolo';
  }

  if (
    /calcul|dose|gts|gotas|comprimido|infus|equiv|dilui|regra de três|microgotas|quantos?\s+ml|quantas?\s+gotas/i.test(
      blob,
    ) ||
    (/mg|ml/i.test(instruction) && /quant|calcule|determine|prescri/i.test(instruction))
  ) {
    return 'calc';
  }

  return 'conceito';
}
