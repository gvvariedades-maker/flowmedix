/**
 * Utilitários compartilhados pelo pacote bespoke `pt-clitic-rail`
 * (Língua Portuguesa / Pronomes e colocação pronominal).
 *
 * Regra: nunca hardcode do gabarito nem do texto da questão-âncora — apenas inferência
 * de slot a partir de gatilhos textuais que já vêm no JSON handcraft.
 */

/**
 * Estações do trilho clítico (Bechara / Cunha & Cintra · Elias M09).
 * - definicao: o que é colocação / posição do átono.
 * - pergunta_atrativo: portão — há fator de próclise?
 * - proclise: átono antes (atrativo à esquerda).
 * - enclise: átono depois (início / sem atrativo).
 * - mesoclise: átono no meio (futuro sem atrativo).
 * - infinitivo_participio: portátil — -se no infinitivo ok; particípio sem ênclise.
 * - pegadinha: ênclise automática sem perguntar o atrativo.
 * - generico: fora dos gatilhos acima.
 */
export type PtCliticRailStation =
  | 'definicao'
  | 'pergunta_atrativo'
  | 'proclise'
  | 'enclise'
  | 'mesoclise'
  | 'infinitivo_participio'
  | 'pegadinha'
  | 'generico';

/** Papéis dos steps do logic_flow (trilho letra a letra + gabarito + transferência). */
export type PtCliticStepRole =
  | 'eliminar_letra'
  | 'validar_letra'
  | 'gabarito'
  | 'transferencia'
  | 'generico';

export interface PtCliticChip {
  label: string;
  tone: 'sky' | 'rose' | 'emerald' | 'slate' | 'amber';
}

const NORMALIZE_RE = /[\u0300-\u036f]/g;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(NORMALIZE_RE, '');
}

/** Infere a estação do trilho pelo texto (label + detail). */
export function inferRailStation(text: string): PtCliticRailStation {
  const t = normalize(text);
  if (
    /\bpegadinha\b|enclise automatic|enclisar sem|parece culto|sem pergunta|chute|armadilha/.test(t)
  ) {
    return 'pegadinha';
  }
  if (
    /infinitivo|participio|manifestar-se|dedicado-se|tem-se|sem enclise|portatil/.test(t)
  ) {
    return 'infinitivo_participio';
  }
  if (/mesoclise|futuro|dir-lhe|cantar-se-ia|meio do verbo/.test(t)) {
    return 'mesoclise';
  }
  if (
    /pergunta|ha atrativo|h[aá] atrativo|fator de proclise|atrativo\?|pergunte/.test(t)
  ) {
    return 'pergunta_atrativo';
  }
  if (/proclise|antes do verbo|ja se|quando se|nao me|atrai/.test(t)) {
    return 'proclise';
  }
  if (/enclise|depois do verbo|inicio|diga-me|exigem-se|sem atrativo/.test(t)) {
    return 'enclise';
  }
  if (/colocacao|posicao|atono|obliquo|trilho/.test(t)) {
    return 'definicao';
  }
  return 'generico';
}

/** Extrai letra A–E do começo de um step ou label. */
export function extractStepLetter(text: string): string | null {
  const match = text.trim().match(/^([A-E])\s*[:.\-–—]/i);
  return match ? match[1].toUpperCase() : null;
}

/** Papel do step no trilho (para o logic_flow). */
export function inferStepRole(text: string): PtCliticStepRole {
  const t = normalize(text);
  if (/^gabarito\b|letra\s+[a-e]\b.*embarca|unica que embarca|marque\s+[a-e]\b/.test(t)) {
    return 'gabarito';
  }
  if (
    /em similares|transfer[eê]|em outra banca|em outra prova|antes de enclisar/.test(t)
  ) {
    return 'transferencia';
  }
  const letter = extractStepLetter(text);
  if (letter) {
    if (
      /barra|barrad|errado|proibid|nao admite|precisa proclise|atrai|falha|desvia|nunca|vetad/.test(
        t,
      )
    ) {
      return 'eliminar_letra';
    }
    if (
      /\bpassa\b|ok\b|enclise ok|sobrev|valida|unica|unico|\bcorreto\b|embarca|estacao certa/.test(
        t,
      )
    ) {
      return 'validar_letra';
    }
    return 'eliminar_letra';
  }
  return 'generico';
}

/** Chips descritivos por estação (deck / danger arena). Curtos, sem gabarito. */
export function stationChips(station: PtCliticRailStation): PtCliticChip[] {
  switch (station) {
    case 'definicao':
      return [{ label: 'posição', tone: 'sky' }];
    case 'pergunta_atrativo':
      return [{ label: 'M09', tone: 'amber' }, { label: 'atrativo?', tone: 'sky' }];
    case 'proclise':
      return [{ label: 'PRÓ', tone: 'emerald' }, { label: 'antes', tone: 'slate' }];
    case 'enclise':
      return [{ label: 'ÊN', tone: 'slate' }, { label: 'depois', tone: 'sky' }];
    case 'mesoclise':
      return [{ label: 'MESO', tone: 'amber' }, { label: 'futuro', tone: 'slate' }];
    case 'infinitivo_participio':
      return [{ label: 'inf. ok', tone: 'emerald' }, { label: 'part. ✗', tone: 'rose' }];
    case 'pegadinha':
      return [{ label: 'chute culto', tone: 'rose' }];
    default:
      return [];
  }
}

/** Label curto para o chip do topo do card ou linha do board. */
export function stationBadge(station: PtCliticRailStation): string {
  switch (station) {
    case 'definicao':
      return 'DEFINIÇÃO';
    case 'pergunta_atrativo':
      return 'PORTÃO · ATRATIVO?';
    case 'proclise':
      return 'PRÓCLISE';
    case 'enclise':
      return 'ÊNCLISE';
    case 'mesoclise':
      return 'MESÓCLISE';
    case 'infinitivo_participio':
      return 'PORTÁTIL · INF/PART';
    case 'pegadinha':
      return 'PEGADINHA';
    default:
      return 'TRILHO';
  }
}

/**
 * Badge do painel golden: "barra" quando atrativo exige próclise;
 * "embarca" / "pró" / "ên" / "portátil" conforme estágio.
 */
export type PtCliticRowBadge = 'barra' | 'embarca' | 'pró' | 'ên' | 'portátil' | 'trilho';

export function inferRowBoardBadge(input: {
  label?: string;
  value?: string;
  emphasis?: string | null;
}): PtCliticRowBadge {
  const emphasis = (input.emphasis ?? 'default').toLowerCase();
  if (emphasis === 'success') return 'pró';
  if (emphasis === 'highlight') return 'portátil';
  if (emphasis === 'alert') return 'barra';

  const text = `${input.label ?? ''} ${input.value ?? ''}`;
  const station = inferRailStation(text);
  const t = normalize(text);

  if (station === 'infinitivo_participio' || station === 'pergunta_atrativo') {
    return 'portátil';
  }
  if (station === 'proclise') return 'pró';
  if (station === 'enclise' || station === 'mesoclise') return 'ên';
  if (station === 'pegadinha') return 'barra';
  if (/barra|nao admite|sem enclise|vetad/.test(t)) return 'barra';
  if (/embarca|passa|ok\b/.test(t)) return 'embarca';
  return 'trilho';
}
