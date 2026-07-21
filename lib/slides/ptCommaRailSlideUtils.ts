/**
 * Utilitários compartilhados pelo pacote bespoke `pt-comma-rail`
 * (Língua Portuguesa / Pontuação — Elias M08).
 *
 * Regra: nunca hardcode do gabarito nem do texto da questão-âncora — apenas inferência
 * de slot a partir de gatilhos textuais que já vêm no JSON handcraft.
 */

/**
 * Estações do trilho de vírgula (Bechara / Cunha & Cintra · Elias M08).
 * - definicao: o que a pontuação isola.
 * - pergunta_isola: portão — o que a vírgula isola?
 * - trilho_livre: sujeito|verbo sem vírgula no meio.
 * - vocativo: chama o interlocutor (Rita, …).
 * - aposto: termo explicativo entre vírgulas.
 * - restritiva_explicativa: oração adjetiva / vírgula explicativa.
 * - enum_coord: enumeração ou coordenação.
 * - pegadinha: pausa oral ≠ norma (Eu, farei).
 * - generico: fora dos gatilhos acima.
 */
export type PtCommaRailStation =
  | 'definicao'
  | 'pergunta_isola'
  | 'trilho_livre'
  | 'vocativo'
  | 'aposto'
  | 'restritiva_explicativa'
  | 'enum_coord'
  | 'pegadinha'
  | 'generico';

/** Papéis dos steps do logic_flow (trilho letra a letra + gabarito + transferência). */
export type PtCommaStepRole =
  | 'eliminar_letra'
  | 'validar_letra'
  | 'gabarito'
  | 'transferencia'
  | 'generico';

export interface PtCommaChip {
  label: string;
  tone: 'violet' | 'rose' | 'emerald' | 'slate' | 'amber';
}

const NORMALIZE_RE = /[\u0300-\u036f]/g;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(NORMALIZE_RE, '');
}

/** Infere a estação do trilho pelo texto (label + detail). */
export function inferCommaStation(text: string): PtCommaRailStation {
  const t = normalize(text);
  if (
    /\bpegadinha\b|pausa oral|pausa na fala|parece justificar|chute|armadilha|imita pausa/.test(
      t,
    )
  ) {
    return 'pegadinha';
  }
  if (/vocativo|chama|interlocutor|rita\b|v[oó]\b|ol[aá]\b.*,/i.test(t) && /vocativ|chama/.test(t)) {
    return 'vocativo';
  }
  if (/vocativo|chama (a |o )?pessoa|chama algu[eé]m/.test(t)) {
    return 'vocativo';
  }
  if (/aposto|explicativ/.test(t)) {
    return 'aposto';
  }
  if (/restritiv|explicativ|ora[cç][aã]o adjetiv|adjunto adnominal/.test(t)) {
    return 'restritiva_explicativa';
  }
  if (/enumera|coordena|lista|e,/.test(t)) {
    return 'enum_coord';
  }
  if (
    /pergunta|o que isola|o que a virgula|ache a virgula|localize/.test(t)
  ) {
    return 'pergunta_isola';
  }
  if (
    /trilho livre|sujeito\s*[|/]\s*verbo|sujeito.*verbo|nucleo do sujeito|colado ao verbo|proibid/.test(
      t,
    )
  ) {
    return 'trilho_livre';
  }
  if (/pontua[cç][aã]o|virgula|v[ií]rgula|trilho/.test(t)) {
    return 'definicao';
  }
  return 'generico';
}

/** Extrai letra A–E do começo de um step ou label. */
export function extractCommaStepLetter(text: string): string | null {
  const match = text.trim().match(/^([A-E])\s*[:.\-–—]/i);
  return match ? match[1].toUpperCase() : null;
}

/** Papel do step no trilho (para o logic_flow). */
export function inferCommaStepRole(text: string): PtCommaStepRole {
  const t = normalize(text);
  if (/^gabarito\b|letra\s+[a-e]\b.*intact|unica com|marque\s+[a-e]\b|sobrou/.test(t)) {
    return 'gabarito';
  }
  if (
    /em similares|transfer[eê]|em outra banca|em outra prova|mesmo teste|o que isola/.test(t)
  ) {
    return 'transferencia';
  }
  const letter = extractCommaStepLetter(text);
  if (letter) {
    if (
      /barra|barrad|errado|proibid|ferem|corta|mistur|lugar errado|nao separe|nunca/.test(t)
    ) {
      return 'eliminar_letra';
    }
    if (
      /\bpassa\b|ok\b|sobrev|valida|unica|unico|\bcorreto\b|isola certo|intacto|intact/.test(
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
export function commaStationChips(station: PtCommaRailStation): PtCommaChip[] {
  switch (station) {
    case 'definicao':
      return [{ label: 'isola', tone: 'violet' }];
    case 'pergunta_isola':
      return [{ label: 'M08', tone: 'amber' }, { label: 'isola?', tone: 'violet' }];
    case 'trilho_livre':
      return [{ label: 'LIVRE', tone: 'emerald' }, { label: 'S|V', tone: 'slate' }];
    case 'vocativo':
      return [{ label: 'VOC', tone: 'violet' }, { label: 'isola', tone: 'slate' }];
    case 'aposto':
      return [{ label: 'APP', tone: 'violet' }];
    case 'restritiva_explicativa':
      return [{ label: 'OADJ', tone: 'amber' }];
    case 'enum_coord':
      return [{ label: 'enum', tone: 'slate' }];
    case 'pegadinha':
      return [{ label: 'pausa oral', tone: 'rose' }];
    default:
      return [];
  }
}

/** Label curto para o chip do topo do card ou linha do board. */
export function commaStationBadge(station: PtCommaRailStation): string {
  switch (station) {
    case 'definicao':
      return 'DEFINIÇÃO';
    case 'pergunta_isola':
      return 'PORTÃO · O QUE ISOLA?';
    case 'trilho_livre':
      return 'TRILHO LIVRE · S|V';
    case 'vocativo':
      return 'VOCATIVO';
    case 'aposto':
      return 'APOSTO';
    case 'restritiva_explicativa':
      return 'REST/EXPL';
    case 'enum_coord':
      return 'ENUMERAÇÃO';
    case 'pegadinha':
      return 'PEGADINHA';
    default:
      return 'TRILHO';
  }
}

/**
 * Badge do painel golden: "barra" quando corta sujeito|verbo;
 * "isola" / "livre" / "portátil" conforme estágio.
 */
export type PtCommaRowBadge = 'barra' | 'isola' | 'livre' | 'portátil' | 'trilho';

export function inferCommaRowBoardBadge(input: {
  label?: string;
  value?: string;
  emphasis?: string | null;
}): PtCommaRowBadge {
  const emphasis = (input.emphasis ?? 'default').toLowerCase();
  if (emphasis === 'success') return 'isola';
  if (emphasis === 'highlight') return 'portátil';
  if (emphasis === 'alert') return 'barra';

  const text = `${input.label ?? ''} ${input.value ?? ''}`;
  const station = inferCommaStation(text);
  const t = normalize(text);

  if (station === 'pergunta_isola') return 'portátil';
  if (station === 'trilho_livre') return 'livre';
  if (station === 'vocativo' || station === 'aposto') return 'isola';
  if (station === 'pegadinha') return 'barra';
  if (/barra|nao pode|proibid|nunca|tire/.test(t)) return 'barra';
  if (/pode|vocativo|aposto/.test(t)) return 'isola';
  return 'trilho';
}
